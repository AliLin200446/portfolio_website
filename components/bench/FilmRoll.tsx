"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { berthOf } from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";

/*
 * B1-REV LATENT — the film canister, rebuilt so it reads as FILM, not a
 * knife. The three knife-makers, each fixed:
 *   (1) solid black wedge ending in a point  → curved ribbon with a
 *       leader tongue, fed along a Catmull-Rom path
 *   (2) single sprocket row (= serrated spine) → double rows, always
 *   (3) rigid plane (= stiff blade)           → the ribbon is BUILT bent
 * Shape borrowed from a real 135 cartridge (double sprockets, leader
 * tongue, spool hub, felt exit lip, cut-edge highlight); color stays
 * alilinlab STYLE v2 — ink shell, warm-neutral base, no stock silver/
 * orange, no water hues.
 * Interaction: click the canister = feed the film out (curve-reveal via
 * uProgress + fragment discard — never a translating rigid plane, that
 * is drawing a knife again). Sleep state is retracted: a short two-row
 * leader stub. Amber dots are gone; the warmth moved to where it
 * physically lives — sprocket back-light (emissive rings, wake-only).
 * halation-ready: the emulsion material is the hook point for the
 * production pass (幕二), nothing mounted here.
 */

const SHELL_H = 0.42;
const SHELL_R = 0.11;
const EXIT_Y = 0.21;
/** the table top sits at y=0.01; the ribbon keeps clear of it with room
 *  for its own half-width and the lean the side vector adds */
const RIBBON_FLOOR = 0.055;
const RIBBON_LEN = 1.35;
const RIBBON_W = 0.3;
const RETRACTED = 0.15; // ~1.5 frames of leader showing
const TAU_OUT = 0.24; // feed ~1s to settle, ease-out, no overshoot
const TAU_IN = 0.17; // retract snappier ~0.7s

/** Shell profile: body + rolled lips top and bottom, one lathe. */
function shellGeometry() {
  const pts = [
    [0, 0], [0.09, 0], [SHELL_R + 0.005, 0.006], [SHELL_R + 0.006, 0.014],
    [SHELL_R, 0.026], [SHELL_R, SHELL_H - 0.026], [SHELL_R + 0.006, SHELL_H - 0.014],
    [SHELL_R + 0.005, SHELL_H - 0.006], [0.045, SHELL_H], [0, SHELL_H],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  return new THREE.LatheGeometry(pts, 36);
}

/** Shell roughness: matte ink everywhere, one low-rough rim along each
 *  lip — the edge light that turns soft black cloth into a hard can. */
function makeShellRoughness() {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 64;
  const g = c.getContext("2d")!;
  g.fillStyle = "#c8c8c8"; // high roughness
  g.fillRect(0, 0, 8, 64);
  g.fillStyle = "#3c3c3c"; // low-rough rims at the lips
  g.fillRect(0, 0, 8, 5);
  g.fillRect(0, 59, 8, 5);
  const t = new THREE.CanvasTexture(c);
  return t;
}

/** Label band: ink on ink + one copper hairline. The legal-type moment. */
function makeLabelTexture() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 128;
  const g = c.getContext("2d")!;
  g.fillStyle = "#141416";
  g.fillRect(0, 0, 1024, 128);
  g.strokeStyle = "#8C6A3F"; // the copper hairline
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, 92);
  g.lineTo(1024, 92);
  g.stroke();
  g.fillStyle = "#3b3b3e"; // ink-on-ink type
  g.font = "500 44px var(--font-geist-mono), ui-monospace, monospace";
  g.textBaseline = "middle";
  g.fillText("LATENT · 135 · FILM PHYSICS", 48, 56);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

/** One repeating film segment (one 8-perf frame), three aligned maps:
 *  albedo (warm-neutral base ≤5% + cut-edge lines), alpha (double
 *  sprocket rows), emissive (faint warm rings around each perf). */
function makeFilmMaps() {
  const W = 256, H = 256;
  const albedo = document.createElement("canvas");
  const alpha = document.createElement("canvas");
  const emissive = document.createElement("canvas");
  [albedo, alpha, emissive].forEach((c) => {
    c.width = W;
    c.height = H;
  });
  const ga = albedo.getContext("2d")!;
  const gp = alpha.getContext("2d")!;
  const ge = emissive.getContext("2d")!;

  // albedo: ink with a ≤5% warm cast (copper family, not water)
  ga.fillStyle = "#1d1a17";
  ga.fillRect(0, 0, W, H);
  // cut-edge highlight lines along both long edges
  ga.fillStyle = "#57524b";
  ga.fillRect(0, 0, W, 3);
  ga.fillRect(0, H - 3, W, 3);

  // alpha: white = keep, black = hole (alphaTest, no transparency sort)
  gp.fillStyle = "#ffffff";
  gp.fillRect(0, 0, W, H);
  ge.fillStyle = "#000000";
  ge.fillRect(0, 0, W, H);

  const drawPerf = (cx: number, cy: number) => {
    const w = 22, h = 16, r = 5;
    gp.fillStyle = "#000000";
    gp.beginPath();
    gp.roundRect(cx - w / 2, cy - h / 2, w, h, r);
    gp.fill();
    // warm back-light: a faint ring where light escapes the hole
    ge.strokeStyle = "#FFB46B";
    ge.lineWidth = 5;
    ge.beginPath();
    ge.roundRect(cx - w / 2 - 2, cy - h / 2 - 2, w + 4, h + 4, r + 2);
    ge.stroke();
  };
  // DOUBLE rows — the film signature. One row = a knife spine.
  for (let i = 0; i < 8; i++) {
    const cx = 16 + i * 32;
    drawPerf(cx, 28);
    drawPerf(cx, H - 28);
  }

  const mk = (c: HTMLCanvasElement, srgb = false) => {
    const t = new THREE.CanvasTexture(c);
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = THREE.RepeatWrapping;
    return t;
  };
  return { map: mk(albedo, true), alphaMap: mk(alpha), emissiveMap: mk(emissive, true) };
}

/** The ribbon: a plane pre-bent along a hand-laid curve — hidden inside
 *  the shell, out through the felt lip, one generous arc, a subtle sag.
 *  aU ∈ [0,1] rides along it for the reveal. The last 8% tapers into an
 *  asymmetric rounded leader tongue. */
function buildRibbon() {
  // Half the previous reach: the tail used to run to x=1.3, it now
  // stops at 0.65. Only the along-path axes are halved — the sag and
  // the sideways drift keep their proportion to the shorter run, so the
  // curve reads as the same ribbon cut shorter rather than a squashed
  // one, and the lowest point rises further clear of the table.
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.02, EXIT_Y, 0),
    new THREE.Vector3(0.08, EXIT_Y, 0.01),
    new THREE.Vector3(0.25, EXIT_Y - 0.01, 0.03),
    new THREE.Vector3(0.46, EXIT_Y - 0.035, 0.05),
    new THREE.Vector3(0.65, EXIT_Y - 0.065, 0.06),
  ]);
  const L_SEG = 64;
  const geo = new THREE.PlaneGeometry(1, 1, L_SEG, 2);
  const pos = geo.attributes.position;
  const aU = new Float32Array(pos.count);
  const up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < pos.count; i++) {
    const u = pos.getX(i) + 0.5;
    const v = pos.getY(i) + 0.5;
    aU[i] = u;
    const P = curve.getPointAt(u);
    // the tail used to sag to y=0.01, which is exactly the table top —
    // so half the ribbon's width passed through the surface. The sag is
    // shallower now, and the sampled point is floored as well so no
    // control-point tweak can push it back under.
    if (P.y < RIBBON_FLOOR) P.y = RIBBON_FLOOR;
    const T = curve.getTangentAt(u).normalize();
    const side = up.clone().sub(T.clone().multiplyScalar(up.dot(T))).normalize();
    let vv = v;
    if (u > 0.92) {
      // leader tongue: one corner cut long, rounded — asymmetric
      const k = (u - 0.92) / 0.08;
      const cut = k * k * (3 - 2 * k);
      vv = v * (1 - 0.58 * cut) + 0.55 * cut;
    }
    const p = P.clone().add(side.multiplyScalar((vv - 0.5) * RIBBON_W));
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  geo.setAttribute("aU", new THREE.BufferAttribute(aU, 1));
  geo.computeVertexNormals();
  return geo;
}

export default function FilmRoll({
  position,
}: {
  position: [number, number, number];
}) {
  const { invalidate } = useThree();
  const group = useRef<THREE.Group>(null);
  const berth = useBenchStore((s) => s.berth);
  const feedNonce = useBenchStore((s) => s.b1FeedNonce);

  const [hover, setHover] = useState(false);
  /* The store's hovered id, not just this component's own pointer
   *  state. The work grid puts a transparent cell over the canvas and
   *  takes no pointer events in 3D, so this object's own onPointerOver
   *  can never fire there; it still can on a case page, where the
   *  object is mounted on its own. Reading both means one branch works
   *  in each place and neither has to know which place it is in.
   *  Movement already did this for the same reason. */
  const hoveredId = useBenchStore((s) => s.hovered);
  const awake = hover || hoveredId === "latent" || berth === berthOf("latent");

  const progress = useRef(RETRACTED);
  const target = useRef(RETRACTED);
  const glintT0 = useRef(-1);

  const shellGeom = useMemo(shellGeometry, []);
  const shellRough = useMemo(makeShellRoughness, []);
  const labelTex = useMemo(makeLabelTexture, []);
  const ribbonGeom = useMemo(buildRibbon, []);
  const filmMaps = useMemo(makeFilmMaps, []);

  const uniforms = useMemo(
    () => ({ uProgress: { value: RETRACTED }, uGlintT: { value: 0 } }),
    []
  );

  const ribbonMat = useMemo(() => {
    const frames = RIBBON_LEN / 0.115; // true-ish perf pitch, never stretched
    [filmMaps.map, filmMaps.alphaMap, filmMaps.emissiveMap].forEach((t) => {
      t.repeat.set(frames, 1);
    });
    const m = new THREE.MeshStandardMaterial({
      map: filmMaps.map,
      alphaMap: filmMaps.alphaMap,
      alphaTest: 0.5, // no transparent:true — no depth sorting to pay for
      emissive: new THREE.Color("#FFB46B"),
      emissiveMap: filmMaps.emissiveMap,
      emissiveIntensity: 0,
      roughness: 0.5,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    m.onBeforeCompile = (s) => {
      s.uniforms.uProgress = uniforms.uProgress;
      s.uniforms.uGlintT = uniforms.uGlintT;
      s.vertexShader =
        "attribute float aU;\nvarying float vU;\n" +
        s.vertexShader.replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\n vU = aU;"
        );
      s.fragmentShader =
        "varying float vU;\nuniform float uProgress;\nuniform float uGlintT;\n" +
        s.fragmentShader
          .replace(
            "#include <clipping_planes_fragment>",
            `#include <clipping_planes_fragment>
             // curve-reveal: the feed IS the discard front
             if (vU > uProgress) discard;`
          )
          .replace(
            "#include <emissivemap_fragment>",
            `#include <emissivemap_fragment>
             {
               // hover glint: one warm sweep along the leader edge
               if (uGlintT > 0.0 && uGlintT < 1.0) {
                 float head = mix(0.8, 1.0, uGlintT);
                 float band = 1.0 - smoothstep(0.0, 0.035, abs(vU - head));
                 totalEmissiveRadiance += vec3(1.0, 0.706, 0.42) * band * 0.35;
               }
             }`
          );
    };
    return m;
  }, [filmMaps, uniforms]);

  useEffect(() => {
    document.body.style.cursor = hover ? "pointer" : "";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hover]);

  const toggle = () => {
    target.current = target.current > 0.5 ? RETRACTED : 1;
    invalidate();
  };

  const firstNonce = useRef(true);
  useEffect(() => {
    if (firstNonce.current) {
      firstNonce.current = false;
      return;
    }
    toggle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedNonce]);

  // hover: start one glint sweep (affordance, no extra DOM, only on point)
  useEffect(() => {
    if (hover) {
      glintT0.current = performance.now();
      invalidate();
    }
  }, [hover, invalidate]);

  // §3 secondary: during the enter-transition the SAME glint sweep
  // rides the feed-out — light trailing the leader, no new asset
  const transitingLatent = useBenchStore(
    (s) => s.transitionId === "latent"
  );
  useEffect(() => {
    if (transitingLatent) {
      glintT0.current = performance.now();
      invalidate();
    }
  }, [transitingLatent, invalidate]);

  useFrame((_, delta) => {
    let busy = false;

    // feed / retract: critically damped, ease-out, no overshoot ever
    const diff = target.current - progress.current;
    if (Math.abs(diff) > 0.0004) {
      const tau = diff > 0 ? TAU_OUT : TAU_IN;
      progress.current += diff * (1 - Math.exp(-delta / tau));
      uniforms.uProgress.value = progress.current;
      busy = true;
    }

    // glint sweep, single pass
    if (glintT0.current > 0) {
      const t = (performance.now() - glintT0.current) / 600;
      uniforms.uGlintT.value = t >= 1 ? 0 : t;
      if (t >= 1) glintT0.current = -1;
      else busy = true;
    }

    // sprocket back-light: wake fade-in only, dark when asleep
    // follow-through: in-transition the sprocket glow chases the feed
    // with extra lag and keeps rising after it stops — damped, never
    // overshooting (same lerp, slower constant)
    const targetEm = transitingLatent ? 0.9 : awake ? 0.55 : 0;
    if (Math.abs(ribbonMat.emissiveIntensity - targetEm) > 0.01) {
      ribbonMat.emissiveIntensity +=
        (targetEm - ribbonMat.emissiveIntensity) *
        (transitingLatent ? 0.06 : 0.12);
      busy = true;
    }

    if (group.current)
      group.current.position.y = position[1] + (awake ? 0.01 : 0);
    if (busy) invalidate();
  });

  return (
    <group position={position}>
      <group
        ref={group}
        onPointerOver={() => {
          setHover(true);
          invalidate();
        }}
        onPointerOut={() => {
          setHover(false);
          invalidate();
        }}
        onClick={toggle}
      >
        {/* cartridge shell: one lathe, matte ink, rim light at the lips */}
        <mesh geometry={shellGeom}>
          <meshStandardMaterial
            color="#141416"
            roughness={0.8}
            roughnessMap={shellRough}
            metalness={0.55}
          />
        </mesh>
        {/* spool hub out the top: the "loads into a camera" detail */}
        <mesh position={[0, SHELL_H + 0.014, 0]}>
          <cylinderGeometry args={[0.034, 0.034, 0.028, 20]} />
          <meshStandardMaterial color="#1b1b1d" roughness={0.45} metalness={0.6} />
        </mesh>
        {/* label band: ink on ink, one copper hairline */}
        <mesh position={[0, SHELL_H * 0.52, 0]}>
          <cylinderGeometry args={[SHELL_R + 0.002, SHELL_R + 0.002, 0.15, 36, 1, true]} />
          <meshBasicMaterial map={labelTex} />
        </mesh>
        {/* felt exit lip at the slit */}
        <mesh position={[SHELL_R + 0.004, EXIT_Y, 0]} rotation={[0, 0, 0.06]}>
          <boxGeometry args={[0.03, 0.05, RIBBON_W + 0.03]} />
          <meshStandardMaterial color="#0e0e10" roughness={0.95} />
        </mesh>

        {/* the film: pre-bent ribbon, revealed along its curve */}
        {/* noFrame: the ribbon is modelled at full length and revealed
            along its curve by the shader, so its bounding box is about
            three times the silhouette anyone actually sees. The rail
            fits an instrument to the frame from its bounds, and this
            one would drag the canister off to the side. */}
        <mesh
          geometry={ribbonGeom}
          material={ribbonMat}
          userData={{ noFrame: true }}
        />

      {/* No contact shadow. It sat on the wooden turntable, where a
          disc of ink read as the object touching the wood. The rail
          stands the instruments on paper against a single horizon rule,
          and the disc scales with the object, so at stage size it was a
          grey ellipse across a third of the frame. STYLE: no shadows. */}
      </group>
    </group>
  );
}
