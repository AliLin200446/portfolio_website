"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { makeBenchEnvMap } from "@/lib/bench/envMap";
import { useBenchStore } from "@/lib/benchStore";

/*
 * B4-REV TEARDOWN — the movement reads as a MOVEMENT now, not a dark
 * disc. The disease was material and light, not geometry:
 *   (1) TWO materials pulled apart (决策A, highest priority): warm matte
 *       copper plates (#8C6A3F, rough, machined ring grain) vs cold
 *       neutral steel work (#C8C6C0 family, low roughness, hard
 *       highlights, env-mapped) — the contrast IS the legibility
 *   (2) light (决策B): a low grazing side light hangs sharp highlights
 *       on gear teeth, bevels and screw slots; a tiny procedural
 *       equirect env map gives the steel something to reflect
 *       (paper-warm world, no blue)
 *   (3) gears (决策C): fewer-but-bigger — three enlarged wheels with
 *       deep clean teeth, the big wheel spoked; the bridge windows
 *       widened so the lower layer reads through; five steel screws
 *       (ONE InstancedMesh) with slotted heads
 * Interaction per REV: wake = the movement runs — slow UNIFORM
 * mechanical rotation (walking time), fixed gear ratios; sleep is a
 * still frame; reduced-motion never turns. The E4 replay clock, wheel
 * grabbing, tooltips and the nameplate cruise retired with this REV
 * (teardownData.ts stays in the repo — the data contract is not dead,
 * say the word and the stutter comes back).
 */

const TILT_X = THREE.MathUtils.degToRad(12);
const TILT_Y = 0.32; // slight turn so the gear circle isn't flattened

const COPPER = { color: "#8C6A3F", metalness: 0.85, roughness: 0.68 };
const STEEL = { color: "#C8C6C0", metalness: 1.0, roughness: 0.26 };

type GearDef = { r: number; teeth: number; pos: [number, number, number]; speed: number; dir: 1 | -1; spoked?: boolean };
/** how far the steel half rises. Small on purpose: a seam, not a
 *  disassembly — the movement should still read as one object. */
const LIFT_MAX = 0.055;

const GEARS: GearDef[] = [
  { r: 0.16, teeth: 16, pos: [-0.07, 0.06, 0.0], speed: 0.35, dir: -1, spoked: true },
  { r: 0.095, teeth: 24, pos: [0.15, 0.06, -0.09], speed: 0.59, dir: 1 },
  { r: 0.07, teeth: 20, pos: [0.09, 0.06, 0.15], speed: 0.8, dir: 1 },
];

/** Machined ring grain for the copper plates: concentric hairlines. */
function makePlateNormal() {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const img = g.createImageData(S, S);
  for (let y = 0; y < S; y++)
    for (let x = 0; x < S; x++) {
      const dx = x - S / 2, dy = y - S / 2;
      const r = Math.sqrt(dx * dx + dy * dy);
      const ring = Math.sin(r * 2.2) * 28 + (Math.random() - 0.5) * 12;
      const i = (y * S + x) * 4;
      img.data[i] = 128 + ring * (dx / (r + 1)) * 0.4;
      img.data[i + 1] = 128 + ring * (dy / (r + 1)) * 0.4;
      img.data[i + 2] = 255;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  return new THREE.CanvasTexture(c);
}

/** Clean deep-toothed wheel; the big one gets three spoke windows. */
function gearGeometry(rOuter: number, teeth: number, spoked = false) {
  const rRoot = rOuter * 0.76;
  const pts: THREE.Vector2[] = [];
  const steps = teeth * 4;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const phase = i % 4;
    const r = phase === 1 || phase === 2 ? rOuter : rRoot;
    pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
  }
  const shape = new THREE.Shape(pts);
  if (spoked) {
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2 + 0.4;
      const cx = Math.cos(a) * rOuter * 0.42;
      const cy = Math.sin(a) * rOuter * 0.42;
      const hole = new THREE.Path();
      hole.absarc(cx, cy, rOuter * 0.2, 0, Math.PI * 2, true);
      shape.holes.push(hole);
    }
  }
  const hub = new THREE.Path();
  hub.absarc(0, 0, rOuter * 0.1, 0, Math.PI * 2, true);
  shape.holes.push(hub);
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.022, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  return g;
}

/** Copper base plate; the top bridge is separate (steel) so the two
 *  materials can fight each other properly. */
function basePlateGeometry() {
  const g = new THREE.CylinderGeometry(0.3, 0.3, 0.02, 44);
  g.translate(0, 0.01, 0);
  return g;
}

function bridgeGeometry() {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, 0.29, 0, Math.PI * 2, false);
  for (const w of GEARS) {
    const hole = new THREE.Path();
    // widened windows: the machinery reads through the plate
    hole.absarc(w.pos[0], -w.pos[2], w.r + 0.055, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.012, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  g.translate(0, 0.108, 0);
  return g;
}

/** One screw: slotted head. Shared geometry for the InstancedMesh. */
function screwGeometry() {
  const head = new THREE.CylinderGeometry(0.014, 0.014, 0.01, 12);
  const slot = new THREE.BoxGeometry(0.02, 0.004, 0.004);
  slot.translate(0, 0.005, 0);
  const merged = mergeGeometries(
    [head.toNonIndexed(), slot.toNonIndexed()],
    false
  )!;
  head.dispose();
  slot.dispose();
  return merged;
}

const SCREWS: [number, number, number][] = [
  [0.24, 0.118, 0.1], [-0.24, 0.118, 0.12], [-0.16, 0.118, -0.2],
  [0.2, 0.118, -0.18], [0.0, 0.118, 0.25],
];

export default function Movement({
  position,
}: {
  position: [number, number, number];
}) {
  const { invalidate } = useThree();
  const group = useRef<THREE.Group>(null);
  const wheelRefs = useRef<(THREE.Group | null)[]>([null, null, null]);
  const balance = useRef<THREE.Mesh>(null);
  /** the steel half, lifted clear of the copper plate on hover */
  const lift = useRef<THREE.Group>(null);
  const liftY = useRef(0);
  const screws = useRef<THREE.InstancedMesh>(null);

  const [hover, setHover] = useState(false);
  // The invisible hit box in PointerTargets sits in front of this
  // group, so its own onPointerOver never fires — the store's hovered
  // id is the only reliable signal, and it names exactly one object,
  // so a neighbour cannot start these gears.
  const hovered = useBenchStore((s) => s.hovered);
  const running = hover || hovered === "teardown";
  // the run is hover-only now: a watch movement standing at the front
  // berth should be still until you look at it.
  const awake = running;

  const plateNormal = useMemo(makePlateNormal, []);
  const envMap = useMemo(makeBenchEnvMap, []);
  const baseGeom = useMemo(basePlateGeometry, []);
  const bridgeGeom = useMemo(bridgeGeometry, []);
  const gearGeoms = useMemo(
    () => GEARS.map((w) => gearGeometry(w.r, w.teeth, w.spoked)),
    []
  );
  const screwGeom = useMemo(screwGeometry, []);

  const steelMat = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({
      ...STEEL,
      envMap,
      envMapIntensity: 0.9,
    });
    return m;
  }, [envMap]);

  const reduced = useRef(false);
  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  // place the five screws once — one instanced draw
  useEffect(() => {
    const m = screws.current;
    if (!m) return;
    const dummy = new THREE.Object3D();
    SCREWS.forEach((p, i) => {
      dummy.position.set(...p);
      dummy.rotation.y = i * 1.3; // slots at varied angles
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    invalidate();
  }, [invalidate]);

  const runScale = useRef(0);
  const spin = useRef<number | null>(null); // transition inertia budget

  useFrame((state, delta) => {
    // the lift runs before the sleep gate: a stopped movement must
    // still open. Exponential ease, so it settles rather than snapping,
    // and closes the same way on leave — no stuck mid-position.
    if (lift.current) {
      const want = hover && !reduced.current ? LIFT_MAX : 0;
      const next = liftY.current + (want - liftY.current) * Math.min(1, delta * 7);
      if (Math.abs(next - liftY.current) > 0.00002) {
        liftY.current = next;
        lift.current.position.y = next;
        invalidate();
      } else if (liftY.current !== want) {
        liftY.current = want;
        lift.current.position.y = want;
        invalidate();
      }
    }
    // sleep: a still frame, zero work
    if (!awake && runScale.current < 0.01) return;
    if (reduced.current) return; // reduced-motion: the movement never turns

    // transition answer beat (抓停入册): the two big wheels stop the
    // same instant; §3 secondary — the smallest wheel spends its
    // inertia, an extra half tooth on a decaying glide, then dead
    if (useBenchStore.getState().transitionId === "teardown") {
      runScale.current = 0;
      if (spin.current === null) spin.current = Math.PI / GEARS[2].teeth;
      const g2 = wheelRefs.current[2];
      if (g2 && spin.current > 0.002) {
        const step = spin.current * Math.min(1, delta * 10);
        g2.rotation.y += GEARS[2].dir * step;
        spin.current -= step;
        invalidate();
      }
      return;
    }
    spin.current = null;
    // wake ease-in / sleep ease-out of the run, then UNIFORM rotation —
    // walking time, fixed ratios, no stutter, no easing surprises
    runScale.current += ((awake ? 1 : 0) - runScale.current) * 0.08;
    GEARS.forEach((w, i) => {
      const g = wheelRefs.current[i];
      if (g) g.rotation.y += w.dir * w.speed * runScale.current * delta;
    });
    if (balance.current)
      balance.current.rotation.y =
        Math.sin(state.clock.elapsedTime * Math.PI * 2 * 2) *
        0.5 *
        runScale.current;

    if (group.current)
      group.current.position.y = position[1] + (awake ? 0.01 : 0);
    if (runScale.current > 0.005) invalidate();
  });

  return (
    <group position={position}>
      <group
        ref={group}
        rotation={[TILT_X, TILT_Y, 0]}
        onPointerOver={() => {
          setHover(true);
          invalidate();
        }}
        onPointerOut={() => {
          setHover(false);
          invalidate();
        }}
      >
        {/* copper base plate: warm, matte, machined ring grain */}
        <mesh geometry={baseGeom}>
          <meshStandardMaterial
            {...COPPER}
            normalMap={plateNormal}
            normalScale={new THREE.Vector2(0.3, 0.3)}
          />
        </mesh>

        {/* steel work: gears, bridge, balance, screws — cold, sharp.
            Wrapped so hover can lift the whole steel side off the
            copper plate: a teardown opens to show the inside. */}
        <group ref={lift}>
        {GEARS.map((w, i) => (
          <group
            key={i}
            position={w.pos}
            ref={(el) => {
              wheelRefs.current[i] = el;
            }}
          >
            <mesh geometry={gearGeoms[i]} material={steelMat} />
          </group>
        ))}
        <mesh geometry={bridgeGeom} material={steelMat} />
        <mesh ref={balance} position={[-0.07, 0.125, -0.19]}>
          <torusGeometry args={[0.045, 0.006, 8, 28]} />
          <primitive object={steelMat} attach="material" />
        </mesh>
        <instancedMesh
          ref={screws}
          args={[screwGeom, steelMat, SCREWS.length]}
        />
        </group>

        {/* grazing side key light: hangs the sharp highlights, throws
            the long mechanical shadows; short throw, neighbours safe */}
        <pointLight
          position={[-0.55, 0.16, 0.42]}
          intensity={1.6}
          distance={1.3}
          decay={2}
          color="#fff2df"
        />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#1a1714" transparent opacity={0.14} />
      </mesh>
    </group>
  );
}
