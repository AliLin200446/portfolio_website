"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { E4, type Segment } from "@/lib/bench/teardownData";
import { berthOf } from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";

/*
 * B4 TEARDOWN — the open-back movement, per the full spec: latency data
 * cast in brass. A shared replay clock walks the 20 E4 calls at 3s each
 * (60s per lap, seamless); each wheel's speed is its segment of the
 * current call. Grab a wheel and the rest of the machine keeps going —
 * that is the body language of a teardown.
 *
 * NOTE on the speed formula: the spec writes speed = base·(ms/mean) but
 * also demands the 1500ms cold start read as a near-stall. Proportional
 * would spin it FASTEST, so this implements the stated intent instead:
 * speed = base·(mean/ms)^1.6 — longer latency, slower wheel. Lerp 0.15
 * per the "EMA 半径 ≤0.15, 保留顿挫" clause.
 */

const TILT = THREE.MathUtils.degToRad(12);
const SECS_PER_CALL = 3;

type WheelDef = {
  seg: Segment;
  label: string;
  r: number;
  teeth: number;
  color: string;
  pos: [number, number, number];
  base: number; // rad/s at mean latency
  dir: 1 | -1;
};

const WHEELS: WheelDef[] = [
  { seg: "inference", label: "INFERENCE", r: 0.07, teeth: 24, color: "#A8813F", pos: [0.14, 0.06, -0.1], base: 1.8, dir: 1 },
  { seg: "queue", label: "QUEUE", r: 0.13, teeth: 16, color: "#6E5230", pos: [-0.08, 0.06, 0.0], base: 1.1, dir: -1 },
  { seg: "network", label: "NETWORK", r: 0.05, teeth: 20, color: "#8C6A3F", pos: [0.08, 0.06, 0.14], base: 1.5, dir: 1 },
];

/** Toothed wheel: polar polyline alternating root/tip radius (trapezoid
 *  teeth, count fixed by spec), extruded, lying flat. */
function gearGeometry(rOuter: number, teeth: number) {
  const rRoot = rOuter * 0.8;
  const pts: THREE.Vector2[] = [];
  const steps = teeth * 4;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const phase = i % 4;
    const r = phase === 1 || phase === 2 ? rOuter : rRoot;
    pts.push(new THREE.Vector2(Math.cos(a) * r, Math.sin(a) * r));
  }
  const shape = new THREE.Shape(pts);
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.018, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  return g;
}

/** Double plate: solid bottom + top plate with windows (the open back). */
function plateGeometry() {
  const bottom = new THREE.CylinderGeometry(0.3, 0.3, 0.018, 40);
  bottom.translate(0, 0.009, 0);

  const shape = new THREE.Shape();
  shape.absarc(0, 0, 0.3, 0, Math.PI * 2, false);
  for (const w of WHEELS) {
    const hole = new THREE.Path();
    hole.absarc(w.pos[0], -w.pos[2], w.r + 0.035, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }
  const top = new THREE.ExtrudeGeometry(shape, { depth: 0.014, bevelEnabled: false });
  top.rotateX(-Math.PI / 2);
  top.translate(0, 0.095, 0);

  // Extrude is non-indexed, Cylinder is indexed — unify before merging
  const bottomFlat = bottom.toNonIndexed();
  const merged = mergeGeometries([bottomFlat, top], false)!;
  bottom.dispose();
  bottomFlat.dispose();
  top.dispose();
  return merged;
}

/** All three arbor pins, one mesh. */
function pinsGeometry() {
  const parts = WHEELS.map((w) => {
    const p = new THREE.CylinderGeometry(0.011, 0.011, 0.11, 10);
    p.translate(w.pos[0], 0.055, w.pos[2]);
    return p;
  });
  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return merged;
}

/** Balance wheel: thin ring + cross spokes, one mesh. */
function balanceGeometry() {
  const ring = new THREE.TorusGeometry(0.04, 0.005, 8, 28);
  ring.rotateX(Math.PI / 2);
  const s1 = new THREE.BoxGeometry(0.076, 0.006, 0.008);
  const s2 = new THREE.BoxGeometry(0.008, 0.006, 0.076);
  const merged = mergeGeometries([ring, s1, s2], false)!;
  [ring, s1, s2].forEach((g) => g.dispose());
  return merged;
}

export default function Movement({
  position,
}: {
  position: [number, number, number];
}) {
  const { invalidate } = useThree();
  const group = useRef<THREE.Group>(null);
  const berth = useBenchStore((s) => s.berth);
  const sel = useBenchStore((s) => s.b4Sel);
  const grabNonce = useBenchStore((s) => s.b4GrabNonce);

  const [hover, setHover] = useState<number | null>(null);
  const [grabbed, setGrabbed] = useState<number | null>(null);
  const [logLine, setLogLine] = useState<string | null>(null);
  const awake = hover !== null || berth === berthOf("teardown");

  const wheelRefs = useRef<(THREE.Group | null)[]>([null, null, null]);
  const balance = useRef<THREE.Group>(null);

  const plateGeom = useMemo(plateGeometry, []);
  const pinsGeom = useMemo(pinsGeometry, []);
  const balanceGeom = useMemo(balanceGeometry, []);
  const gearGeoms = useMemo(() => WHEELS.map((w) => gearGeometry(w.r, w.teeth)), []);
  const wheelMats = useMemo(
    () =>
      WHEELS.map(
        (w) =>
          new THREE.MeshStandardMaterial({
            color: w.color,
            metalness: 0.9,
            roughness: 0.4,
          })
      ),
    []
  );

  // replay clock: 3s per call, resumes where it left off
  const clock = useRef({ t: 0, speeds: [0, 0, 0], scale: 0 });
  const grabTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentCall = () =>
    E4.calls[Math.floor(clock.current.t / SECS_PER_CALL) % E4.calls.length];

  const grab = (i: number) => {
    if (grabbed === i) {
      setGrabbed(null);
      setLogLine(null);
      if (grabTimer.current) clearTimeout(grabTimer.current);
      invalidate();
      return;
    }
    const call = currentCall();
    const w = WHEELS[i];
    const ms = call[`${w.seg}_ms` as const];
    setGrabbed(i);
    setLogLine(
      `LOG #${String(call.id).padStart(2, "0")} · ${w.seg} ${ms}ms${
        call.id === 1 && w.seg === "queue" ? " · cold start" : ""
      }`
    );
    if (grabTimer.current) clearTimeout(grabTimer.current);
    grabTimer.current = setTimeout(() => {
      setGrabbed(null);
      setLogLine(null);
      invalidate();
    }, 2000);
    invalidate();
  };

  const firstNonce = useRef(true);
  useEffect(() => {
    if (firstNonce.current) {
      firstNonce.current = false;
      return;
    }
    grab(sel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grabNonce]);

  // selected-wheel warm outline (keyboard path): emissive on the selection
  useEffect(() => {
    wheelMats.forEach((m, i) => {
      const isSel = berth === berthOf("teardown") && i === sel;
      const isHover = hover === i;
      m.emissive.set(isSel ? "#FFB46B" : isHover ? "#FFB46B" : "#000000");
      m.emissiveIntensity = isSel ? 0.12 : isHover ? 0.06 : 0;
    });
    invalidate();
  }, [sel, hover, berth, wheelMats, invalidate]);

  useFrame((_, delta) => {
    const c = clock.current;
    // sleep: cursor suspended, zero work
    if (!awake && c.scale < 0.01) return;

    // wake ease-in over 0.6s / ease-out on sleep
    c.scale += ((awake ? 1 : 0) - c.scale) * (awake ? delta / 0.6 : 0.15);
    if (c.scale > 0.001) c.t += delta * c.scale;

    const call = currentCall();
    WHEELS.forEach((w, i) => {
      const g = wheelRefs.current[i];
      if (!g) return;
      const ms = call[`${w.seg}_ms` as const];
      // intent-form of the spec formula: longer latency = slower wheel
      const target =
        grabbed === i ? 0 : w.base * Math.pow(E4.stats[w.seg].mean / ms, 1.6);
      // lerp 0.15: keeps the cold-start stall as a stall, not a fade
      c.speeds[i] += (target - c.speeds[i]) * 0.15;
      g.rotation.y += w.dir * c.speeds[i] * c.scale * delta;
    });

    // balance: 2Hz beat, amplitude follows the current call's total
    if (balance.current) {
      const norm = Math.min(1, call.total_ms / 2200);
      balance.current.rotation.y =
        Math.sin(c.t * Math.PI * 2 * 2) * (0.25 + 0.55 * norm);
    }

    if (group.current)
      group.current.position.y = position[1] + (awake ? 0.01 : 0);
    invalidate();
  });

  return (
    <group position={position}>
      <group
        ref={group}
        rotation={[TILT, 0, 0]}
        onPointerOut={() => {
          setHover(null);
          invalidate();
        }}
      >
        <mesh geometry={plateGeom}>
          <meshStandardMaterial color="#8C6A3F" metalness={0.9} roughness={0.42} />
        </mesh>
        <mesh geometry={pinsGeom}>
          <meshStandardMaterial color="#5c452a" metalness={0.85} roughness={0.5} />
        </mesh>
        {WHEELS.map((w, i) => (
          <group
            key={w.seg}
            position={w.pos}
            ref={(el) => {
              wheelRefs.current[i] = el;
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHover(i);
              invalidate();
            }}
            onClick={(e) => {
              e.stopPropagation();
              grab(i);
            }}
          >
            {/* generous pick proxy (2x), invisible */}
            <mesh visible={false}>
              <cylinderGeometry args={[w.r * 2, w.r * 2, 0.06, 12]} />
            </mesh>
            <mesh geometry={gearGeoms[i]} material={wheelMats[i]} />
          </group>
        ))}
        {/* balance wheel above the queue wheel: the heartbeat */}
        <group ref={balance} position={[-0.08, 0.13, 0.0]}>
          <mesh geometry={balanceGeom}>
            <meshStandardMaterial color="#A8813F" metalness={0.9} roughness={0.35} />
          </mesh>
        </group>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#1a1714" transparent opacity={0.14} />
      </mesh>

      {/* tooltips: stats on hover, one real call while grabbed */}
      {(hover !== null || logLine) && (
        <Html position={[0, 0.55, 0]} center style={{ pointerEvents: "none", whiteSpace: "nowrap" }}>
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.1em",
              color: "#1a1714",
            }}
          >
            {logLine ??
              (hover !== null &&
                `${WHEELS[hover].label} — mean ${E4.stats[WHEELS[hover].seg].mean}ms · std ${
                  E4.stats[WHEELS[hover].seg].std
                }ms · p95 ${E4.stats[WHEELS[hover].seg].p95}ms`)}
          </span>
        </Html>
      )}
    </group>
  );
}
