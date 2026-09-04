"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { berthOf } from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";
import { makeJadeMaterial } from "@/lib/jade";

/*
 * B3-REV-2 SKELETAL SILK — the cocoon now HANGS: suspended mid-air on
 * silk from an overhead anchor (p1), gravity-taut, and swings with an
 * analytic damped pendulum when pushed. No physics engine — a
 * semi-implicit oscillator (θ'' = −ω₀²θ − 2ζω₀θ', equivalent to
 * θ₀e^(−ζt)cos(ωt+φ)) with impulse stacking on repeated clicks; the
 * whole group (cocoon + threads) rotates about the anchor, so the silk
 * swings WITH the cocoon. Sleep: everything dead still (§5 — the
 * perpetual sway would need its own constitutional exception; not
 * taken). Click = swing (click side sets direction); sustained hover =
 * strand pull; surfaces untouched from B3-REV.
 * B3-REV surface notes (kept): This object's identity lives on its surface, not its
 * silhouette. The three egg-makers, each fixed:
 *   (1) mirror-lit shell → specular/clearcoat cut to ~0; the light now
 *       comes from INSIDE (jade SSS, lib/jade path a) — white jade,
 *       not white plastic
 *   (2) perfect ellipsoid → asymmetric long cocoon (blunt end / pointed
 *       end, ~1.9:1) with a whisper of low-freq noise displacement
 *   (3) no silk → a flow-field of thousands of short thread strokes
 *       baked into normal+roughness maps (multi-directional winding),
 *       plus a fresnel down of stray fibers at grazing angles, plus
 *       3 hanging threads (one merged geometry) and one drawable
 *       strand — 抽丝: revealed along its curve (uProgress + discard,
 *       the same honest move as the film feed; never a translation).
 * Position, orientation and footprint unchanged from the previous
 * version. Sleep is a still frame; the inner light and the pull only
 * run awake. No sound, no bounce, no particles.
 */

const TILT = THREE.MathUtils.degToRad(8);
const HALF_L = 0.38; // 0.76 long axis
const HALF_W = 0.2; // 0.40 short axes → 1.9:1
const B3_LAYER = 3;
// suspension: anchor overhead (top edge of frame), cocoon hangs below
const ANCHOR_Y = 1.18;
const DROP = 0.62; // anchor → cocoon center
// pendulum: slow frequency for a light hanging body, 3–5 visible swings
const OMEGA0 = (Math.PI * 2) / 2.3; // ~2.3s period
const ZETA = 0.13; // underdamped, settles in ~2.5s
const IMPULSE = 0.55; // rad/s per push

function hash3(x: number, y: number, z: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Asymmetric cocoon shell: blunt −X end, pointed +X end, low-freq
 *  noise breaking the mathematical perfection. 64×48 for the SSS. */
function buildShell() {
  const g = new THREE.SphereGeometry(1, 64, 48);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const nx = v.x; // [-1, 1]
    // taper: pointed toward +X, barely eased at −X
    const taper =
      nx > 0 ? 1 - 0.3 * Math.pow(nx, 2.2) : 1 - 0.05 * Math.pow(-nx, 2);
    v.y *= taper;
    v.z *= taper;
    // whisper of low-frequency displacement — cocoon, not potato
    const n =
      hash3(Math.round(v.x * 2.5), Math.round(v.y * 2.5), Math.round(v.z * 2.5)) -
      0.5;
    const len = v.length();
    v.multiplyScalar(1 + n * 0.035);
    if (len > 0) pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.scale(HALF_L, HALF_W, HALF_W);
  g.computeVertexNormals();
  return g;
}

/** Silk winding: a flow field of ~3800 short strokes, base direction
 *  around the long axis with noisy deflection — "wound countless turns",
 *  not a polished face. Height field → normal map + roughness map. */
function makeSilkMaps() {
  const S = 512;
  const h = new Float32Array(S * S);
  let seed = 20260718;
  const rnd = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let k = 0; k < 3800; k++) {
    let x = rnd() * S;
    let y = rnd() * S;
    // direction: mostly along v (winding around the axis), deflected
    const base = Math.PI / 2;
    const defl = (rnd() - 0.5) * 1.4 + Math.sin(x * 0.02) * 0.4;
    const ang = base + defl;
    const len = 14 + rnd() * 26;
    const amp = 0.35 + rnd() * 0.65;
    for (let s = 0; s < len; s++) {
      const xi = Math.round(x) & (S - 1);
      const yi = Math.round(y) & (S - 1);
      h[yi * S + xi] += amp * 0.12;
      x += Math.cos(ang);
      y += Math.sin(ang);
    }
  }
  const normal = document.createElement("canvas");
  const rough = document.createElement("canvas");
  normal.width = normal.height = rough.width = rough.height = S;
  const gn = normal.getContext("2d")!;
  const gr = rough.getContext("2d")!;
  const ni = gn.createImageData(S, S);
  const ri = gr.createImageData(S, S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const i = y * S + x;
      const dx = h[y * S + ((x + 1) & (S - 1))] - h[i];
      const dy = h[((y + 1) & (S - 1)) * S + x] - h[i];
      ni.data[i * 4] = 128 + Math.max(-90, Math.min(90, dx * 140));
      ni.data[i * 4 + 1] = 128 + Math.max(-90, Math.min(90, dy * 140));
      ni.data[i * 4 + 2] = 255;
      ni.data[i * 4 + 3] = 255;
      // matte micro-velvet: high roughness, threads slightly glossier
      const r = 225 - Math.min(60, h[i] * 90);
      ri.data[i * 4] = ri.data[i * 4 + 1] = ri.data[i * 4 + 2] = r;
      ri.data[i * 4 + 3] = 255;
    }
  gn.putImageData(ni, 0, 0);
  gr.putImageData(ri, 0, 0);
  const mk = (c: HTMLCanvasElement) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(3, 2);
    return t;
  };
  return { normalMap: mk(normal), roughnessMap: mk(rough) };
}

/** Suspension silk: 4 strands from the overhead anchor down to the
 *  cocoon's upper surface, taut with a whisper of arc — ONE merged
 *  geometry, part of the swinging group. */
function buildThreads() {
  const parts: THREE.BufferGeometry[] = [];
  const tips: [number, number, number][] = [
    [-0.14, -DROP + HALF_W * 0.72, 0.03],
    [0.1, -DROP + HALF_W * 0.9, -0.05],
    [0.2, -DROP + HALF_W * 0.6, 0.06],
    [-0.02, -DROP + HALF_W * 0.95, 0.09],
  ];
  tips.forEach((tip, i) => {
    const root = new THREE.Vector3((i - 1.5) * 0.02, 0, (i % 2) * 0.015);
    const t = new THREE.Vector3(...tip);
    const mid = root.clone().lerp(t, 0.5).add(new THREE.Vector3(0.008, 0, 0.006));
    const curve = new THREE.CatmullRomCurve3([root, mid, t]);
    parts.push(new THREE.TubeGeometry(curve, 10, 0.0015, 4, false));
  });
  const merged = mergeGeometries(
    parts.map((p) => (p.index ? p.toNonIndexed() : p)),
    false
  )!;
  parts.forEach((p) => p.dispose());
  return merged;
}

/** The drawable strand (抽丝): pre-built along its full curve, revealed
 *  by uPull — the same honesty as the film feed. */
function buildPullStrand() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.18, -DROP - HALF_W * 0.5, 0.05),
    new THREE.Vector3(0.22, -DROP - HALF_W * 0.5 - 0.12, 0.09),
    new THREE.Vector3(0.2, -DROP - HALF_W * 0.5 - 0.28, 0.11),
    new THREE.Vector3(0.16, -DROP - HALF_W * 0.5 - 0.45, 0.1),
  ]);
  return new THREE.TubeGeometry(curve, 24, 0.0016, 4, false);
}

export default function Cocoon({
  position,
}: {
  position: [number, number, number];
}) {
  const { invalidate, camera } = useThree();
  const swing = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);

  const berth = useBenchStore((s) => s.berth);
  const nudgeNonce = useBenchStore((s) => s.b3PullNonce); // nameplate 轻推

  const [hover, setHover] = useState(false);
  /* The store's hovered id, not just this component's own pointer
   *  state. The work grid puts a transparent cell over the canvas and
   *  takes no pointer events in 3D, so this object's own onPointerOver
   *  can never fire there; it still can on a case page, where the
   *  object is mounted on its own. Reading both means one branch works
   *  in each place and neither has to know which place it is in.
   *  Movement already did this for the same reason. */
  const hoveredId = useBenchStore((s) => s.hovered);
  const awake = hover || hoveredId === "skeletal-silk" || berth === berthOf("skeletal-silk");

  const shellGeom = useMemo(buildShell, []);
  const silkMaps = useMemo(makeSilkMaps, []);
  const threadsGeom = useMemo(buildThreads, []);
  const strandGeom = useMemo(buildPullStrand, []);

  // damped pendulum state: semi-implicit integration, impulse-stackable
  const theta = useRef(0);
  const omega = useRef(0);
  const glowKick = useRef(false);
  const pull = useRef(0);
  const pullTarget = useRef(0);
  const pullUniform = useMemo(() => ({ uPull: { value: 0 } }), []);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useRef(false);

  const shellMat = useMemo(() => {
    const m = makeJadeMaterial({ thickness: 0.5, roughness: 0.68 });
    m.clearcoat = 0;
    m.specularIntensity = 0.12;
    m.attenuationColor = new THREE.Color("#E4D3A8");
    m.normalMap = silkMaps.normalMap;
    m.normalScale = new THREE.Vector2(0.35, 0.35);
    m.roughnessMap = silkMaps.roughnessMap;
    m.onBeforeCompile = (s) => {
      s.fragmentShader = s.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        {
          vec3 V = normalize(vViewPosition);
          float fr = pow(1.0 - clamp(abs(dot(normal, V)), 0.0, 1.0), 3.0);
          totalEmissiveRadiance += vec3(0.95, 0.91, 0.82) * fr * 0.11;
        }`
      );
    };
    return m;
  }, [silkMaps]);

  const strandMat = useMemo(() => {
    const m = new THREE.MeshBasicMaterial({
      color: "#F3EEE2",
      transparent: true,
      opacity: 0.65,
    });
    m.onBeforeCompile = (s) => {
      s.uniforms.uPull = pullUniform.uPull;
      s.fragmentShader =
        "uniform float uPull;\n" +
        s.fragmentShader.replace(
          "#include <clipping_planes_fragment>",
          `#include <clipping_planes_fragment>
           if (vUv.x > uPull) discard;`
        );
    };
    m.defines = { ...m.defines, USE_UV: "" };
    return m;
  }, [pullUniform]);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    camera.layers.enable(B3_LAYER);
    if (light.current) light.current.layers.set(B3_LAYER);
  }, [camera]);

  useEffect(() => {
    document.body.style.cursor = hover ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hover]);

  /** Click = a push. Side of the hit sets the direction; mid-swing
   *  clicks stack a new impulse smoothly (state carries over). */
  const nudge = (dir: number) => {
    if (reduced.current) return; // reduced-motion: no swinging
    omega.current += IMPULSE * dir;
    invalidate();
  };

  const firstNonce = useRef(true);
  useEffect(() => {
    if (firstNonce.current) {
      firstNonce.current = false;
      return;
    }
    nudge(omega.current >= 0 ? 1 : -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nudgeNonce]);

  // sustained hover = the strand draws out; leave = it returns
  useEffect(() => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    if (awake && hover) {
      hoverTimer.current = setTimeout(() => {
        pullTarget.current = 1;
        invalidate();
      }, 600);
    } else {
      pullTarget.current = 0;
      invalidate();
    }
    return () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    };
  }, [hover, awake, invalidate]);

  useFrame((_, delta) => {
    const swinging =
      Math.abs(theta.current) > 0.0006 || Math.abs(omega.current) > 0.0006;
    const pulling = Math.abs(pullTarget.current - pull.current) > 0.002;
    // transition answer beat (看透): the SAME inner light, pushed to its
    // extreme — no new mechanism, no bloom, just the lantern turned up
    const glowing =
      useBenchStore.getState().transitionId === "skeletal-silk";
    // §3 secondary: the suspension answers the lantern — one tiny
    // lagged sway through the EXISTING pendulum (silk inertia)
    if (glowing && !glowKick.current) {
      glowKick.current = true;
      omega.current += 0.05;
    }
    if (!glowing && glowKick.current) glowKick.current = false;
    const lightGoal = glowing ? 1.3 : awake ? 0.16 : 0;
    const lightBusy =
      Math.abs((light.current?.intensity ?? 0) - lightGoal) > 0.003;
    // dormant and settled: stop integrating entirely — no idle spin
    if (!swinging && !pulling && !lightBusy && !awake) return;

    let busy = false;
    const dt = Math.min(delta, 1 / 30);

    // pendulum: θ'' = −ω₀²θ − 2ζω₀θ' (semi-implicit Euler)
    if (swinging) {
      omega.current +=
        (-OMEGA0 * OMEGA0 * theta.current -
          2 * ZETA * OMEGA0 * omega.current) *
        dt;
      theta.current += omega.current * dt;
      if (
        Math.abs(theta.current) < 0.0006 &&
        Math.abs(omega.current) < 0.0006
      ) {
        theta.current = 0;
        omega.current = 0; // settled: back to a true still frame
      }
      if (swing.current) {
        swing.current.rotation.z = theta.current;
        swing.current.rotation.x = theta.current * 0.14; // a breath of 3D
      }
      busy = true;
    }

    if (light.current && lightBusy) {
      light.current.intensity +=
        (lightGoal - light.current.intensity) *
        (reduced.current ? 1 : glowing ? 0.35 : 0.07);
      busy = true;
    }

    if (pulling) {
      if (reduced.current) pull.current = pullTarget.current;
      else
        pull.current +=
          (pullTarget.current - pull.current) * (1 - Math.exp(-dt / 0.22));
      pullUniform.uPull.value = pull.current;
      busy = true;
    }

    if (busy) invalidate();
  });

  return (
    <group position={[position[0], ANCHOR_Y, position[2]]}>
      {/* the swinging group: anchor at origin, everything below rides θ */}
      <group ref={swing}>
        <group
          onPointerOver={() => {
            setHover(true);
            invalidate();
          }}
          onPointerOut={() => {
            setHover(false);
            invalidate();
          }}
          onClick={(e) => {
            e.stopPropagation();
            const dir = e.point.x < position[0] ? 1 : -1;
            nudge(dir);
          }}
        >
          {/* the shell, hanging at the end of the drop */}
          <mesh
            position={[0, -DROP, 0]}
            rotation={[0, 0, TILT]}
            geometry={shellGeom}
            onUpdate={(m) => m.layers.enable(B3_LAYER)}
          >
            <primitive object={shellMat} attach="material" />
          </mesh>
          <pointLight
            ref={light}
            position={[0, -DROP, 0]}
            color="#FFD9A8"
            intensity={0}
            distance={0.9}
            decay={2}
          />
          {/* suspension silk: taut from anchor to shell, swings along */}
          <mesh geometry={threadsGeom}>
            <meshBasicMaterial color="#F3EEE2" transparent opacity={0.5} />
          </mesh>
          {/* the drawable strand, trailing below, hover-revealed */}
          <mesh geometry={strandGeom} material={strandMat} />
        </group>
      </group>

      {/* No contact shadow. It sat on the wooden turntable, where a
          disc of ink read as the object touching the wood. The rail
          stands the instruments on paper against a single horizon rule,
          and the disc scales with the object, so at stage size it was a
          grey ellipse across a third of the frame. STYLE: no shadows. */}
    </group>
  );
}
