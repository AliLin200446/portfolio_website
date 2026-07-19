"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BERTH_ORDER, berthOf } from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";
import BronzeFigure from "./BronzeFigure";
import Cocoon from "./Cocoon";
import FilmRoll from "./FilmRoll";
import Movement from "./Movement";
import Seal from "./Seal";
import TuningFork from "./TuningFork";

/*
 * CAROUSEL — experimental outward-facing round-table alternative to the
 * linear rail (BENCH-LAYOUT stays intact on feature/bench-home for A/B).
 * Six instruments every 60° on the table edge, backs to the center,
 * faces out toward the viewing arc. The RING rotates (lazy susan); the
 * camera never orbits.
 *
 * Entrance move (§2) status: NOT APPROVED — skipped. Compliant
 * fallback: first visit parks a STATIC overhead establishing shot (the
 * whole table, six objects, zero motion); any input (wheel/drag/key/
 * click) hands the camera a damped descent to the reading pose — user-
 * driven, not autoplay. sessionStorage remembers arrival, so returns
 * land at the reading pose directly. Deep links (?berth=) land engaged.
 * reduced-motion / <768px never mount this scene at all (useBench3d
 * gate) — the DOM list is the whole story there.
 *
 * Constitution: damping 0.08, spring snap always settles on a berth
 * (never between two), no overshoot, frameloop="demand", settled ring =
 * zero rAF, DOM above 3D. Only the front instrument is awake (store
 * berth contract unchanged — instruments' own wake/sleep logic does the
 * resource work); the rest are their static sleep frames. Depth is one
 * warm fog (paper haze, no blue) + perspective shrink: cheap, honest.
 */

const STEP = Math.PI / 3;
const RADIUS = 2.6;
const TABLE_R = 3.5;
const DAMPING = 0.08;
const SNAP_DELAY_MS = 160;

const READ_POS = new THREE.Vector3(0, 1.8, RADIUS + 3.9);
const READ_PITCH = THREE.MathUtils.degToRad(-15);
const OVER_POS = new THREE.Vector3(0, 10, 2.8);
const OVER_PITCH = THREE.MathUtils.degToRad(-75);
const ARRIVED_KEY = "bench-carousel-arrived";

/** Matte tabletop: same paper-noise recipe as the rail worktop. */
function useTableTexture() {
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
    tex.repeat.set(4, 4);
    return tex;
  }, []);
}

const berthAngle = (i: number) => i * STEP;
const berthPos = (i: number): [number, number, number] => [
  Math.sin(berthAngle(i)) * RADIUS,
  0,
  Math.cos(berthAngle(i)) * RADIUS,
];

/**
 * Camera + ring driver. The ring rotation θ is the springed value
 * (θ = -berth·STEP puts that berth at the front); descent progress t
 * lerps the camera overhead→reading pose once the user engages.
 */
function Rig({ ring }: { ring: React.RefObject<THREE.Group | null> }) {
  const { camera, invalidate, gl } = useThree();
  const berth = useBenchStore((s) => s.berth);
  const setBerth = useBenchStore((s) => s.setBerth);
  const theta = useRef(0);
  const target = useRef(0);
  const t = useRef(0); // descent progress 0 overhead → 1 reading
  const tTarget = useRef(0);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyCamera = (camObj: THREE.Camera) => {
    const p = t.current;
    camObj.position.lerpVectors(OVER_POS, READ_POS, p);
    camObj.rotation.set(
      OVER_PITCH + (READ_PITCH - OVER_PITCH) * p,
      0,
      0
    );
  };

  useEffect(() => {
    // ?berth=N deep-link is authoritative at mount; deep link or a
    // previous arrival skips the overhead park entirely
    const raw = new URLSearchParams(window.location.search).get("berth");
    const b = raw === null ? NaN : Number(raw);
    let initial = useBenchStore.getState().berth;
    let engaged = sessionStorage.getItem(ARRIVED_KEY) === "1";
    if (Number.isInteger(b) && b >= 0 && b < BERTH_ORDER.length) {
      initial = b;
      setBerth(b);
      engaged = true;
    }
    theta.current = target.current = -initial * STEP;
    t.current = tTarget.current = engaged ? 1 : 0;
    if (ring.current) ring.current.rotation.y = theta.current;
    applyCamera(camera);
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, invalidate, setBerth, ring]);

  // nav / keyboard / side-click jumps: store is truth — spring the ring
  // to the nearest equivalent angle (shortest way around)
  useEffect(() => {
    let want = -berth * STEP;
    want +=
      Math.round((target.current - want) / (Math.PI * 2)) * Math.PI * 2;
    if (Math.abs(want - target.current) > 0.01) {
      target.current = want;
      tTarget.current = 1;
      invalidate();
    }
  }, [berth, invalidate]);

  useEffect(() => {
    const el = gl.domElement;
    const engage = () => {
      if (tTarget.current !== 1) {
        tTarget.current = 1;
        sessionStorage.setItem(ARRIVED_KEY, "1");
        invalidate(); // demand frameloop: the descent must ask for frames
      }
    };

    const scheduleSnap = () => {
      if (snapTimer.current) clearTimeout(snapTimer.current);
      snapTimer.current = setTimeout(() => {
        const i = Math.round(target.current / STEP);
        target.current = i * STEP; // always settles ON a berth
        setBerth(((-i % 6) + 6) % 6);
        invalidate();
      }, SNAP_DELAY_MS);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      engage();
      target.current -= (e.deltaY + e.deltaX) * 0.0016;
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
      engage();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      target.current = startTarget + (e.clientX - startX) * 0.005;
      invalidate();
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      scheduleSnap();
    };

    // global ←/→ stepping — the ring wraps, no ends
    const onKey = (e: KeyboardEvent) => {
      if (e.target !== document.body) return;
      const b = useBenchStore.getState().berth;
      if (e.key === "ArrowLeft") {
        engage();
        useBenchStore.getState().setBerth((b + 5) % 6);
        e.preventDefault();
      }
      if (e.key === "ArrowRight") {
        engage();
        useBenchStore.getState().setBerth((b + 1) % 6);
        e.preventDefault();
      }
    };
    const onAnyClick = () => engage();

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("click", onAnyClick);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("click", onAnyClick);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey);
      if (snapTimer.current) clearTimeout(snapTimer.current);
    };
  }, [gl, invalidate, setBerth]);

  useFrame((_, delta) => {
    const dTheta = target.current - theta.current;
    theta.current += dTheta * DAMPING;
    // descent: frame-rate-independent damped approach, ease-out, no
    // overshoot; ~1.6s to visually settled
    const dT = tTarget.current - t.current;
    if (dT > 0.0005) {
      t.current += dT * (1 - Math.exp(-2.8 * delta));
    } else if (dT !== 0) {
      t.current = tTarget.current;
    }
    if (ring.current) ring.current.rotation.y = theta.current;
    applyCamera(camera);
    // settled = stop: no residual rAF, the frame goes still
    if (Math.abs(dTheta) > 0.0008 || tTarget.current - t.current > 0.0005)
      invalidate();
  });

  return null;
}

/**
 * Focus glint (#FFB46B, functional): when a berth arrives at the front,
 * one short arc sweeps along the table edge in front of it. One mesh,
 * opacity+rotation animated ~0.6s, then fully transparent and silent.
 */
function GlintArc() {
  const berth = useBenchStore((s) => s.berth);
  const { invalidate } = useThree();
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const pulse = useRef(1); // 1 = done
  const first = useRef(true);

  const geom = useMemo(() => {
    const g = new THREE.RingGeometry(3.05, 3.11, 40, 1, -Math.PI / 2 - 0.3, 0.6);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false; // no glint on initial mount
      return;
    }
    pulse.current = 0;
    invalidate();
  }, [berth, invalidate]);

  useFrame((_, delta) => {
    if (pulse.current >= 1) return;
    pulse.current = Math.min(1, pulse.current + delta / 0.6);
    const p = pulse.current;
    if (mat.current) mat.current.opacity = Math.sin(p * Math.PI) * 0.85;
    if (mesh.current) mesh.current.rotation.y = (p - 0.5) * 0.5;
    invalidate();
  });

  return (
    <mesh ref={mesh} geometry={geom} position={[0, 0.012, 0]}>
      <meshBasicMaterial
        ref={mat}
        color="#FFB46B"
        transparent
        opacity={0}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Invisible click-interceptors over every NON-front berth: clicking a
 * side/rear instrument rotates it to the front instead of firing its
 * own interaction. visible=false meshes still raycast in three — zero
 * draw calls. The front berth has no interceptor, so the awake
 * instrument keeps its native clicks (strike/feed/nudge/stamp).
 * TODO(project-page hook): front-instrument click-through to the split
 * live-demo page is wired in a separate prompt once live URLs are
 * confirmed; until then the nameplate link is the route in.
 */
function SideClickTargets() {
  const berth = useBenchStore((s) => s.berth);
  const setBerth = useBenchStore((s) => s.setBerth);
  return (
    <>
      {BERTH_ORDER.map((id, i) =>
        i === berth ? null : (
          <group key={id} position={berthPos(i)} rotation={[0, berthAngle(i), 0]}>
            <mesh
              position={[0, 0.75, 0]}
              visible={false}
              onClick={(e) => {
                e.stopPropagation();
                setBerth(i);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = "pointer";
              }}
              onPointerOut={() => {
                document.body.style.cursor = "";
              }}
            >
              <boxGeometry args={[1.3, 1.7, 1.3]} />
            </mesh>
          </group>
        )
      )}
    </>
  );
}

function Table() {
  const tex = useTableTexture();
  return (
    <mesh position={[0, -0.07, 0]}>
      <cylinderGeometry args={[TABLE_R, TABLE_R, 0.14, 64]} />
      <meshStandardMaterial map={tex} roughness={1} metalness={0} />
    </mesh>
  );
}

export default function Carousel() {
  const ring = useRef<THREE.Group>(null);
  useEffect(() => {
    useBenchStore.getState().setBoot(35, "three runtime");
  }, []);
  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ fov: 40 }}
      gl={{ antialias: true, powerPreference: "low-power" }}
      onCreated={({ gl, scene, camera }) => {
        gl.setClearColor("#F5F2EC");
        const { setBoot } = useBenchStore.getState();
        setBoot(60, "webgl context");
        let meshes = 0;
        scene.traverse((o) => {
          if ((o as THREE.Mesh).isMesh) meshes += 1;
        });
        setBoot(70, `shader compile · ${meshes} meshes`);
        const done = () => setBoot(100, "ready");
        gl.compileAsync(scene, camera).then(done).catch(done);
      }}
      aria-hidden
    >
      {/* warm paper haze: rear of the ring dims and recedes — no blue */}
      <fog attach="fog" args={["#E9E3D6", 7, 20]} />
      <directionalLight position={[-3, 6, 4]} intensity={1.4} color="#fff6e8" />
      <ambientLight intensity={0.75} />
      <Table />
      <group ref={ring}>
        {/* outward-facing: each berth rotated to its tangent normal so
            the face always addresses the viewing arc */}
        <group position={berthPos(berthOf("resonance"))} rotation={[0, berthAngle(berthOf("resonance")), 0]}>
          <TuningFork position={[0, 0, 0]} />
        </group>
        <group position={berthPos(berthOf("skeletal-silk"))} rotation={[0, berthAngle(berthOf("skeletal-silk")), 0]}>
          <Cocoon position={[0, 0, 0]} />
        </group>
        <group position={berthPos(berthOf("latent"))} rotation={[0, berthAngle(berthOf("latent")), 0]}>
          <FilmRoll position={[0, 0, 0]} />
        </group>
        <group position={berthPos(berthOf("teardown"))} rotation={[0, berthAngle(berthOf("teardown")), 0]}>
          <Movement position={[0, 0, 0]} />
        </group>
        <group position={berthPos(berthOf("vestige"))} rotation={[0, berthAngle(berthOf("vestige")), 0]}>
          <Seal position={[0, 0, 0]} />
        </group>
        <group position={berthPos(berthOf("acubot"))} rotation={[0, berthAngle(berthOf("acubot")), 0]}>
          <BronzeFigure position={[0, 0, 0]} />
        </group>
        <SideClickTargets />
      </group>
      <GlintArc />
      <Rig ring={ring} />
    </Canvas>
  );
}
