"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const FPS_CAP = 30;
const FRAME_MS = 1000 / FPS_CAP;
/** Ring buffer of ink spawn points. Must match TRAIL_N in hero.common.glsl. */
const TRAIL_COUNT = 32;
/** Minimum pointer travel (uv units) between ink spawns. */
const SPAWN_DIST = 0.02;
/** Stop rendering this many seconds after the last pointer activity,
 *  once every stain has faded. Any pointer event wakes it. */
const SLEEP_AFTER = 90;

// ---- 3D relief tuning (shader-side knobs live in hero.common.glsl) ----
/** Relief mesh subdivisions. Drop to 128 if GPU-bound. */
const SEGMENTS = 200;
/** Slight perspective, enough for depth without distortion. */
const CAMERA_FOV = 35;
const CAMERA_Z = 2.2;
/** Max plane tilt toward the cursor, radians. 0 disables the parallax. */
const PARALLAX = 0.035;
/** Per-frame lerp toward the target tilt. */
const PARALLAX_EASE = 0.06;
// ------------------------------------------------------------------------

/*
 * Ink relief background: a subdivided paper plane displaced by the ink
 * density field, lit by a fixed sidelight, developed through a halftone
 * screen. Shaders live in public/shaders/ (hero.common.glsl + hero.vert +
 * hero.frag) and are fetched at runtime, so they can be edited without
 * touching build config.
 *
 * Low power by design:
 * - render loop capped at 30fps (frameloop="demand", manual raf + invalidate)
 * - paused while the tab is hidden, asleep when the ink has faded
 * - prefers-reduced-motion skips the canvas entirely (static paper)
 * - dpr capped at 1.5
 */

type Shaders = { vertex: string; fragment: string };

function ShaderPlane({ shaders }: { shaders: Shaders }) {
  const { invalidate, size, viewport, gl } = useThree();
  const mesh = useRef<THREE.Mesh>(null);
  const tiltTarget = useRef({ x: 0, y: 0 });
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uViewSize: { value: new THREE.Vector2(1, 1) },
      // xy offscreen; z = 0 keeps the loop awake for the first paint
      uMouse: { value: new THREE.Vector3(-10, -10, 0) },
      uTrail: {
        value: Array.from(
          { length: TRAIL_COUNT },
          () => new THREE.Vector4(-10, -10, -1e3, 0)
        ),
      },
    }),
    []
  );

  uniforms.uResolution.value.set(size.width * viewport.dpr, size.height * viewport.dpr);
  uniforms.uViewSize.value.set(viewport.width, viewport.height);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let elapsed = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const delta = now - last;
      if (delta < FRAME_MS) return;
      last = now - (delta % FRAME_MS);
      if (document.hidden) return;
      elapsed += delta;
      uniforms.uTime.value = elapsed / 1000;
      if (elapsed / 1000 - uniforms.uMouse.value.z > SLEEP_AFTER) return;
      if (mesh.current && PARALLAX > 0) {
        const rot = mesh.current.rotation;
        rot.x += (tiltTarget.current.x - rot.x) * PARALLAX_EASE;
        rot.y += (tiltTarget.current.y - rot.y) * PARALLAX_EASE;
      }
      invalidate();
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [invalidate, uniforms]);

  // Pointer → ink. Spawns a bleed point when the pointer has travelled
  // far enough; the shader handles growth, decay and the stain.
  useEffect(() => {
    let lastX = 10;
    let lastY = 10;
    let head = 0;

    const onPointer = (e: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;

      const now = uniforms.uTime.value;
      uniforms.uMouse.value.set(x, y, now);
      tiltTarget.current.x = -(y - 0.5) * 2 * PARALLAX;
      tiltTarget.current.y = (x - 0.5) * 2 * PARALLAX;

      const dx = x - lastX;
      const dy = y - lastY;
      if (dx * dx + dy * dy < SPAWN_DIST * SPAWN_DIST) return;
      uniforms.uTrail.value[head].set(x, y, now, 0.6 + Math.random() * 0.4);
      head = (head + 1) % TRAIL_COUNT;
      lastX = x;
      lastY = y;
    };

    window.addEventListener("pointermove", onPointer);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [gl, uniforms]);

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[1, 1, SEGMENTS, SEGMENTS]} />
      <shaderMaterial
        vertexShader={shaders.vertex}
        fragmentShader={shaders.fragment}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function ShaderBackground() {
  const [shaders, setShaders] = useState<Shaders | null>(null);
  const [failed, setFailed] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    Promise.all(
      ["/shaders/hero.common.glsl", "/shaders/hero.vert", "/shaders/hero.frag"].map(
        (file) =>
          fetch(file).then((res) =>
            res.ok ? res.text() : Promise.reject(res.status)
          )
      )
    )
      .then(([common, vert, frag]) =>
        setShaders({
          vertex: `${common}\n${vert}`,
          fragment: `${common}\n${frag}`,
        })
      )
      .catch(() => setFailed(true));
  }, []);

  // Static paper fallback: reduced motion, shaders not loaded yet,
  // fetch failed, or WebGL unavailable.
  const fallback = (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{ background: "var(--paper)" }}
    />
  );

  if (reduced || !shaders || failed) return fallback;

  return (
    <div aria-hidden className="absolute inset-0">
      {fallback}
      <Canvas
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ fov: CAMERA_FOV, position: [0, 0, CAMERA_Z] }}
        gl={{ antialias: false, powerPreference: "low-power" }}
        onCreated={({ gl }) => {
          gl.setClearColor("#F5F2EC");
        }}
      >
        <ShaderPlane shaders={shaders} />
      </Canvas>
    </div>
  );
}
