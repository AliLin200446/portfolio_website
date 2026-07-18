"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { berthOf } from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";
import { makeJadeMaterial } from "@/lib/jade";

/*
 * B3-REV SKELETAL SILK — the cocoon reads as a COCOON now, not a
 * polished egg. This object's identity lives on its surface, not its
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
const CENTER_Y = 0.21;
const B3_LAYER = 3;

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

/** Hanging threads: 3 strands, uneven lengths, gentle arcs, ONE merged
 *  geometry (the spec's only easy trap: never one mesh per strand). */
function buildThreads() {
  const parts: THREE.BufferGeometry[] = [];
  const defs: { root: [number, number, number]; tip: [number, number, number] }[] = [
    { root: [-0.1, HALF_W * 0.9, 0.05], tip: [-0.16, HALF_W * 0.9 + 0.34, 0.1] },
    { root: [0.08, HALF_W * 0.95, -0.03], tip: [0.16, HALF_W * 0.95 + 0.26, -0.09] },
    { root: [-0.24, HALF_W * 0.7, -0.06], tip: [-0.38, HALF_W * 0.7 + 0.2, -0.12] },
  ];
  for (const d of defs) {
    const mid = new THREE.Vector3(
      (d.root[0] + d.tip[0]) / 2 + 0.02,
      (d.root[1] + d.tip[1]) / 2,
      (d.root[2] + d.tip[2]) / 2 + 0.03
    );
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(...d.root),
      mid,
      new THREE.Vector3(...d.tip),
    ]);
    parts.push(new THREE.TubeGeometry(curve, 10, 0.0016, 4, false));
  }
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
    new THREE.Vector3(0.3, HALF_W * 0.55, 0.08),
    new THREE.Vector3(0.42, HALF_W * 0.55 + 0.1, 0.16),
    new THREE.Vector3(0.5, HALF_W * 0.55 + 0.3, 0.2),
    new THREE.Vector3(0.53, HALF_W * 0.55 + 0.52, 0.18),
  ]);
  return new THREE.TubeGeometry(curve, 24, 0.0016, 4, false);
}

export default function Cocoon({
  position,
}: {
  position: [number, number, number];
}) {
  const { invalidate, camera } = useThree();
  const group = useRef<THREE.Group>(null);
  const threads = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);

  const berth = useBenchStore((s) => s.berth);
  const pullNonce = useBenchStore((s) => s.b3PullNonce);

  const [hover, setHover] = useState(false);
  const awake = hover || berth === berthOf("skeletal-silk");

  const shellGeom = useMemo(buildShell, []);
  const silkMaps = useMemo(makeSilkMaps, []);
  const threadsGeom = useMemo(buildThreads, []);
  const strandGeom = useMemo(buildPullStrand, []);

  const pull = useRef(0);
  const pullTarget = useRef(0);
  const pullUniform = useMemo(() => ({ uPull: { value: 0 } }), []);
  const reduced = useRef(false);

  const shellMat = useMemo(() => {
    // jade base (Aura path a) with the mirror KILLED: identity comes
    // from subsurface glow, not surface specular
    const m = makeJadeMaterial({ thickness: 0.5, roughness: 0.68 });
    m.clearcoat = 0;
    m.specularIntensity = 0.12;
    m.attenuationColor = new THREE.Color("#E4D3A8"); // natural silk warmth
    m.normalMap = silkMaps.normalMap;
    m.normalScale = new THREE.Vector2(0.35, 0.35);
    m.roughnessMap = silkMaps.roughnessMap;
    m.onBeforeCompile = (s) => {
      // grazing-angle fiber down: the halo of stray silk, very faint
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
      s.vertexShader = s.vertexShader; // vUv comes from USE_UV
    };
    // ensure vUv varying exists on basic material
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

  // 抽丝 toggle: click / nameplate Enter; leaving retracts
  const togglePull = () => {
    pullTarget.current = pullTarget.current > 0.5 ? 0 : 1;
    invalidate();
  };
  const firstNonce = useRef(true);
  useEffect(() => {
    if (firstNonce.current) {
      firstNonce.current = false;
      return;
    }
    togglePull();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pullNonce]);

  useEffect(() => {
    if (!awake && pullTarget.current > 0) {
      pullTarget.current = 0; // leaving: the strand returns
      invalidate();
    }
  }, [awake, invalidate]);

  useFrame((state, delta) => {
    const sleeping =
      !awake &&
      pull.current < 0.001 &&
      (light.current?.intensity ?? 0) < 0.004;
    if (sleeping) return; // dormant: a still frame, zero work

    let busy = false;

    // inner glow: the SSS reads "something inside" — 1.2s ease on wake
    if (light.current) {
      const target = awake ? 0.16 : 0;
      if (Math.abs(light.current.intensity - target) > 0.003) {
        light.current.intensity += (target - light.current.intensity) * (reduced.current ? 1 : 0.07);
        busy = true;
      }
    }

    // 抽丝: reveal along the curve, ease-out, no bounce; reverse on leave
    const diff = pullTarget.current - pull.current;
    if (Math.abs(diff) > 0.002) {
      if (reduced.current) pull.current = pullTarget.current;
      else pull.current += diff * (1 - Math.exp(-delta / 0.22));
      pullUniform.uPull.value = pull.current;
      busy = true;
    }

    // hanging threads: a whisper of drift, awake only (§5 exemption)
    if (threads.current) {
      const targetRot = awake && !reduced.current
        ? Math.sin(state.clock.elapsedTime * Math.PI * 2 * 0.3) * 0.006
        : 0;
      threads.current.rotation.z = targetRot;
      if (awake && !reduced.current) busy = true;
    }

    if (group.current)
      group.current.position.y = position[1] + (awake ? 0.01 : 0);
    if (busy) invalidate();
  });

  return (
    <group position={position}>
      <group
        ref={group}
        rotation={[0, 0, TILT]}
        onPointerOver={() => {
          setHover(true);
          invalidate();
        }}
        onPointerOut={() => {
          setHover(false);
          invalidate();
        }}
        onClick={togglePull}
      >
        {/* the shell: jade SSS under a wound-silk surface, mirror killed */}
        <mesh
          position={[0, CENTER_Y, 0]}
          geometry={shellGeom}
          onUpdate={(m) => m.layers.enable(B3_LAYER)}
        >
          <primitive object={shellMat} attach="material" />
        </mesh>
        <pointLight
          ref={light}
          position={[0, CENTER_Y, 0]}
          color="#FFD9A8"
          intensity={0}
          distance={0.9}
          decay={2}
        />

        {/* hanging threads: one merged geometry, three strands */}
        <group ref={threads} position={[0, CENTER_Y, 0]}>
          <mesh geometry={threadsGeom}>
            <meshBasicMaterial color="#F3EEE2" transparent opacity={0.5} />
          </mesh>
          {/* the drawable strand, revealed by uPull */}
          <mesh geometry={strandGeom} material={strandMat} />
        </group>
      </group>

      {/* contact shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#1a1714" transparent opacity={0.14} />
      </mesh>
    </group>
  );
}
