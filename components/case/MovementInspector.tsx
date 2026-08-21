"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Movement from "@/components/bench/Movement";
import { useBenchStore } from "@/lib/benchStore";

/*
 * DETAIL INSPECTOR — the movement, close up, on its own case page.
 * Deliberately not the rail's interaction: you have already arrived, so
 * nothing here navigates.
 *
 * Orbit is constrained rather than free. The object has a canonical
 * three-quarter view; you may lean around it by ±35° yaw and ±20° pitch
 * and it springs back on release. Zoom is a shallow capped dolly and —
 * the part that matters — it only responds once you have clicked the
 * canvas. A visitor scrolling the page past this element must never
 * have their scroll swallowed.
 *
 * This whole module, and Three with it, is only ever reached through a
 * dynamic import fired by a click. Nothing here is in the page's
 * initial JS.
 */

const YAW_MAX = THREE.MathUtils.degToRad(35);
const PITCH_MAX = THREE.MathUtils.degToRad(20);
const DIST_MIN = 0.85;
const DIST_MAX = 1.6;

function Rig({
  yaw,
  pitch,
  dist,
}: {
  yaw: React.RefObject<number>;
  pitch: React.RefObject<number>;
  dist: React.RefObject<number>;
}) {
  const { camera, invalidate } = useThree();
  const cur = useRef({ y: 0, p: 0, d: 1.15 });
  useFrame(() => {
    const t = cur.current;
    const ny = t.y + (yaw.current - t.y) * 0.12;
    const np = t.p + (pitch.current - t.p) * 0.12;
    const nd = t.d + (dist.current - t.d) * 0.12;
    const moved =
      Math.abs(ny - t.y) > 1e-5 ||
      Math.abs(np - t.p) > 1e-5 ||
      Math.abs(nd - t.d) > 1e-5;
    t.y = ny;
    t.p = np;
    t.d = nd;
    const r = 1.05 * t.d;
    camera.position.set(
      Math.sin(t.y) * r,
      0.62 + Math.sin(t.p) * r * 0.5,
      Math.cos(t.y) * r
    );
    camera.lookAt(0, 0.08, 0);
    if (moved) invalidate();
  });
  return null;
}

export default function MovementInspector() {
  const wrap = useRef<HTMLDivElement>(null);
  const yaw = useRef(0);
  const pitch = useRef(0);
  const dist = useRef(1.15);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [focused, setFocused] = useState(false);

  // Zoom only after the canvas has been clicked, and even then the
  // listener is non-passive ONLY while focused — so casual scrolling
  // over the element cannot be intercepted.
  useEffect(() => {
    const el = wrap.current;
    if (!el || !focused) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      dist.current = Math.min(
        DIST_MAX,
        Math.max(DIST_MIN, dist.current + e.deltaY * 0.0012)
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [focused]);

  // blur when the pointer leaves, so scroll returns to the page
  useEffect(() => {
    if (!focused) return;
    const onDoc = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node))
        setFocused(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [focused]);

  return (
    <div
      ref={wrap}
      className={`relative h-[46svh] w-full border ${
        focused ? "border-bronze" : "border-line"
      } bg-[#EDE9E0]`}
      onPointerDown={(e) => {
        setFocused(true);
        drag.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        yaw.current = Math.max(
          -YAW_MAX,
          Math.min(YAW_MAX, (e.clientX - d.x) * 0.006)
        );
        pitch.current = Math.max(
          -PITCH_MAX,
          Math.min(PITCH_MAX, (e.clientY - d.y) * 0.004)
        );
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        // a click that did not travel is a request to run the mechanism
        if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6)
          useBenchStore.getState().setHovered("teardown");
        // spring back to the canonical view
        yaw.current = 0;
        pitch.current = 0;
      }}
      onPointerLeave={() => {
        drag.current = null;
        yaw.current = 0;
        pitch.current = 0;
      }}
    >
      <Canvas frameloop="demand" dpr={[1, 2]} camera={{ fov: 30, position: [0, 0.7, 1.2] }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[-2, 2.4, 2.6]} intensity={1.3} color="#fff6e8" />
        <Rig yaw={yaw} pitch={pitch} dist={dist} />
        <group scale={2.1} position={[0, -0.1, 0]}>
          <Movement position={[0, 0, 0]} standalone />
        </group>
      </Canvas>
      <p className="pointer-events-none absolute bottom-2 left-3 font-mono font-medium text-[length:var(--text-meta)] text-muted">
        {focused
          ? "drag to lean · scroll to zoom · click to run"
          : "click to focus, then drag or scroll"}
      </p>
    </div>
  );
}
