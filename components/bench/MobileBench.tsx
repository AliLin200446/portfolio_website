"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import Cocoon from "./Cocoon";
import FilmRoll from "./FilmRoll";
import Movement from "./Movement";
import Seal from "./Seal";

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
 * The cloth is not here on purpose: it runs a Verlet sim every frame,
 * which is the one thing in the set a phone should not be asked to do
 * while scrolling.
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
      {slug === "vestige" && <Seal position={[0, 0, 0]} />}
    </group>
  );
}

/** Material Memory has no object here. Saying so beats showing an
 *  empty frame and hoping nobody asks. */
const HAS_OBJECT = new Set(["skeletal-silk", "latent", "teardown", "vestige"]);

export default function MobileBench({ slug }: { slug: string }) {
  if (!HAS_OBJECT.has(slug))
    return (
      <div className="flex aspect-square w-full items-center justify-center border border-line bg-[#EDE9E0]">
        <span className="px-6 text-center font-mono text-[11px] leading-relaxed text-muted">
          the cloth runs a live simulation, so it stays on the desktop bench
        </span>
      </div>
    );

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
