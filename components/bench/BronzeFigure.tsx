"use client";

import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import acupointsJson from "@/data/acupoints.json";
import { berthOf } from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";

/*
 * B6 ACUBOT — the bronze figure, per the full spec. B 系列终章.
 * A craft's constellation: the bronze teaching figure, 136 points and
 * 4,138 cases of family practice lying on the bench's last berth. The
 * only instrument about a person. Abstract, solemn, ZERO medical info —
 * an index, not a text; a memorial, not a specimen.
 *
 * Data is hot-swappable: data/acupoints.json (u along the body axis,
 * v around the girth) is baked to surface positions at mount via
 * raycasting the figure — swap the JSON, zero code change.
 * The constellation breath (±10% @ 0.05Hz) is the bench's second and
 * only other sanctioned idle motion (B6-only exemption). Needle drift
 * 0.03Hz ±0.5px, awake only.
 * Patina: roughness 0.5 + light clearcoat as the cheap approximation of
 * "the touched high points shine first" (APPROX — curvature-baked map
 * can replace it later).
 */

type Acupoint = {
  id: string;
  name_zh: string;
  name_alt: string;
  region: string;
  u: number;
  v: number;
  featured?: boolean;
};
const POINTS: Acupoint[] = (acupointsJson as { points: Acupoint[] }).points;
const FEATURED = POINTS.map((p, i) => ({ ...p, i })).filter((p) => p.featured);

const NEEDLE_HOVER = 0.15;
const WARM = new THREE.Color("#FFB46B");

/** Smooth reclining form: a family of fused ellipsoids. No face, no
 *  fingers, no anatomy — the lower arm pillowed under the head is only
 *  hinted. */
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
  // head, resting low
  add(new THREE.SphereGeometry(0.065, 18, 14), [-0.36, 0.085, 0.01]);
  // pillow arm hinted under the head
  add(new THREE.CapsuleGeometry(0.028, 0.14, 6, 10), [-0.33, 0.045, 0.05], [0, 0.9, Math.PI / 2]);
  // torso
  add(new THREE.CapsuleGeometry(0.085, 0.26, 8, 16), [-0.08, 0.09, 0], [0, 0, Math.PI / 2]);
  // resting arm along the flank
  add(new THREE.CapsuleGeometry(0.032, 0.16, 6, 10), [-0.05, 0.1, 0.09], [0, 0.35, Math.PI / 2]);
  // folded legs: thigh + shin
  add(new THREE.CapsuleGeometry(0.058, 0.2, 8, 12), [0.17, 0.08, 0.03], [0, 0.45, Math.PI / 2]);
  add(new THREE.CapsuleGeometry(0.042, 0.22, 8, 12), [0.34, 0.058, 0.08], [0, -0.25, Math.PI / 2]);
  const merged = mergeGeometries(parts, false)!;
  parts.forEach((p) => p.dispose());
  return merged;
}

/** Thread hint for the needle grip: fine ring normal map. */
function makeThreadNormalMap() {
  const c = document.createElement("canvas");
  c.width = 16;
  c.height = 64;
  const g = c.getContext("2d")!;
  const img = g.createImageData(16, 64);
  for (let y = 0; y < 64; y++)
    for (let x = 0; x < 16; x++) {
      const i = (y * 16 + x) * 4;
      const dy = Math.sin((y / 64) * Math.PI * 24) * 60;
      img.data[i] = 128;
      img.data[i + 1] = 128 + dy;
      img.data[i + 2] = 255;
      img.data[i + 3] = 255;
    }
  g.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Bake u/v → surface positions by raycasting the figure from outside
 *  toward the body axis. u: along X (head→feet), v: around the girth. */
function bakeSurfaceLookup(geometry: THREE.BufferGeometry) {
  const probe = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  const ray = new THREE.Raycaster();
  const AXIS_Y = 0.085;
  return POINTS.map((p) => {
    const x = -0.44 + p.u * 0.86;
    const ang = p.v * Math.PI * 2;
    const oy = AXIS_Y + Math.cos(ang) * 0.5;
    const oz = Math.sin(ang) * 0.5;
    const origin = new THREE.Vector3(x, oy, oz);
    const dir = new THREE.Vector3(0, AXIS_Y - oy, -oz).normalize();
    ray.set(origin, dir);
    const hit = ray.intersectObject(probe, false)[0];
    if (!hit || !hit.face) {
      return { pos: new THREE.Vector3(x, 0.12, 0), n: new THREE.Vector3(0, 1, 0) };
    }
    const n = hit.face.normal.clone();
    return { pos: hit.point.clone().add(n.clone().multiplyScalar(0.004)), n };
  });
}

export default function BronzeFigure({
  position,
}: {
  position: [number, number, number];
}) {
  const { invalidate } = useThree();
  const group = useRef<THREE.Group>(null);
  const needle = useRef<THREE.Group>(null);
  const stars = useRef<THREE.InstancedMesh>(null);
  const hitboxes = useRef<THREE.InstancedMesh>(null);
  const starsMat = useRef<THREE.MeshBasicMaterial>(null);

  const berth = useBenchStore((s) => s.berth);
  const pointIdx = useBenchStore((s) => s.b6PointIdx);
  const needleNonce = useBenchStore((s) => s.b6NeedleNonce);

  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const awake = hover !== null || berth === berthOf("acubot");

  // keyboard cruise pre-highlight (当前穴预亮)
  const preview =
    berth === berthOf("acubot") ? FEATURED[pointIdx % FEATURED.length].i : null;
  const figureGeom = useMemo(buildFigure, []);
  const lookup = useMemo(() => bakeSurfaceLookup(figureGeom), [figureGeom]);
  const threadTex = useMemo(makeThreadNormalMap, []);

  // wake ramp per star (stagger), plus scales for hover emphasis
  const wakeT0 = useRef(0);
  const wasAwake = useRef(false);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // needle stroke: 移(0.2) → 落(0.4, ease-in, 末端骤减速) → 驻(quiver)
  const stroke = useRef<
    | { kind: "lift"; t0: number; from: THREE.Vector3; next: number }
    | { kind: "move"; t0: number; from: THREE.Vector3; target: number }
    | { kind: "drop"; t0: number; target: number }
    | { kind: "dwell"; t0: number; target: number }
    | null
  >(null);
  const queued = useRef<number | null>(null); // debounce: keep last only

  const dropTo = (i: number) => {
    if (stroke.current && stroke.current.kind !== "dwell") {
      queued.current = i; // mid-animation: queue, keep last
      return;
    }
    const from = needle.current
      ? needle.current.position.clone()
      : lookup[i].pos.clone().add(new THREE.Vector3(0, NEEDLE_HOVER, 0));
    if (stroke.current?.kind === "dwell") {
      stroke.current = { kind: "lift", t0: performance.now(), from, next: i };
    } else {
      stroke.current = { kind: "move", t0: performance.now(), from, target: i };
    }
    invalidate();
  };

  const firstNonce = useRef(true);
  useEffect(() => {
    if (firstNonce.current) {
      firstNonce.current = false;
      return;
    }
    const f = FEATURED[pointIdx % FEATURED.length];
    dropTo(f.i);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needleNonce]);

  useEffect(() => {
    if (awake && !wasAwake.current) {
      wakeT0.current = performance.now();
      invalidate();
    }
    wasAwake.current = awake;
  }, [awake, invalidate]);

  // place hitboxes once (3x pick radius, invisible but raycastable)
  useEffect(() => {
    const hb = hitboxes.current;
    if (!hb) return;
    lookup.forEach((l, i) => {
      dummy.position.copy(l.pos);
      dummy.scale.setScalar(3);
      dummy.updateMatrix();
      hb.setMatrixAt(i, dummy.matrix);
    });
    hb.instanceMatrix.needsUpdate = true;
  }, [lookup, dummy]);

  useFrame(() => {
    const sleeping = !awake && !stroke.current;
    if (sleeping && (starsMat.current?.opacity ?? 0) < 0.01) return; // 眠: zero work

    let busy = false;
    const now = performance.now();
    const t = (now - wakeT0.current) / 1000;

    // ---- constellation: stagger light-up, then the sanctioned breath ----
    if (stars.current && starsMat.current) {
      const breath = 1 + 0.1 * Math.sin((now / 1000) * Math.PI * 2 * 0.05);
      const targetOp = awake ? 0.9 * breath : 0;
      starsMat.current.opacity +=
        (targetOp - starsMat.current.opacity) * (awake ? 0.5 : 0.12);
      lookup.forEach((l, i) => {
        const delay = (i / lookup.length) * 0.3;
        const ramp = awake ? Math.min(1, Math.max(0, (t - delay) / 0.12)) : 1;
        const active = pinned === i || hover === i || preview === i;
        dummy.position.copy(l.pos);
        dummy.scale.setScalar(0.0001 + ramp * (active ? 1.3 : 1));
        dummy.updateMatrix();
        stars.current!.setMatrixAt(i, dummy.matrix);
        stars.current!.setColorAt(
          i,
          active ? WARM.clone().multiplyScalar(1.6) : WARM
        );
      });
      stars.current.instanceMatrix.needsUpdate = true;
      if (stars.current.instanceColor) stars.current.instanceColor.needsUpdate = true;
      if (awake) busy = true;
    }

    // ---- needle: drift, and the three-beat drop ----
    if (needle.current) {
      const s = stroke.current;
      if (!s && awake) {
        // imperceptible hover drift, 0.03Hz ±0.5px — alive, not performing
        const base = pinned !== null ? lookup[pinned].pos : lookup[0].pos;
        const y =
          (pinned !== null ? 0.004 : NEEDLE_HOVER) +
          0.0016 * Math.sin((now / 1000) * Math.PI * 2 * 0.03);
        if (pinned === null)
          needle.current.position.set(base.x, base.y + y, base.z);
        busy = true;
      } else if (s) {
        const st = (now - s.t0) / 1000;
        if (s.kind === "lift") {
          const k = Math.min(1, st / 0.25);
          const e = 1 - (1 - k) * (1 - k);
          const target = s.from.clone().add(new THREE.Vector3(0, 0.1, 0));
          needle.current.position.lerpVectors(s.from, target, e);
          if (k >= 1)
            stroke.current = {
              kind: "move",
              t0: now,
              from: needle.current.position.clone(),
              target: s.next,
            };
        } else if (s.kind === "move") {
          const k = Math.min(1, st / 0.2);
          const e = k * k * (3 - 2 * k);
          const p = lookup[s.target].pos;
          const target = new THREE.Vector3(p.x, p.y + NEEDLE_HOVER, p.z);
          needle.current.position.lerpVectors(s.from, target, e);
          if (k >= 1) {
            setPinned(null);
            stroke.current = { kind: "drop", t0: now, target: s.target };
          }
        } else if (s.kind === "drop") {
          // 落 0.4s: ease-in flight, the last 0.05s slams the brakes —
          // fast fall, light touch, steady. 进针的手感.
          const k = Math.min(1, st / 0.4);
          let e: number;
          if (k < 0.875) {
            const u = k / 0.875;
            e = 0.94 * u * u;
          } else {
            const u = (k - 0.875) / 0.125;
            e = 0.94 + 0.06 * (1 - (1 - u) * (1 - u) * (1 - u));
          }
          const p = lookup[s.target].pos;
          needle.current.position.set(
            p.x,
            p.y + NEEDLE_HOVER * (1 - e) + 0.004,
            p.z
          );
          if (k >= 1) {
            setPinned(s.target);
            stroke.current = { kind: "dwell", t0: now, target: s.target };
          }
        } else if (s.kind === "dwell") {
          // 驻: tail quiver, one 0.5px shiver decaying over 0.3s — 得气
          const p = lookup[s.target].pos;
          const q =
            st < 0.3 ? 0.0016 * Math.sin(st * 40) * (1 - st / 0.3) : 0;
          needle.current.position.set(p.x + q, p.y + 0.004, p.z);
          if (st >= 1.2 && queued.current !== null) {
            const nxt = queued.current;
            queued.current = null;
            stroke.current = {
              kind: "lift",
              t0: now,
              from: needle.current.position.clone(),
              next: nxt,
            };
          } else if (st < 1.5) {
            busy = true;
          }
        }
        if (stroke.current && stroke.current.kind !== "dwell") busy = true;
        else if (stroke.current?.kind === "dwell") busy = busy || st < 1.5;
      }
    }

    if (group.current)
      group.current.position.y = position[1] + (awake ? 0.01 : 0);
    if (busy) invalidate();
  });

  const active = pinned ?? hover ?? preview;

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
        {/* the figure: old bronze, patina approximated (see header note) */}
        <mesh geometry={figureGeom}>
          <meshPhysicalMaterial
            color="#8C6A3F"
            metalness={0.85}
            roughness={0.5}
            clearcoat={0.15}
            clearcoatRoughness={0.35}
          />
        </mesh>

        {/* constellation: one instanced draw */}
        <instancedMesh ref={stars} args={[undefined, undefined, POINTS.length]}>
          <sphereGeometry args={[0.008, 8, 6]} />
          <meshBasicMaterial ref={starsMat} color="#FFB46B" transparent opacity={0} />
        </instancedMesh>
        {/* invisible 3x hitboxes for generous picking */}
        <instancedMesh
          ref={hitboxes}
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
          <sphereGeometry args={[0.008, 6, 4]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </instancedMesh>

        {/* the needle: silver shaft + threaded grip, hovering until called */}
        <group ref={needle} position={[-0.08, 0.09 + NEEDLE_HOVER, 0]}>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.006, 0.002, 0.28, 10]} />
            <meshStandardMaterial color="#C9C9CE" metalness={1} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.305, 0]}>
            <cylinderGeometry args={[0.008, 0.008, 0.05, 10]} />
            <meshStandardMaterial
              color="#C9C9CE"
              metalness={1}
              roughness={0.3}
              normalMap={threadTex}
            />
          </mesh>
        </group>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <circleGeometry args={[0.5, 24]} />
          <meshBasicMaterial color="#1a1714" transparent opacity={0.14} />
        </mesh>
      </group>

      {/* bilingual floating label: follows the point, offset clear of the
          needle; PLACEHOLDER names until the authored JSON lands */}
      {active !== null && (
        <Html
          position={[lookup[active].pos.x, lookup[active].pos.y + 0.08, lookup[active].pos.z]}
          style={{
            pointerEvents: "none",
            whiteSpace: "nowrap",
            transform: "translate(12px, -12px)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.12em",
              color: "#1a1714",
            }}
          >
            {POINTS[active].name_zh} · {POINTS[active].name_alt}
          </span>
        </Html>
      )}
    </group>
  );
}
