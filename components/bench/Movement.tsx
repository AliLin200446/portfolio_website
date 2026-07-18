"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RUNS, STATS, type Wheel } from "@/lib/bench/teardownData";
import { useBenchStore } from "@/lib/benchStore";

/*
 * B4 TEARDOWN — the open-back movement. Wheel speeds are the E4 latency
 * data made mechanical: the small gold inference wheel runs steady
 * (std 9.9ms), the big dark queue wheel stutters through the 20-run
 * replay (std 277ms, cold-start stall included), network sits in the
 * middle, even. Hover a wheel for its stats; click to pause time and
 * read one real call. Cheapest instrument on the bench: pure rotation.
 */

const TILT = THREE.MathUtils.degToRad(12);

type GearDef = {
  wheel: Wheel;
  r: number;
  teeth: number;
  color: string;
  pos: [number, number, number];
  baseSpeed: number; // rad/s when running clean
};

const GEARS: GearDef[] = [
  { wheel: "inference", r: 0.09, teeth: 10, color: "#C9A227", pos: [-0.16, 0.05, 0.05], baseSpeed: 1.6 },
  { wheel: "queue", r: 0.17, teeth: 14, color: "#6F5330", pos: [0.1, 0.05, -0.02], baseSpeed: 0 },
  { wheel: "network", r: 0.11, teeth: 12, color: "#8C6A3F", pos: [-0.02, 0.05, 0.16], baseSpeed: 1.0 },
];

/** Low-poly gear: rim polygon + tooth blocks merged visually via one group
 *  is too many draws — bake teeth into a single lathe-like shape instead:
 *  a low-segment cylinder reads as a toothed wheel when its facets catch
 *  the light while turning. */
function GearMesh({ def }: { def: GearDef }) {
  return (
    <>
      <mesh>
        <cylinderGeometry args={[def.r, def.r, 0.018, def.teeth]} />
        <meshStandardMaterial color={def.color} metalness={0.85} roughness={0.4} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[def.r * 0.24, def.r * 0.24, 0.03, 10]} />
        <meshStandardMaterial color="#3a2f22" metalness={0.7} roughness={0.5} />
      </mesh>
    </>
  );
}

export default function Movement({
  position,
}: {
  position: [number, number, number];
}) {
  const { invalidate } = useThree();
  const group = useRef<THREE.Group>(null);
  const berth = useBenchStore((s) => s.berth);

  const [hover, setHover] = useState<Wheel | null>(null);
  const [paused, setPaused] = useState(false);
  const [log, setLog] = useState<{ n: number; total: number } | null>(null);
  const awake = hover !== null || berth === 3;

  const gearRefs = useRef<Record<Wheel, THREE.Group | null>>({
    queue: null,
    inference: null,
    network: null,
  });

  // queue replay state: step to the next tooth after each run's queue ms
  const replay = useRef({ idx: 0, nextAt: 0, target: 0 });
  const logIdx = useRef(0);

  const jitter = useMemo(() => ({ v: 0 }), []);

  useFrame((state, delta) => {
    if (!awake || paused) return; // sleep: wheels frozen, nothing invalidates
    const now = state.clock.elapsedTime * 1000;

    // inference: steady, ~2% wobble (std 9.9 / mean 495)
    const inf = gearRefs.current.inference;
    if (inf) {
      jitter.v += (Math.random() - 0.5) * 0.01;
      jitter.v *= 0.9;
      inf.rotation.y += (GEARS[0].baseSpeed + jitter.v) * delta;
    }
    // network: even
    const net = gearRefs.current.network;
    if (net) net.rotation.y -= GEARS[2].baseSpeed * delta;

    // queue: 20-run replay, one tooth-step per run, interval = queue ms
    const q = gearRefs.current.queue;
    if (q) {
      const r = replay.current;
      if (now >= r.nextAt) {
        const run = RUNS[r.idx % RUNS.length];
        r.idx += 1;
        r.target += (Math.PI * 2) / 14; // one tooth
        // 1ms of queue = 1.2ms of wall time — the cold start reads as a stall
        r.nextAt = now + run.queue * 1.2;
      }
      const diff = r.target - q.rotation.y;
      if (Math.abs(diff) > 0.0005) q.rotation.y += diff * 0.18;
    }

    if (group.current)
      group.current.position.y = position[1] + (awake ? 0.01 : 0);
    invalidate();
  });

  const clickGear = () => {
    if (!paused) {
      const run = RUNS[logIdx.current % RUNS.length];
      logIdx.current += 1;
      setLog({ n: run.n, total: run.total });
      setPaused(true);
    } else {
      setPaused(false);
      setLog(null);
    }
    invalidate();
  };

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
        {/* bronze back plate */}
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.025, 36]} />
          <meshStandardMaterial color="#8C6A3F" metalness={0.85} roughness={0.38} />
        </mesh>
        {GEARS.map((def) => (
          <group
            key={def.wheel}
            position={def.pos}
            ref={(el) => {
              gearRefs.current[def.wheel] = el;
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHover(def.wheel);
              invalidate();
            }}
            onClick={(e) => {
              e.stopPropagation();
              clickGear();
            }}
          >
            <GearMesh def={def} />
          </group>
        ))}
        {/* balance wheel: thin ring, sleeps with the rest */}
        <mesh position={[0.22, 0.05, 0.18]}>
          <torusGeometry args={[0.05, 0.006, 8, 24]} />
          <meshStandardMaterial color="#C9A227" metalness={0.85} roughness={0.35} />
        </mesh>
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <circleGeometry args={[0.42, 24]} />
        <meshBasicMaterial color="#1a1714" transparent opacity={0.14} />
      </mesh>

      {/* wheel stats tooltip (baked, mono) */}
      {hover && !paused && (
        <Html position={[0, 0.55, 0]} center style={{ pointerEvents: "none", whiteSpace: "nowrap" }}>
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.1em",
              color: "#1a1714",
            }}
          >
            {hover} · mean {STATS[hover].mean}ms · std {STATS[hover].std}ms
            {STATS[hover].note ? ` · ${STATS[hover].note}` : ""}
          </span>
        </Html>
      )}
      {/* paused: one real call, time travel */}
      {paused && log && (
        <Html position={[0, 0.55, 0]} center style={{ pointerEvents: "none", whiteSpace: "nowrap" }}>
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.1em",
              color: "#1a1714",
            }}
          >
            LOG #{log.n} · {log.total}ms — click to resume
          </span>
        </Html>
      )}
    </group>
  );
}
