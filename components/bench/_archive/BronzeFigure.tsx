// RETURNING: pending App Store — ACUBOT 铜人归档(B6-SWAP),路由外保留。
"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import acupointsJson from "@/data/acupoints.json";
import { berthOf } from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";

/*
 * B6-REV ACUBOT — the standing bronze figure. The three doll-makers,
 * each fixed: (1) reclining → UPRIGHT ceremonial stance on a low round
 * plinth, arms at the sides, a whisper of forward lean under the 15°
 * camera; (2) capsule assembly → one continuous body: a lathe silhouette
 * with shoulders, waist and ribcage transitions (z-squashed out of
 * rotational symmetry), arms as smooth tubes blending from the
 * shoulders; (3) empty surface with floating dots → the full 136-point
 * JSON mapped onto the skin, one InstancedMesh, faint #FFB46B light
 * "falling on the points". Topknot: the signature detail. No face.
 * Patina: matte copper, vertex-shaded (crown-lit highs, deeper hollows)
 * + a light clearcoat rim — APPROX for a curvature bake.
 * Wake = the meridians power up: points fade in across the body within
 * 1.2s, then hold at a low steady glow. No needle, no labels, no
 * medical information — an index, not a text. Sleep is a still frame.
 */

type Acupoint = {
  id: string;
  u: number;
  v: number;
  featured?: boolean;
};
const POINTS: Acupoint[] = (acupointsJson as { points: Acupoint[] }).points;

const BODY_H = 0.72; // head-to-base of figure (≈1:7 head ratio)
const PLINTH_H = 0.05;
const PLINTH_R = 0.17;
const TOP_Y = PLINTH_H + BODY_H;

/** Continuous body: lathe profile head-crown → neck → shoulders → chest
 *  → waist → hip → joined legs → ankles, then squashed in z so it reads
 *  as a body silhouette, not a vase. Head + topknot merged in. Arms are
 *  separate smooth tubes blended at the shoulders. One geometry. */
function buildFigure() {
  // profile: [radius, height above plinth top] — restrained shoulders,
  // a real waist, calves hinted, ankles closing to a small foot ring
  const prof: [number, number][] = [
    [0.001, 0.0], [0.045, 0.004], [0.052, 0.03], // feet ring
    [0.048, 0.1], [0.055, 0.22], // calves → knees
    [0.06, 0.3], [0.068, 0.38], // thighs → hip
    [0.062, 0.44], [0.054, 0.48], // waist
    [0.066, 0.53], [0.078, 0.575], // ribcage → chest
    [0.082, 0.6], [0.072, 0.625], // shoulders roll in
    [0.028, 0.64], [0.024, 0.66], // neck
  ].map(([r, y]) => [r, y]);

  const parts: THREE.BufferGeometry[] = [];
  const lathe = new THREE.LatheGeometry(
    prof.map(([r, y]) => new THREE.Vector2(r, y + PLINTH_H)),
    28
  );
  lathe.scale(1, 1, 0.74); // out of rotational symmetry: a body, not a vase
  parts.push(lathe);

  // head: ellipsoid + the topknot (p2's signature, cheap and telling)
  const head = new THREE.SphereGeometry(0.05, 20, 16);
  head.scale(0.88, 1.06, 0.92);
  head.translate(0, PLINTH_H + 0.705, 0);
  parts.push(head);
  const knot = new THREE.SphereGeometry(0.016, 10, 8);
  knot.translate(0, PLINTH_H + 0.762, 0);
  parts.push(knot);

  // arms: smooth tubes from the shoulders, hanging at the sides
  for (const side of [-1, 1]) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 0.062, PLINTH_H + 0.6, 0),
      new THREE.Vector3(side * 0.085, PLINTH_H + 0.52, 0.008),
      new THREE.Vector3(side * 0.088, PLINTH_H + 0.42, 0.014),
      new THREE.Vector3(side * 0.082, PLINTH_H + 0.33, 0.01),
    ]);
    const arm = new THREE.TubeGeometry(curve, 16, 0.021, 10, false);
    parts.push(arm);
  }

  const flat = parts.map((p) => (p.index ? p.toNonIndexed() : p));
  const merged = mergeGeometries(flat, false)!;
  parts.forEach((p) => p.dispose());
  flat.forEach((p) => p.dispose());

  // patina vertex colors: crown-lit highs brighter, hollows deeper
  merged.computeVertexNormals();
  const pos = merged.attributes.position;
  const nrm = merged.attributes.normal;
  const colors = new Float32Array(pos.count * 3);
  const base = new THREE.Color("#8C6A3F");
  for (let i = 0; i < pos.count; i++) {
    const ny = nrm.getY(i);
    const shade = 0.88 + 0.12 * Math.max(0, ny); // 包浆: touched highs first
    colors[i * 3] = base.r * shade;
    colors[i * 3 + 1] = base.g * shade;
    colors[i * 3 + 2] = base.b * shade;
  }
  merged.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return merged;
}

/** Bake the 136 u/v points onto the skin: u runs crown→base, v around
 *  the girth; horizontal raycast toward the standing axis (downward for
 *  the crown region). Swap the JSON, zero code change. */
function bakeSurfaceLookup(geometry: THREE.BufferGeometry) {
  const probe = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  const ray = new THREE.Raycaster();
  return POINTS.map((p) => {
    const y = TOP_Y + 0.045 - p.u * (BODY_H + 0.04);
    const ang = p.v * Math.PI * 2;
    if (p.u < 0.04) {
      // crown: cast from above
      ray.set(new THREE.Vector3(0, TOP_Y + 0.3, 0), new THREE.Vector3(0, -1, 0));
    } else {
      const ox = Math.cos(ang) * 0.5;
      const oz = Math.sin(ang) * 0.5;
      ray.set(
        new THREE.Vector3(ox, y, oz),
        new THREE.Vector3(-ox, 0, -oz).normalize()
      );
    }
    const hit = ray.intersectObject(probe, false)[0];
    if (!hit || !hit.face) return null;
    return hit.point.clone().add(hit.face.normal.clone().multiplyScalar(0.004));
  }).filter((v): v is THREE.Vector3 => v !== null);
}

export default function BronzeFigure({
  position,
}: {
  position: [number, number, number];
}) {
  const { invalidate } = useThree();
  const group = useRef<THREE.Group>(null);
  const stars = useRef<THREE.InstancedMesh>(null);
  const starsMat = useRef<THREE.MeshBasicMaterial>(null);

  const berth = useBenchStore((s) => s.berth);
  const [hover, setHover] = useState(false);
  const awake = hover || berth === berthOf("acubot");

  const figureGeom = useMemo(buildFigure, []);
  const lookup = useMemo(() => bakeSurfaceLookup(figureGeom), [figureGeom]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const wakeT0 = useRef(0);
  const wasAwake = useRef(false);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  useEffect(() => {
    if (awake && !wasAwake.current) {
      wakeT0.current = performance.now();
      invalidate();
    }
    wasAwake.current = awake;
  }, [awake, invalidate]);

  // place all 136 instances once — ONE draw call for the constellation
  useEffect(() => {
    const m = stars.current;
    if (!m) return;
    lookup.forEach((p, i) => {
      dummy.position.copy(p);
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);
    });
    m.count = lookup.length;
    m.instanceMatrix.needsUpdate = true;
    invalidate();
  }, [lookup, dummy, invalidate]);

  useFrame(() => {
    // sleep: still frame, zero work
    if (!awake && (starsMat.current?.opacity ?? 0) < 0.01) return;

    let busy = false;
    const t = (performance.now() - wakeT0.current) / 1000;

    // wake: the meridians power up — a single 1.2s sweep down the body,
    // no flicker, then a steady low glow. Sleep fades it back out.
    if (starsMat.current) {
      const target = awake
        ? reduced.current
          ? 0.5 // reduced-motion: final state, no sweep
          : 0.5 * Math.min(1, t / 1.2)
        : 0;
      if (Math.abs(starsMat.current.opacity - target) > 0.005) {
        starsMat.current.opacity +=
          (target - starsMat.current.opacity) * (awake ? 0.35 : 0.12);
        busy = true;
      } else if (awake && !reduced.current && t < 1.3) {
        starsMat.current.opacity = target;
        busy = true;
      }
    }

    if (group.current)
      group.current.position.y = position[1] + (awake ? 0.01 : 0);
    if (busy) invalidate();
  });

  return (
    <group position={position}>
      <group
        ref={group}
        rotation={[THREE.MathUtils.degToRad(2.5), 0, 0]} // whisper of lean
        onPointerOver={() => {
          setHover(true);
          invalidate();
        }}
        onPointerOut={() => {
          setHover(false);
          invalidate();
        }}
      >
        {/* the figure: one continuous merged body, patina vertex colors */}
        <mesh geometry={figureGeom}>
          <meshPhysicalMaterial
            vertexColors
            metalness={0.85}
            roughness={0.55}
            clearcoat={0.14}
            clearcoatRoughness={0.4}
          />
        </mesh>

        {/* low round plinth: the ceremonial footing */}
        <mesh position={[0, PLINTH_H / 2, 0]}>
          <cylinderGeometry args={[PLINTH_R, PLINTH_R + 0.012, PLINTH_H, 28]} />
          <meshStandardMaterial color="#6E5230" metalness={0.7} roughness={0.6} />
        </mesh>

        {/* 136 points, one instanced draw: light falling on the skin */}
        <instancedMesh ref={stars} args={[undefined, undefined, POINTS.length]}>
          <sphereGeometry args={[0.0055, 6, 5]} />
          <meshBasicMaterial
            ref={starsMat}
            color="#FFB46B"
            transparent
            opacity={0}
            depthWrite={false}
          />
        </instancedMesh>

        {/* soft contact shadow */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
          <circleGeometry args={[0.3, 24]} />
          <meshBasicMaterial color="#1a1714" transparent opacity={0.16} />
        </mesh>
      </group>
    </group>
  );
}
