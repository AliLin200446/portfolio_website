"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useBenchStore } from "@/lib/benchStore";

/*
 * B6 ACUBOT — the bronze figure. An abstract reclining form (smooth, no
 * facial detail — respect, not realism), a fine needle hovering above,
 * a constellation of points that breathes at 0.05Hz — the bench's second
 * and last sanctioned idle motion. Hover a point for its bilingual name;
 * click and the needle drops with a needle's cadence: fast, then careful.
 * Names + numbers only. The homepage is an index, not a medical text.
 */

// TODO-real-points: placeholder 12-point selection with hand-placed surface
// coords. Replace from the exported JSON ({id, name_zh, name_alt, region,
// u, v}) when the author's data lands — mapping u/v → surface positions.
const POINTS: { id: string; zh: string; alt: string; pos: [number, number, number] }[] = [
  { id: "GV20", zh: "百会", alt: "Bai Hui", pos: [-0.44, 0.14, 0.02] },
  { id: "GB20", zh: "风池", alt: "Feng Chi", pos: [-0.36, 0.12, -0.04] },
  { id: "GB21", zh: "肩井", alt: "Jian Jing", pos: [-0.26, 0.16, 0.0] },
  { id: "LI11", zh: "曲池", alt: "Qu Chi", pos: [-0.12, 0.1, 0.13] },
  { id: "PC6", zh: "内关", alt: "Nei Guan", pos: [-0.02, 0.08, 0.17] },
  { id: "LI4", zh: "合谷", alt: "He Gu", pos: [0.04, 0.07, 0.19] },
  { id: "GV4", zh: "命门", alt: "Ming Men", pos: [-0.06, 0.17, -0.05] },
  { id: "BL40", zh: "委中", alt: "Wei Zhong", pos: [0.22, 0.12, 0.02] },
  { id: "ST36", zh: "足三里", alt: "Zu San Li", pos: [0.3, 0.09, 0.1] },
  { id: "SP6", zh: "三阴交", alt: "San Yin Jiao", pos: [0.36, 0.07, 0.08] },
  { id: "LR3", zh: "太冲", alt: "Tai Chong", pos: [0.42, 0.05, 0.1] },
  { id: "KI1", zh: "涌泉", alt: "Yong Quan", pos: [0.44, 0.04, 0.04] },
];

/** Abstract reclining form: capsules merged into one smooth bronze mass. */
function buildFigure() {
  const parts: THREE.BufferGeometry[] = [];
  const add = (
    g: THREE.BufferGeometry,
    pos: [number, number, number],
    rot?: [number, number, number]
  ) => {
    if (rot) {
      g.rotateX(rot[0]);
      g.rotateY(rot[1]);
      g.rotateZ(rot[2]);
    }
    g.translate(...pos);
    parts.push(g);
  };
  // torso, lying along X
  add(new THREE.CapsuleGeometry(0.085, 0.28, 6, 14), [-0.1, 0.095, 0], [0, 0, Math.PI / 2]);
  // head
  add(new THREE.SphereGeometry(0.065, 16, 12), [-0.4, 0.1, 0.01]);
  // folded legs: thigh + shin
  add(new THREE.CapsuleGeometry(0.06, 0.2, 6, 12), [0.16, 0.085, 0.04], [0, 0.5, Math.PI / 2]);
  add(new THREE.CapsuleGeometry(0.045, 0.22, 6, 12), [0.34, 0.065, 0.08], [0, -0.3, Math.PI / 2]);
  // arm resting in front
  add(new THREE.CapsuleGeometry(0.035, 0.18, 6, 10), [-0.08, 0.08, 0.12], [0, 0.4, Math.PI / 2]);
  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return merged;
}

const NEEDLE_HOVER = 0.15;

export default function BronzeFigure({
  position,
}: {
  position: [number, number, number];
}) {
  const { invalidate } = useThree();
  const group = useRef<THREE.Group>(null);
  const needle = useRef<THREE.Group>(null);
  const points = useRef<THREE.InstancedMesh>(null);
  const pointsMat = useRef<THREE.MeshBasicMaterial>(null);

  const berth = useBenchStore((s) => s.berth);
  const pointIdx = useBenchStore((s) => s.b6PointIdx);
  const needleNonce = useBenchStore((s) => s.b6NeedleNonce);

  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const awake = hover !== null || berth === 5;

  const figureGeom = useMemo(buildFigure, []);
  const drop = useRef<{ t0: number; from: THREE.Vector3; to: THREE.Vector3 } | null>(null);

  // place instances once
  useEffect(() => {
    const m = points.current;
    if (!m) return;
    const o = new THREE.Object3D();
    POINTS.forEach((p, i) => {
      o.position.set(...p.pos);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    });
    m.instanceMatrix.needsUpdate = true;
    invalidate();
  }, [invalidate]);

  const dropTo = (i: number) => {
    const p = POINTS[i];
    const from = needle.current
      ? needle.current.position.clone()
      : new THREE.Vector3(p.pos[0], p.pos[1] + NEEDLE_HOVER, p.pos[2]);
    drop.current = {
      t0: performance.now(),
      from,
      to: new THREE.Vector3(p.pos[0], p.pos[1] + 0.01, p.pos[2]),
    };
    setPinned(i);
    invalidate();
  };

  const firstNonce = useRef(true);
  useEffect(() => {
    if (firstNonce.current) {
      firstNonce.current = false;
      return;
    }
    dropTo(pointIdx % POINTS.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needleNonce]);

  useFrame((state) => {
    let busy = false;

    // constellation breath: 0.05Hz, ±10%, awake only (sanctioned idle)
    if (pointsMat.current) {
      const target = awake
        ? 0.9 * (1 + 0.1 * Math.sin(state.clock.elapsedTime * Math.PI * 2 * 0.05))
        : 0;
      if (Math.abs(pointsMat.current.opacity - target) > 0.002) {
        pointsMat.current.opacity +=
          awake ? (target - pointsMat.current.opacity) * 0.5 : (0 - pointsMat.current.opacity) * 0.12;
        busy = true;
      } else if (awake) {
        pointsMat.current.opacity = target;
        busy = true; // keep the slow breath alive while awake
      }
    }

    // needle drop: 0.4s — ease-in flight, the last 0.05s decelerates
    if (drop.current && needle.current) {
      const t = (performance.now() - drop.current.t0) / 1000;
      const D = 0.4;
      let k: number;
      if (t >= D) {
        k = 1;
        drop.current = null;
      } else if (t < D - 0.05) {
        const u = t / (D - 0.05);
        k = 0.92 * u * u; // ease-in to 92% of the way
      } else {
        const u = (t - (D - 0.05)) / 0.05;
        k = 0.92 + 0.08 * (1 - (1 - u) * (1 - u)); // gentle finish
      }
      needle.current.position.lerpVectors(
        drop.current?.from ?? needle.current.position,
        drop.current?.to ?? needle.current.position,
        k
      );
      busy = true;
    }

    if (group.current)
      group.current.position.y = position[1] + (awake ? 0.01 : 0);
    if (busy) invalidate();
  });

  const active = pinned ?? hover;

  return (
    <group position={position}>
      <group
        ref={group}
        onPointerOver={() => invalidate()}
        onPointerOut={() => {
          setHover(null);
          invalidate();
        }}
      >
        {/* the figure: smooth bronze, no detail */}
        <mesh geometry={figureGeom}>
          <meshStandardMaterial color="#8C6A3F" metalness={0.85} roughness={0.38} />
        </mesh>

        {/* point constellation, one instanced draw; generous pick radius */}
        <instancedMesh
          ref={points}
          args={[undefined, undefined, POINTS.length]}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (e.instanceId !== undefined) setHover(e.instanceId);
            invalidate();
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (e.instanceId !== undefined) dropTo(e.instanceId);
          }}
        >
          <sphereGeometry args={[0.024, 8, 6]} />
          <meshBasicMaterial
            ref={pointsMat}
            color="#FFB46B"
            transparent
            opacity={0}
          />
        </instancedMesh>

        {/* the needle: fine shaft + hinted grip, hovering until called */}
        <group ref={needle} position={[-0.02, 0.08 + NEEDLE_HOVER, 0.17]}>
          <mesh position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.006, 0.003, 0.32, 8]} />
            <meshStandardMaterial color="#E8E6E0" metalness={0.9} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.34, 0]}>
            <cylinderGeometry args={[0.009, 0.009, 0.05, 8]} />
            <meshStandardMaterial color="#CFCBC2" metalness={0.8} roughness={0.45} />
          </mesh>
        </group>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <circleGeometry args={[0.5, 24]} />
          <meshBasicMaterial color="#1a1714" transparent opacity={0.14} />
        </mesh>
      </group>

      {/* bilingual name, mono, held while pinned */}
      {active !== null && (
        <Html
          position={[POINTS[active].pos[0], POINTS[active].pos[1] + 0.26, POINTS[active].pos[2]]}
          center
          style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.12em",
              color: "#1a1714",
            }}
          >
            {POINTS[active].zh} · {POINTS[active].alt}
          </span>
        </Html>
      )}
    </group>
  );
}
