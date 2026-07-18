"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BERTH_MAX, BERTH_SPACING } from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";
import BronzeFigure from "./BronzeFigure";
import Cocoon from "./Cocoon";
import FilmRoll from "./FilmRoll";
import Movement from "./Movement";
import Seal from "./Seal";
import TuningFork from "./TuningFork";

/*
 * 相A skeleton: matte worktop plane, five placeholder boxes, camera rail.
 * Constitution: motion only from pointer/scroll; idle renders nothing new
 * (frameloop="demand"); damping 0.08; hard limits; berth snap.
 */

const DAMPING = 0.08;
const SNAP_DELAY_MS = 160;
const CAM_HEIGHT = 1.8;
const CAM_DIST = 3.9;
const CAM_PITCH = THREE.MathUtils.degToRad(-15);

/** Matte worktop texture: subtle paper-noise, canvas-generated (no shader). */
function useWorktopTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    g.fillStyle = "#f0ece2";
    g.fillRect(0, 0, 256, 256);
    const img = g.getImageData(0, 0, 256, 256);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 9;
      img.data[i] += n;
      img.data[i + 1] += n;
      img.data[i + 2] += n;
    }
    g.putImageData(img, 0, 0);
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(10, 4);
    return tex;
  }, []);
}

function Rig() {
  const { camera, invalidate, gl } = useThree();
  const berth = useBenchStore((s) => s.berth);
  const setBerth = useBenchStore((s) => s.setBerth);
  const x = useRef(berth * BERTH_SPACING);
  const target = useRef(berth * BERTH_SPACING);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // ?berth=N deep-link is authoritative at rig mount: pin camera + store
    const b = Number(new URLSearchParams(window.location.search).get("berth"));
    if (Number.isInteger(b) && b >= 0 && b * BERTH_SPACING <= BERTH_MAX) {
      x.current = target.current = b * BERTH_SPACING;
      setBerth(b);
    }
    camera.rotation.set(CAM_PITCH, 0, 0);
    camera.position.set(x.current, CAM_HEIGHT, CAM_DIST);
    invalidate();
  }, [camera, invalidate, setBerth]);

  useEffect(() => {
    const el = gl.domElement;
    const clamp = (v: number) => Math.max(0, Math.min(BERTH_MAX, v));

    const scheduleSnap = () => {
      if (snapTimer.current) clearTimeout(snapTimer.current);
      snapTimer.current = setTimeout(() => {
        const i = Math.round(target.current / BERTH_SPACING);
        target.current = i * BERTH_SPACING;
        setBerth(i);
        invalidate();
      }, SNAP_DELAY_MS);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      target.current = clamp(
        target.current + (e.deltaY + e.deltaX) * 0.004
      );
      scheduleSnap();
      invalidate();
    };

    let dragging = false;
    let startX = 0;
    let startTarget = 0;
    const onDown = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      startTarget = target.current;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      target.current = clamp(
        startTarget - (e.clientX - startX) * 0.012
      );
      invalidate();
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      scheduleSnap();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (snapTimer.current) clearTimeout(snapTimer.current);
    };
  }, [gl, invalidate, setBerth]);

  useFrame(() => {
    const diff = target.current - x.current;
    x.current += diff * DAMPING;
    camera.position.x = x.current;
    if (Math.abs(diff) > 0.0008) invalidate();
  });

  return null;
}

function Worktop() {
  const tex = useWorktopTexture();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[BERTH_MAX / 2, 0, 0]}>
      <planeGeometry args={[BERTH_MAX + 14, 10]} />
      <meshStandardMaterial map={tex} roughness={1} metalness={0} />
    </mesh>
  );
}

export default function Bench() {
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ fov: 40 }}
      gl={{ antialias: true, powerPreference: "low-power" }}
      onCreated={({ gl }) => gl.setClearColor("#F5F2EC")}
      aria-hidden
    >
      {/* window light + low fill; no colored sources */}
      <directionalLight position={[-3, 6, 4]} intensity={1.4} color="#fff6e8" />
      <ambientLight intensity={0.75} />
      <Worktop />
      {/* six berths, six instruments */}
      <FilmRoll position={[0, 0, 0]} />
      <TuningFork position={[1 * BERTH_SPACING, 0, 0]} />
      <Cocoon position={[2 * BERTH_SPACING, 0, 0]} />
      <Movement position={[3 * BERTH_SPACING, 0, 0]} />
      <Seal position={[4 * BERTH_SPACING, 0, 0]} />
      <BronzeFigure position={[5 * BERTH_SPACING, 0, 0]} />
      <Rig />
    </Canvas>
  );
}
