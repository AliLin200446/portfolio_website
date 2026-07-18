"use client";

import { Html } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import {
  BERTH_MAX,
  BERTH_ORDER,
  BERTH_SPACING,
  STATIONS,
  berthOf,
} from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";
import BronzeFigure from "./BronzeFigure";
import Cocoon from "./Cocoon";
import FilmRoll from "./FilmRoll";
import Movement from "./Movement";
import Seal from "./Seal";
import TuningFork from "./TuningFork";

/*
 * BENCH-LAYOUT: six berths on one horizontal rail, the film canister
 * center as the landing berth, wings spreading outward, the figure
 * closing the row. Default framing is a PULLED-BACK STATIC shot holding
 * ≥3 berths (a row of instruments, browsable) — interaction eases the
 * camera in; idle never moves anything. 15° overhead locked, no orbit.
 * Constitution: damping 0.08, critically-damped snaps, no overshoot,
 * frameloop="demand", DOM above 3D always.
 */

const DAMPING = 0.08;
const SNAP_DELAY_MS = 160;
const CAM_HEIGHT = 1.8;
const CAM_FAR = 6.2; // landing: ≥3 berths in frame
const CAM_NEAR = 3.9; // engaged: one instrument at ~35–45% of frame height
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
  const zoom = useRef(CAM_FAR);
  const zoomTarget = useRef(CAM_FAR); // static wide until first interaction
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // ?berth=N deep-link is authoritative at rig mount: pin camera + store
    const raw = new URLSearchParams(window.location.search).get("berth");
    const b = raw === null ? NaN : Number(raw);
    if (Number.isInteger(b) && b >= 0 && b * BERTH_SPACING <= BERTH_MAX) {
      x.current = target.current = b * BERTH_SPACING;
      setBerth(b);
      zoom.current = zoomTarget.current = CAM_NEAR; // deep link = engaged
    }
    camera.rotation.set(CAM_PITCH, 0, 0);
    camera.position.set(x.current, CAM_HEIGHT, zoom.current);
    invalidate();
  }, [camera, invalidate, setBerth]);

  // nav / keyboard jumps: the store is the source of truth — spring to it
  useEffect(() => {
    const want = berth * BERTH_SPACING;
    if (Math.abs(want - target.current) > 0.01) {
      target.current = want;
      zoomTarget.current = CAM_NEAR;
      invalidate();
    }
  }, [berth, invalidate]);

  useEffect(() => {
    const el = gl.domElement;
    const clamp = (v: number) => Math.max(0, Math.min(BERTH_MAX, v));
    const engage = () => {
      zoomTarget.current = CAM_NEAR;
    };

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
      engage();
      target.current = clamp(target.current + (e.deltaY + e.deltaX) * 0.004);
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
      engage();
      target.current = clamp(startTarget - (e.clientX - startX) * 0.012);
      invalidate();
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      scheduleSnap();
    };

    // global ←/→ berth stepping (only when no control owns the focus)
    const onKey = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;
      const b = useBenchStore.getState().berth;
      if (e.key === "ArrowLeft") {
        useBenchStore.getState().setBerth(Math.max(0, b - 1));
        engage();
        e.preventDefault();
      }
      if (e.key === "ArrowRight") {
        useBenchStore
          .getState()
          .setBerth(Math.min(BERTH_ORDER.length - 1, b + 1));
        engage();
        e.preventDefault();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey);
      if (snapTimer.current) clearTimeout(snapTimer.current);
    };
  }, [gl, invalidate, setBerth]);

  useFrame(() => {
    const diff = target.current - x.current;
    x.current += diff * DAMPING;
    const zdiff = zoomTarget.current - zoom.current;
    zoom.current += zdiff * DAMPING;
    camera.position.x = x.current;
    camera.position.z = zoom.current;
    if (Math.abs(diff) > 0.0008 || Math.abs(zdiff) > 0.0008) invalidate();
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

/** One-line spatial name per berth: the "there is more" hint. DOM over
 *  3D (drei Html). The full nameplate lives in the bottom-left for the
 *  current berth only. */
function BerthNames() {
  return (
    <>
      {BERTH_ORDER.map((id, i) => {
        const station = STATIONS.find((s) => s.id === id)!;
        return (
          <Html
            key={id}
            position={[i * BERTH_SPACING, 0.02, 1.0]}
            center
            style={{ pointerEvents: "none", whiteSpace: "nowrap" }}
          >
            <span
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: 10,
                letterSpacing: "0.22em",
                color: "#6b6459",
              }}
            >
              {station.label}
            </span>
          </Html>
        );
      })}
    </>
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
      {/* spatial order (BENCH-LAYOUT): fork · cocoon — [film/center] —
          movement · seal · figure */}
      <TuningFork position={[berthOf("resonance") * BERTH_SPACING, 0, 0]} />
      <Cocoon position={[berthOf("skeletal-silk") * BERTH_SPACING, 0, 0]} />
      <FilmRoll position={[berthOf("latent") * BERTH_SPACING, 0, 0]} />
      <Movement position={[berthOf("teardown") * BERTH_SPACING, 0, 0]} />
      <Seal position={[berthOf("vestige") * BERTH_SPACING, 0, 0]} />
      <BronzeFigure position={[berthOf("acubot") * BERTH_SPACING, 0, 0]} />
      <BerthNames />
      <Rig />
    </Canvas>
  );
}
