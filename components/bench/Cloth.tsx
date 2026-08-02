"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { berthOf } from "@/lib/bench";
import { makeBenchEnvMap } from "@/lib/bench/envMap";
import { useBenchStore } from "@/lib/benchStore";

/*
 * B6-SWAP · 帛 (MATERIAL MEMORY) — a cloth hung from a slim copper
 * rod, running HAND-WRITTEN Verlet integration. The one instrument
 * whose content IS its physics: the engine, undressed.
 *
 * Physics provenance: same-algorithm rewrite of the Material Memory
 * site's hand-written cloth solver (position Verlet + structural
 * constraint relaxation + per-fabric damping). The site source isn't
 * vendored in this repo, so structure/iteration/damping follow the
 * same published approach with parameters tuned per fabric — no
 * physics library anywhere (that absence is the exhibit).
 *
 * States (§5): dormant = fully converged, useFrame early-outs, ZERO
 * computation, no wind, no breathing. waking = pointer hover ONLY —
 * one 0.6s sinusoidal gust sweeps left→right once, never loops; berth
 * focus gives glint+nameplate but NO gust (居中起风 would be a
 * non-pointer automatic motion — §5; the exception was not approved).
 * interacting = grab any point of the cloth, it follows the hand as a
 * position constraint; release and physics swings it back to rest.
 * A mono readout shows the live fabric params while dragging and
 * fades 1.2s after release.
 *
 * Four fabrics (丝/麻/帆/绒, warm earth, no blue) share ONE cloth —
 * the copper ring at the rod's left end drags to switch; parameters
 * change on the spot and the drape visibly changes character.
 * Watermark: the 林 seal at ≤8% single-color darkening, baked into
 * the weave texture — never cinnabar.
 * Budget: cloth 1 + rod frame 1 + ring 1 = 3 draw calls;
 * 32×40 CPU Verlet <0.5ms/frame, runs only while unconverged.
 */

export const clothDrag = { active: false }; // Rig reads this: cloth hand > ring drag

/** weave texture as data-URL for the cut overlay (§3 拍③: the page
 *  develops out of the warp/weft) — same canvas asset, zero new RT */
let weaveURL: string | null = null;
export function getWeaveURL() {
  return weaveURL;
}

const COLS = 32;
const ROWS = 40;
const CLOTH_W = 0.4;
/** Hanging length. The sheet is pinned along its top row at the rod,
 *  so this is the drop, and shortening it shortens the drop rather than
 *  moving the cloth: geometry, rest lengths and the sag correction all
 *  derive from it. */
const CLOTH_H = 0.35;
const ROD_Y = 0.64;
const GRAVITY = -1.6;
const DT = 1 / 60;

type Fabric = {
  name: string;
  color: string;
  stiffness: number;
  damping: number;
  iterations: number;
};
/** warm-earth presets (帛承台面之土 · 禁蓝) — the four memories */
const FABRICS: Fabric[] = [
  { name: "silk", color: "#E8E0CE", stiffness: 0.82, damping: 0.97, iterations: 2 },
  { name: "linen", color: "#D8CCB2", stiffness: 0.9, damping: 0.94, iterations: 2 },
  { name: "canvas", color: "#C8BB9E", stiffness: 0.96, damping: 0.9, iterations: 3 },
  { name: "velvet", color: "#8E7364", stiffness: 0.75, damping: 0.985, iterations: 2 },
];

/** Weave texture: warp/weft hairlines + the 林 mark at 8% darkening,
 *  single color — the easter egg must never upstage the cloth. */
function makeWeaveTexture() {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, S, S);
  g.strokeStyle = "rgba(0,0,0,0.06)";
  g.lineWidth = 1;
  for (let i = 0; i < S; i += 4) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, S); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(S, i); g.stroke();
  }
  // 林 watermark (logo skeleton), 8% single-color
  g.strokeStyle = "rgba(26,23,20,0.08)";
  g.fillStyle = "rgba(26,23,20,0.08)";
  g.lineWidth = 2;
  g.strokeRect(96, 96, 64, 64);
  g.fillRect(116, 110, 3, 36); g.fillRect(108, 120, 19, 3);
  g.fillRect(134, 110, 3, 36); g.fillRect(126, 120, 19, 3);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  weaveURL = c.toDataURL();
  return t;
}

function buildRodFrame() {
  const rod = new THREE.CylinderGeometry(0.012, 0.012, 0.5, 12);
  rod.rotateZ(Math.PI / 2);
  rod.translate(0, ROD_Y, 0);
  const postL = new THREE.CylinderGeometry(0.008, 0.01, ROD_Y, 8);
  postL.translate(-0.23, ROD_Y / 2, 0);
  const postR = postL.clone();
  postR.translate(0.46, 0, 0);
  const base = new THREE.BoxGeometry(0.54, 0.02, 0.1);
  base.translate(0, 0.01, 0);
  const merged = mergeGeometries(
    [rod, postL, postR, base].map((geo) => geo.toNonIndexed()),
    false
  )!;
  return merged;
}

export default function Cloth({
  position,
  onSelect,
}: {
  position: [number, number, number];
  /** The cloth's own onPointerDown stops propagation so a drag does not
   *  also spin the ring — which meant the invisible hit box behind it
   *  never saw pointerdown, so R3F never synthesised a click and this
   *  was the one instrument that could not be entered. It now forwards
   *  the click itself, using the same single-vs-double logic. */
  onSelect?: (dragged: boolean) => void;
}) {
  const { invalidate, camera } = useThree();
  const berth = useBenchStore((s) => s.berth);
  const setHovered = useBenchStore((s) => s.setHovered);
  const mine = berthOf("material-memory");

  /** Where the pointer went down, so a click can be told from a drag:
   *  past 6px the user was swaying the cloth, not asking to leave. */
  const down = useRef<{ x: number; y: number } | null>(null);

  const [fabricIdx, setFabricIdx] = useState(0);
  const fabric = FABRICS[fabricIdx];
  const [readout, setReadout] = useState<"off" | "on" | "fading">("off");

  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const envMap = useMemo(makeBenchEnvMap, []);
  const weave = useMemo(makeWeaveTexture, []);
  const frameGeom = useMemo(buildRodFrame, []);

  // ---- hand-written Verlet state ----
  const sim = useRef<{
    pos: Float32Array;
    prev: Float32Array;
    calm: number;
    sleeping: boolean;
    gustT: number; // <0 = no gust
    dragIdx: number;
    dragPlane: THREE.Plane;
  } | null>(null);
  const reduced = useRef(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* UNVEIL 「揭帛见章」: the answer beat is the EXISTING gust flipped
   * bottom→up, the lift is REAL Verlet force on every particle — no
   * kinematic fake. Pins release at 0.2s (the cloth leaves the rod).
   * Verlet can't run backwards, so reverse is honest differently: a
   * snapshot of all particles is taken at transition start, and Esc/
   * walk-back damps every particle back to the snapshot (no bounce),
   * pins restored on arrival, then sleep. */
  const transitionId = useBenchStore((s) => s.transitionId);
  const transDir = useBenchStore((s) => s.transitionDir);
  const unveilT0 = useRef(0);
  const snap = useRef<Float32Array | null>(null);
  const pinsFree = useRef(false);

  useEffect(() => {
    const s0 = sim.current;
    if (!s0) return;
    if (transitionId === "material-memory") {
      if (transDir === 1 && !snap.current) {
        snap.current = s0.pos.slice();
        unveilT0.current = performance.now();
      }
      s0.sleeping = false;
      s0.calm = 0;
      invalidate();
    } else if (snap.current) {
      // transition over (reverse finished or aborted): hard-restore the
      // resting state — pins back, still frame, zero computation
      s0.pos.set(snap.current);
      s0.prev.set(snap.current);
      snap.current = null;
      pinsFree.current = false;
      s0.sleeping = false;
      s0.calm = 20;
      invalidate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionId, transDir]);

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(CLOTH_W, CLOTH_H, COLS - 1, ROWS - 1);
    geo.translate(0, ROD_Y - 0.012 - CLOTH_H / 2, 0.015);
    const n = COLS * ROWS;
    const pos = new Float32Array(n * 3);
    pos.set(geo.attributes.position.array as Float32Array);
    sim.current = {
      pos,
      prev: pos.slice(),
      calm: 0,
      sleeping: false,
      gustT: -1,
      dragIdx: -1,
      dragPlane: new THREE.Plane(),
    };
    return geo;
  }, []);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const wake = () => {
    const s = sim.current!;
    s.sleeping = false;
    s.calm = 0;
    invalidate();
  };

  // fabric switch: parameters change on the spot; re-settle, then sleep
  const cycleFabric = (dir: number) => {
    setFabricIdx((i) => (i + dir + FABRICS.length) % FABRICS.length);
    wake();
  };

  // ---- the solver: position Verlet + structural relaxation ----
  useFrame((state) => {
    const s = sim.current!;
    if (reduced.current) return; // static frame forever (§5)
    const dragging = s.dragIdx >= 0;
    const unveiling = transitionId === "material-memory";
    if (s.sleeping && !dragging && s.gustT < 0 && !unveiling) return; // dormant: ZERO work

    // ---- UNVEIL reverse: damp every particle back to the snapshot ----
    if (unveiling && transDir === -1 && snap.current) {
      const sn = snap.current;
      let maxd = 0;
      for (let i = 0; i < s.pos.length; i++) {
        const d = sn[i] - s.pos[i];
        s.pos[i] += d * 0.16;
        s.prev[i] = s.pos[i]; // kill velocity: converge, never bounce
        if (Math.abs(d) > maxd) maxd = Math.abs(d);
      }
      if (maxd < 0.002) {
        s.pos.set(sn);
        s.prev.set(sn);
        pinsFree.current = false; // the cloth is back on the rod
      }
      const attr0 = meshRef.current!.geometry.attributes.position;
      (attr0.array as Float32Array).set(s.pos);
      attr0.needsUpdate = true;
      meshRef.current!.geometry.computeVertexNormals();
      invalidate();
      return;
    }

    const { pos, prev } = s;
    const damp = fabric.damping;
    const g = GRAVITY * DT * DT;

    // gust: one 0.6s sine sweep, left→right, then dead (never loops)
    let gustA = 0;
    if (s.gustT >= 0) {
      s.gustT += DT;
      if (s.gustT >= 0.6) s.gustT = -1;
      else gustA = Math.sin((s.gustT / 0.6) * Math.PI) * 0.9 * DT * DT;
    }

    // ---- UNVEIL forward forces (拍①风起 0–0.25 / 拍②掀飞 0.25–0.8) ----
    let liftY = 0;
    let liftZ = 0;
    if (unveiling && transDir === 1) {
      const ut = (performance.now() - unveilT0.current) / 1000;
      if (ut > 0.2) pinsFree.current = true; // 布离杆
      if (ut < 0.25) {
        // the existing gust force, flipped bottom→up: the answer beat
        liftY = Math.sin((ut / 0.25) * Math.PI) * 1.4 * DT * DT;
      } else {
        liftY = 2.6 * DT * DT; // sustained real lift
        liftZ = 3.2 * DT * DT; // toward the camera (+z faces the arc)
      }
    }

    // integrate (top row pinned until the unveil frees it)
    for (let i = pinsFree.current ? 0 : COLS; i < COLS * ROWS; i++) {
      const ix = i * 3;
      const x = pos[ix], y = pos[ix + 1], z = pos[ix + 2];
      const col = i % COLS;
      const phase = s.gustT >= 0 ? (s.gustT / 0.6) * Math.PI - col * 0.12 : 0;
      const wind = gustA * Math.max(0, Math.sin(phase));
      pos[ix] += (x - prev[ix]) * damp + wind;
      pos[ix + 1] += (y - prev[ix + 1]) * damp + g + liftY;
      pos[ix + 2] += (z - prev[ix + 2]) * damp + wind * 0.35 + liftZ;
      prev[ix] = x; prev[ix + 1] = y; prev[ix + 2] = z;
    }

    // drag = position constraint: the grabbed vertex sits on the hand
    if (dragging) {
      const hit = new THREE.Vector3();
      state.raycaster.ray.intersectPlane(s.dragPlane, hit);
      if (groupRef.current) groupRef.current.worldToLocal(hit);
      const ix = s.dragIdx * 3;
      pos[ix] = hit.x; pos[ix + 1] = hit.y; pos[ix + 2] = hit.z;
      prev[ix] = hit.x; prev[ix + 1] = hit.y; prev[ix + 2] = hit.z;
    }

    // structural constraints; the asymmetric hem (left column family
    // rests ~4% longer) breaks perfect symmetry
    const rx = CLOTH_W / (COLS - 1);
    const ry = CLOTH_H / (ROWS - 1);
    const k = fabric.stiffness * 0.5;
    for (let it = 0; it < fabric.iterations; it++) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const i = r * COLS + c;
          if (c + 1 < COLS) relax(pos, i, i + 1, rx, k, r === 0 && !pinsFree.current);
          if (r + 1 < ROWS) {
            const rest = ry * (r > ROWS - 9 ? 1 + 0.04 * (1 - c / (COLS - 1)) : 1);
            relax(pos, i, i + COLS, rest, k, r === 0 && !pinsFree.current);
          }
        }
      }
    }

    // convergence watch → sleep (§5: converged = still = free)
    let maxMove = 0;
    for (let i = COLS * 3; i < pos.length; i += 3) {
      const d = Math.abs(pos[i] - prev[i]) + Math.abs(pos[i + 1] - prev[i + 1]);
      if (d > maxMove) maxMove = d;
    }
    if (maxMove < 0.0005 && !dragging && s.gustT < 0 && !unveiling) {
      if (++s.calm > 24) { s.sleeping = true; }
    } else s.calm = 0;

    const attr = meshRef.current!.geometry.attributes.position;
    (attr.array as Float32Array).set(pos);
    attr.needsUpdate = true;
    meshRef.current!.geometry.computeVertexNormals();
    if (!s.sleeping) invalidate();
  });

  const grab = (e: { stopPropagation: () => void; point: THREE.Vector3 }) => {
    if (reduced.current) return;
    e.stopPropagation();
    const s = sim.current!;
    const local = e.point.clone();
    if (groupRef.current) groupRef.current.worldToLocal(local);
    // nearest particle to the hand
    let best = -1, bd = Infinity;
    for (let i = COLS; i < COLS * ROWS; i++) {
      const ix = i * 3;
      const d =
        (s.pos[ix] - local.x) ** 2 +
        (s.pos[ix + 1] - local.y) ** 2 +
        (s.pos[ix + 2] - local.z) ** 2;
      if (d < bd) { bd = d; best = i; }
    }
    s.dragIdx = best;
    // constraint plane: camera-facing, through the grab point
    const n = new THREE.Vector3();
    camera.getWorldDirection(n);
    s.dragPlane.setFromNormalAndCoplanarPoint(n, e.point);
    clothDrag.active = true;
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    setReadout("on");
    wake();
    const up = () => {
      s.dragIdx = -1;
      clothDrag.active = false;
      setReadout("fading");
      fadeTimer.current = setTimeout(() => setReadout("off"), 1200);
      window.removeEventListener("pointerup", up);
      wake();
    };
    window.addEventListener("pointerup", up);
  };

  // knob ring: drag left/right to cycle the four memories
  const knobX = useRef<number | null>(null);

  return (
    <group position={position} ref={groupRef}>
      {/* rod frame: polished copper, planted */}
      <mesh geometry={frameGeom}>
        <meshPhysicalMaterial
          color="#8C6A3F" metalness={0.95} roughness={0.3}
          envMap={envMap} envMapIntensity={0.55}
        />
      </mesh>

      {/* the fabric knob: copper ring at the rod's left end */}
      <mesh
        position={[-0.26, ROD_Y, 0]}
        rotation={[0, 0, Math.PI / 2]}
        onPointerDown={(e) => { e.stopPropagation(); knobX.current = e.clientX ?? 0; }}
        onPointerUp={(e) => {
          e.stopPropagation();
          if (knobX.current === null) return;
          const dx = (e.clientX ?? 0) - knobX.current;
          knobX.current = null;
          if (Math.abs(dx) > 6 && !reduced.current) cycleFabric(dx > 0 ? 1 : -1);
        }}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = "ew-resize"; }}
        onPointerOut={() => { document.body.style.cursor = ""; }}
      >
        <torusGeometry args={[0.022, 0.006, 8, 20]} />
        <meshPhysicalMaterial
          color="#8C6A3F" metalness={0.95} roughness={0.25}
          envMap={envMap} envMapIntensity={0.6}
        />
      </mesh>

      {/* 帛: the cloth — hand-written physics, matte, double-sided */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered("material-memory");
          document.body.style.cursor = "grab";
          const s = sim.current!;
          // waking: ONE gust per hover entry, pointer-driven only (§5)
          if (!reduced.current && s.dragIdx < 0 && s.gustT < 0) {
            s.gustT = 0;
            wake();
          }
        }}
        onPointerOut={() => {
          setHovered(null);
          document.body.style.cursor = "";
        }}
        onPointerDown={(e) => {
          down.current = { x: e.clientX ?? 0, y: e.clientY ?? 0 };
          grab(e);
        }}
        onClick={(e) => {
          e.stopPropagation();
          const d = down.current;
          const moved =
            d === null
              ? false
              : Math.hypot((e.clientX ?? 0) - d.x, (e.clientY ?? 0) - d.y) > 6;
          down.current = null;
          onSelect?.(moved);
        }}
      >
        <meshStandardMaterial
          color={fabric.color}
          map={weave}
          roughness={0.95}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* readout: the instrument's honesty — live params while the
          hand is on the cloth, gone 1.2s after it lets go */}
      {readout !== "off" && berth === mine && (
        <Html
          position={[0.32, 0.1, 0.2]}
          style={{
            pointerEvents: "none",
            whiteSpace: "nowrap",
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: 10,
            letterSpacing: "0.12em",
            color: "#6b6459",
            opacity: readout === "on" ? 1 : 0,
            transition: readout === "fading" ? "opacity 1.2s ease" : undefined,
          }}
        >
          {fabric.name} · stiffness {fabric.stiffness.toFixed(2)} · damping{" "}
          {fabric.damping.toFixed(2)}
        </Html>
      )}

      {/* No contact shadow. It sat on the wooden turntable, where a
          disc of ink read as the object touching the wood. The rail
          stands the instruments on paper against a single horizon rule,
          and the disc scales with the object, so at stage size it was a
          grey ellipse across a third of the frame. STYLE: no shadows. */}
    </group>
  );
}

/** one constraint relaxation: move both ends toward rest length
 *  (pinned top row moves only its partner). */
function relax(
  pos: Float32Array,
  a: number,
  b: number,
  rest: number,
  k: number,
  aPinned: boolean
) {
  const ax = a * 3, bx = b * 3;
  const dx = pos[bx] - pos[ax];
  const dy = pos[bx + 1] - pos[ax + 1];
  const dz = pos[bx + 2] - pos[ax + 2];
  const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
  const diff = ((d - rest) / d) * k;
  const mA = aPinned ? 0 : diff;
  const mB = aPinned ? diff * 2 : diff;
  pos[ax] += dx * mA; pos[ax + 1] += dy * mA; pos[ax + 2] += dz * mA;
  pos[bx] -= dx * mB; pos[bx + 1] -= dy * mB; pos[bx + 2] -= dz * mB;
}
