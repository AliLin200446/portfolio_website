"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import Cocoon from "./Cocoon";
import FilmRoll from "./FilmRoll";
import Movement from "./Movement";

/*
 * THE BENCH ON A PHONE.
 *
 * The desktop rail mounts five instruments in one scene and lets you
 * turn the table. That was deliberately withheld below 768px, because
 * a GL context plus about 107 kB is a real cost on a phone and the DOM
 * list carried the whole story without it.
 *
 * This is the deliberate reversal of that, kept as cheap as the
 * decision allows:
 *
 *   - ONE instrument in the scene, not five. Tapping the list swaps
 *     which one, so there is still only ever one context.
 *   - dpr locked to 1. On a 3x phone screen that is the single largest
 *     saving available, and these are flat-shaded objects with no fine
 *     texture to lose.
 *   - no drag, no raycasting, no pointer handlers on the canvas. It
 *     turns slowly on its own and the list stays the way in.
 *   - reduced motion stops the rotation and leaves a still object.
 *
 * The list is BERTH_ORDER, so it is three long and every entry has a
 * live object. The cloth is not here because MATERIAL MEMORY left the
 * rail for /experiments, not because a phone could not run it.
 */

const TURN = 0.22; // radians per second, slow enough to read as drift

function Turntable({ slug }: { slug: string }) {
  const g = useRef<THREE.Group>(null);
  const reduced = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useFrame((_, delta) => {
    if (!g.current || reduced.current) return;
    g.current.rotation.y += TURN * delta;
  });

  return (
    <group ref={g} scale={1.35} position={[0, -0.35, 0]}>
      {slug === "skeletal-silk" && <Cocoon position={[0, 0, 0]} />}
      {slug === "latent" && <FilmRoll position={[0, 0, 0]} />}
      {slug === "teardown" && <Movement position={[0, 0, 0]} standalone />}
    </group>
  );
}

/** Every slug the rail can show. The guard stays so a berth added
 *  before its model degrades to an empty frame rather than a blank
 *  canvas that never draws. */
const HAS_OBJECT = new Set(["skeletal-silk", "latent", "teardown"]);

export default function MobileBench({ slug }: { slug: string }) {
  if (!HAS_OBJECT.has(slug))
    return <div className="aspect-square w-full border border-line bg-[#EDE9E0]" />;

  return (
    <div className="aspect-square w-full border border-line">
      {/* frameloop is continuous here, not on demand: the object turns
          by itself and there is no interaction to invalidate from. dpr
          1 is the price of admission on a phone. */}
      <Canvas dpr={1} camera={{ fov: 34, position: [0, 0.9, 3.1] }}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[-2, 2.6, 2.4]} intensity={1.25} color="#fff6e8" />
        <Turntable slug={slug} />
      </Canvas>
    </div>
  );
}
