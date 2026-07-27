"use client";

import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { BERTH_ORDER, STATIONS, berthOf } from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";
import Cloth, { clothDrag, getWeaveURL } from "./Cloth";
import Cocoon from "./Cocoon";
import FilmRoll from "./FilmRoll";
import Movement from "./Movement";
import Seal from "./Seal";

/*
 * CAROUSEL — experimental outward-facing round-table alternative to the
 * linear rail (BENCH-LAYOUT stays intact on feature/bench-home for A/B).
 * Six instruments every 60° on the table edge, backs to the center,
 * faces out toward the viewing arc. The RING rotates (lazy susan); the
 * camera never orbits.
 *
 * Entrance move (§2) status: NOT APPROVED — skipped. Compliant
 * fallback: first visit parks a STATIC overhead establishing shot; any
 * input hands the camera a damped descent to the reading pose — user-
 * driven, not autoplay. sessionStorage remembers arrival; ?berth= deep
 * links land engaged. reduced-motion / <768px never mount this scene
 * (useBench3d gate) — the DOM list is the whole story there.
 *
 * HOVER (§决策C): pointer over an instrument raises a one-line Geist
 * Mono DOM card (facts only) + prefetches the case route + pulses the
 * table-edge glint. Hover never fires an instrument's mechanism.
 *
 * TRANSITION (穿过表面进入): click the FRONT instrument → three beats,
 * ≤1.0s total: (1) the instrument answers with its OWN existing
 * mechanism (feed / strike / lantern / hard-stop / stamp — triggered
 * through the same store bridges the nameplates use, zero new
 * choreography), (2) the camera dives ease-out toward the object,
 * (3) a DOM surface matching that object's material takes the viewport
 * and the case page arrives already dressed in it (BenchArrival veil) —
 * no black, no curtain, zero new render targets. Esc / any press
 * during the dive reverses at 1.5×; walking back in from a case page
 * plays the same path backwards in 0.5s. ACUBOT has no destination yet
 * (and its needle mechanism retired with B6-REV), so it hovers but
 * does not enter — wiring waits for mechanism/data/page to exist.
 *
 * Constitution: damping 0.08, snap always ON a berth, no overshoot,
 * frameloop="demand", settled = zero rAF, DOM above 3D, warm fog only.
 */

// derived, never hardcoded: five instruments must close the full circle,
// and the next add or drop must not leave a gap where a berth used to be
const STEP = (Math.PI * 2) / BERTH_ORDER.length;
const RADIUS = 2.6;
const TABLE_R = 3.5;
const DAMPING = 0.08;
const SNAP_DELAY_MS = 160;

const READ_POS = new THREE.Vector3(0, 1.8, RADIUS + 3.9);
const READ_PITCH = THREE.MathUtils.degToRad(-15);
const OVER_POS = new THREE.Vector3(0, 10, 2.8);
const OVER_PITCH = THREE.MathUtils.degToRad(-75);
const ARRIVED_KEY = "bench-carousel-arrived";
const CUT_KEY = "bench-cut";

/* Transition timeline (§5): ONE 1.0s grammar — answer ~0.2 / dive
 * ~0.55 / cut ~0.25 — but the beats are WINDOWS on a single master
 * curve, not chained tweens: camera progress is C1-continuous across
 * every boundary (§1), so the reverse (1.5×) and the walk-back inherit
 * the same velocity profile for free. The route handover fires at
 * T_NAV, after the overlay is opaque; the visual cut (overlay crossing
 * ~50%) lands near peak camera speed — the invisible-cut trick (§7). */
const T_TOTAL = 1.0;
const T_NAV = 0.85;
const FADE_START = 0.6;
const FADE_LEN = 0.22;

/** cubic-bezier(x1,y1,x2,y2) easing — Newton on x, like CSS. */
function cubicBezierEase(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let u = x;
    for (let i = 0; i < 5; i++) {
      const f = ((ax * u + bx) * u + cx) * u - x;
      if (Math.abs(f) < 1e-4) break;
      const d = (3 * ax * u + 2 * bx) * u + cx;
      if (d !== 0) u -= f / d;
    }
    return ((ay * u + by) * u + cy) * u;
  };
}
/** The weighty master curve (§4): slow creep through the answer beat,
 *  peak velocity mid-dive, still moving when the overlay covers. */
const MASTER = cubicBezierEase(0.65, 0, 0.35, 1);
const ROLL_MAX = THREE.MathUtils.degToRad(2.2);

type DivePose = { y: number; z: number; pitch: number };
/** Where the camera lands inside each instrument's surface (front berth
 *  world frame: object at (0,0,RADIUS)). Chosen per §3: leader / arms /
 *  shell / bridge slit / stamp face. */
const DIVES: Record<string, DivePose> = {
  latent: { y: 0.5, z: RADIUS + 1.0, pitch: -6 },
  "skeletal-silk": { y: 0.56, z: RADIUS + 0.95, pitch: -2 },
  teardown: { y: 0.85, z: RADIUS + 0.7, pitch: -38 },
  vestige: { y: 0.5, z: RADIUS + 1.0, pitch: -18 },
  // TRANSITION: 揭帛 pending,另轮实装 — 现走通用覆面 crossfade,无答礼拍
  "material-memory": { y: 0.55, z: RADIUS + 1.1, pitch: -8 },
};

/** The surface each cut hands to the case page. Colors match
 *  BenchArrival's CUT_BG so the route change is invisible. */
const CUT_SURFACE: Record<string, { bg: string; label?: string }> = {
  latent: { bg: "#14100d" },
  "skeletal-silk": { bg: "#FBF5E8" },
  teardown: { bg: "#241C15", label: "LOG #—" },
  vestige: { bg: "#F5F2EC" },
  "material-memory": { bg: "#F5F2EC" }, // 揭帛 pending: paper crossfade
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** Matte tabletop: same paper-noise recipe as the rail worktop. */
const berthAngle = (i: number) => i * STEP;
const berthPos = (i: number): [number, number, number] => [
  Math.sin(berthAngle(i)) * RADIUS,
  0,
  Math.cos(berthAngle(i)) * RADIUS,
];

/**
 * Camera + ring + transition driver. Ring rotation θ springs to
 * -berth·STEP; descent progress t lerps overhead→reading; transition
 * time tt lerps reading→dive and drives the overlay handover.
 */
function Rig({
  ring,
  overlayEl,
  onCut,
}: {
  ring: React.RefObject<THREE.Group | null>;
  overlayEl: React.RefObject<HTMLDivElement | null>;
  onCut: (id: string) => void;
}) {
  const { camera, invalidate, gl } = useThree();
  const berth = useBenchStore((s) => s.berth);
  const setBerth = useBenchStore((s) => s.setBerth);
  const transitionId = useBenchStore((s) => s.transitionId);
  const theta = useRef(0);
  const target = useRef(0);
  const t = useRef(0); // descent progress 0 overhead → 1 reading
  const tTarget = useRef(0);
  const tt = useRef(0); // transition time (s)
  const cutDone = useRef(false);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const poseAt = (out: {
    pos: THREE.Vector3;
    pitch: number;
    roll: number;
  }): void => {
    // base pose from the descent…
    const p = t.current;
    out.pos.lerpVectors(OVER_POS, READ_POS, p);
    out.pitch = OVER_PITCH + (READ_PITCH - OVER_PITCH) * p;
    out.roll = 0;
    // …then the dive ARCS on top (§2): a quadratic bezier that drifts
    // sideways and sinks a touch instead of the shortest line, with a
    // path-inherent lean ≤2.2° — no orbit, no free look. dp comes off
    // the single MASTER curve, so it is C1 through every beat.
    const id = useBenchStore.getState().transitionId;
    const dive = id ? DIVES[id] : undefined;
    if (dive) {
      const dp = MASTER(clamp01(tt.current / T_TOTAL));
      const bx = out.pos.x, by = out.pos.y, bz = out.pos.z;
      const cx = bx / 2 + 0.38;
      const cy = (by + dive.y) / 2 - 0.14;
      const cz = (bz + dive.z) / 2;
      const q = 1 - dp;
      out.pos.set(
        q * q * bx + 2 * q * dp * cx,
        q * q * by + 2 * q * dp * cy + dp * dp * dive.y,
        q * q * bz + 2 * q * dp * cz + dp * dp * dive.z
      );
      out.pitch +=
        (THREE.MathUtils.degToRad(dive.pitch) - out.pitch) * dp;
      out.roll = Math.sin(dp * Math.PI) * ROLL_MAX;
    }
  };

  const scratch = useRef({ pos: new THREE.Vector3(), pitch: 0, roll: 0 });
  const applyCamera = (cam: THREE.Camera) => {
    poseAt(scratch.current);
    cam.position.copy(scratch.current.pos);
    cam.rotation.set(scratch.current.pitch, 0, scratch.current.roll);
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

    // stale transition from an outbound nav dies here; then, if we came
    // back from a case page entered THROUGH an instrument, resume at the
    // cut frame and reverse out — the 0.5s walk-back (器物落回醒态)
    useBenchStore.getState().endTransition();
    const back = sessionStorage.getItem(CUT_KEY);
    if (engaged && back && BERTH_ORDER[initial] === back && DIVES[back]) {
      sessionStorage.removeItem(CUT_KEY);
      tt.current = T_NAV; // resume at the handover frame
      if (overlayEl.current) overlayEl.current.style.opacity = "1";
      useBenchStore.getState().startTransition(back);
      useBenchStore.getState().reverseTransition();
    } else {
      tt.current = 0;
    }
    cutDone.current = false;
    applyCamera(camera);
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, invalidate, setBerth, ring, overlayEl]);

  // a fresh forward transition starts its clock here
  useEffect(() => {
    if (transitionId && useBenchStore.getState().transitionDir === 1) {
      tt.current = 0;
      cutDone.current = false;
    }
    invalidate();
  }, [transitionId, invalidate]);

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
    const transiting = () => useBenchStore.getState().transitionId !== null;
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
      if (transiting() || clothDrag.active) return;
      engage();
      target.current -= (e.deltaY + e.deltaX) * 0.0016;
      scheduleSnap();
      invalidate();
    };

    let dragging = false;
    let startX = 0;
    let startTarget = 0;
    const onDown = (e: PointerEvent) => {
      if (transiting() || clothDrag.active) return;
      dragging = true;
      startX = e.clientX;
      startTarget = target.current;
      engage();
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || clothDrag.active) return;
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
      if (e.key === "Escape" && transiting()) {
        useBenchStore.getState().reverseTransition();
        invalidate();
        return;
      }
      if (e.target !== document.body || transiting()) return;
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
    // any press mid-transition = pull back out (1.5× reverse)
    const onPressCapture = () => {
      if (transiting()) {
        useBenchStore.getState().reverseTransition();
        invalidate();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("click", onAnyClick);
    window.addEventListener("pointerdown", onPressCapture, true);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("click", onAnyClick);
      window.removeEventListener("pointerdown", onPressCapture, true);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey);
      if (snapTimer.current) clearTimeout(snapTimer.current);
    };
  }, [gl, invalidate, setBerth]);

  useFrame((_, delta) => {
    const dTheta = target.current - theta.current;
    theta.current += dTheta * DAMPING;
    // descent: frame-rate-independent damped approach, ease-out
    const dT = tTarget.current - t.current;
    if (dT > 0.0005) {
      t.current += dT * (1 - Math.exp(-2.8 * delta));
    } else if (dT !== 0) {
      t.current = tTarget.current;
    }

    // transition clock: forward 1×, reverse 1.5×; overlay is written
    // directly (no per-frame React)
    const state = useBenchStore.getState();
    let transBusy = false;
    if (state.transitionId) {
      const dir = state.transitionDir;
      tt.current += delta * (dir === 1 ? 1 : -1.5);
      if (overlayEl.current)
        overlayEl.current.style.opacity = String(
          clamp01((tt.current - FADE_START) / FADE_LEN)
        );
      if (dir === 1 && tt.current >= T_NAV) {
        tt.current = T_NAV;
        if (!cutDone.current) {
          cutDone.current = true;
          onCut(state.transitionId);
        }
      } else if (dir === -1 && tt.current <= 0) {
        tt.current = 0;
        state.endTransition();
        if (overlayEl.current) overlayEl.current.style.opacity = "0";
      } else {
        transBusy = true;
      }
    }

    if (ring.current) ring.current.rotation.y = theta.current;
    applyCamera(camera);
    // settled = stop: no residual rAF, the frame goes still
    if (
      Math.abs(dTheta) > 0.0008 ||
      tTarget.current - t.current > 0.0005 ||
      transBusy
    )
      invalidate();
  });

  return null;
}

/**
 * Focus glint (#FFB46B, functional): one short arc sweeps along the
 * table edge when a berth arrives at the front, and again when the
 * front instrument is hovered (§1 既有可供性). One mesh, ~0.6s, then
 * fully transparent and silent.
 */
function GlintArc() {
  const berth = useBenchStore((s) => s.berth);
  const hovered = useBenchStore((s) => s.hovered);
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

  // hover on the FRONT instrument re-arms the glint once per hover
  useEffect(() => {
    if (hovered && hovered === BERTH_ORDER[berth]) {
      pulse.current = 0;
      invalidate();
    }
  }, [hovered, berth, invalidate]);

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
 * Invisible pointer targets over every berth (visible=false still
 * raycasts — zero draw calls). Hover raises the info card (+prefetch,
 * +glint via store). Click: side berth rotates to front; FRONT berth
 * begins the enter-transition. Instruments' own pointer handlers are
 * shadowed by design — mechanisms fire through the nameplate buttons
 * and as transition answer beats, never from a stray hover (§1).
 */
/** CLICK-SPLIT: the first click belongs to the instrument, not to
 *  navigation. Front single click plays the mechanism through the
 *  existing store bridges (repeatable); double click (250ms window)
 *  enters via the existing transition; side click still rotates.
 *  teardown has no click bridge for the hard-stop — reported, not
 *  invented; enter → lives on its nameplate. */
function playMechanism(id: string) {
  const s = useBenchStore.getState();
  if (id === "latent") s.b1Feed();
  if (id === "skeletal-silk") s.b3Pull();
  if (id === "vestige") s.b5Stamp();
}

function PointerTargets({
  beginTransition,
}: {
  beginTransition: (id: string) => void;
}) {
  const berth = useBenchStore((s) => s.berth);
  const setBerth = useBenchStore((s) => s.setBerth);
  const setHovered = useBenchStore((s) => s.setHovered);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** One click path for every instrument. Off-berth: spin the ring to
   *  it. On-berth: single click plays the mechanism, double click
   *  enters. Material Memory has no hit box at its own berth (the cloth
   *  needs the pointer to drag), so the cloth calls this itself. */
  const select = (i: number, id: string) => {
    if (useBenchStore.getState().transitionId) return;
    if (i !== berth) {
      setBerth(i);
      return;
    }
    if (pending.current) {
      clearTimeout(pending.current);
      pending.current = null;
      beginTransition(id); // double click = enter
    } else {
      pending.current = setTimeout(() => {
        pending.current = null;
        playMechanism(id); // single click = play, no nav
      }, 250);
    }
  };

  return (
    <>
      {BERTH_ORDER.map((id, i) =>
        id === "material-memory" && i === berth ? null : (
        <group
          key={id}
          position={berthPos(i)}
          rotation={[0, berthAngle(i), 0]}
        >
          <mesh
            position={[0, 0.75, 0]}
            visible={false}
            onClick={(e) => {
              e.stopPropagation();
              select(i, id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(id);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHovered(null);
              document.body.style.cursor = "";
            }}
          >
            <boxGeometry args={[1.3, 1.7, 1.3]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Table() {
  return (
    <mesh position={[0, -0.07, 0]}>
      {/* a bevelled rim, as on the reference: the top radius sits proud
          of the base so the edge catches a highlight instead of ending
          in a hard cylinder wall */}
      <cylinderGeometry args={[TABLE_R, TABLE_R * 0.985, 0.16, 96]} />
      {/* solid paper: no map, no grain — the instruments are the
          subject and the surface should not compete with them */}
      <meshStandardMaterial color="#F5F2EC" roughness={0.72} metalness={0} />
    </mesh>
  );
}

/** §1 hover card: one Geist Mono line, no thumbnails, no adjectives.
 *  DOM above 3D; fade 0.2s; prefetches the internal case route. */
function HoverCard() {
  const hovered = useBenchStore((s) => s.hovered);
  const router = useRouter();
  const last = useRef<string | null>(null);
  if (hovered) last.current = hovered;
  const station = last.current
    ? STATIONS.find((s) => s.id === last.current)
    : undefined;

  useEffect(() => {
    if (!hovered) return;
    const st = STATIONS.find((s) => s.id === hovered);
    if (st?.href && !st.external) router.prefetch(st.href);
  }, [hovered, router]);

  if (!station?.hover) return null;
  // FISH-POLISH §3 取证: exit was a bare 0.2s opacity fade, no motion.
  // Now: in = 0.2s fade + 4px rise; out = 0.15s fade + 4px sink. One
  // card instance keyed on the last hovered id — a fast sweep across
  // instruments REPLACES the card content, never stacks ghosts.
  // reduced-motion: .hovercard transitions killed in globals.css.
  return (
    <div
      aria-hidden
      className="hovercard fixed z-10 font-mono"
      style={{
        left: "50%",
        bottom: 148,
        fontSize: 11,
        letterSpacing: "0.08em",
        color: "#1a1714",
        background: "rgba(245,242,236,0.92)",
        border: "0.5px solid #E3DED4",
        padding: "6px 12px",
        whiteSpace: "nowrap",
        pointerEvents: hovered ? "auto" : "none",
        opacity: hovered ? 1 : 0,
        transform: hovered
          ? "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(4px)",
        transition: hovered
          ? "opacity 0.2s ease, transform 0.2s ease"
          : "opacity 0.15s ease, transform 0.15s ease",
      }}
    >
      {station.hover}
      {station.href && !station.external && (
        <a
          href={station.href}
          className="enter-press ml-3 border-b border-bronze pb-px outline-none transition-colors hover:text-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]"
        >
          enter →
        </a>
      )}
    </div>
  );
}

/** The cut surface: a DOM sheet the dive hands the viewport to. Its
 *  opacity is written directly by the Rig each frame; its face matches
 *  BenchArrival's veil so the route swap is invisible. Zero RT. */
function CutOverlay({
  overlayEl,
}: {
  overlayEl: React.RefObject<HTMLDivElement | null>;
}) {
  const transitionId = useBenchStore((s) => s.transitionId);
  const surface = transitionId ? CUT_SURFACE[transitionId] : undefined;
  return (
    <div
      ref={(el) => {
        overlayEl.current = el;
        // opacity lives OUTSIDE React so per-frame writes survive rerenders
        if (el && !el.dataset.init) {
          el.style.opacity = "0";
          el.dataset.init = "1";
        }
      }}
      aria-hidden
      className="fixed inset-0 z-[6] flex items-center justify-center"
      style={{
        background: surface?.bg ?? "transparent",
        pointerEvents: "none",
      }}
    >
      {transitionId === "latent" && (
        <div
          // one-shot halation: the film base answers with a single warm
          // bloom-free flare (existing aesthetic, CSS only, no RT)
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 50% 44%, rgba(255,140,70,0.32), transparent 55%)",
            animation: "bench-halation 0.45s ease-out 0.5s both",
          }}
        />
      )}
      {/* UNVEIL 拍③: the page develops out of the warp/weft — the
          cloth's own weave canvas as a fading CSS layer, zero new RT */}
      {transitionId === "material-memory" && getWeaveURL() && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${getWeaveURL()})`,
            backgroundSize: "160px",
            animation: "bench-weave 0.3s ease-out 0.72s both",
          }}
        />
      )}
      {surface?.label && (
        <span
          className="font-mono"
          style={{
            fontSize: 11,
            letterSpacing: "0.3em",
            color: "#C8C6C0",
            // §3: the wheels stop FIRST, the measurement floats in after
            animation: "bench-label-in 0.2s ease 0.05s both",
          }}
        >
          {surface.label}
        </span>
      )}
    </div>
  );
}

export default function Carousel() {
  const ring = useRef<THREE.Group>(null);
  const overlayEl = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    useBenchStore.getState().setBoot(35, "three runtime");
  }, []);

  /** Beat 1: the instrument answers with its own mechanism, through the
   *  same store bridge the nameplate buttons use. Cocoon (lantern) and
   *  Movement (hard stop) respond to transitionId directly. */
  const beginTransition = (id: string) => {
    const station = STATIONS.find((s) => s.id === id);
    if (!station?.href || !DIVES[id]) return; // ACUBOT: no entry yet
    const s = useBenchStore.getState();
    if (s.transitionId) return;
    if (id === "material-memory" && clothDrag.active) {
      // 拖拽中触发 enter: let go, settle a beat, then unveil
      setTimeout(() => {
        if (!useBenchStore.getState().transitionId)
          useBenchStore.getState().startTransition(id);
      }, 200);
      return;
    }
    if (id === "latent") s.b1Feed();
      if (id === "vestige") s.b5Stamp();
    // The dive is a fixed pose at the FRONT of the ring — it does not
    // aim at an object. So entering before the ring has actually
    // arrived flies the camera at whoever is standing at the front
    // instead. The store's berth updates instantly while the ring
    // springs over about a second, so checking berth alone is not
    // enough: wait for the geometry, not the state.
    const want = -berthOf(id) * STEP;
    const settled = () => {
      const cur = ring.current?.rotation.y ?? want;
      let d = (cur - want) % (Math.PI * 2);
      if (d > Math.PI) d -= Math.PI * 2;
      if (d < -Math.PI) d += Math.PI * 2;
      return Math.abs(d) < 0.02;
    };
    if (settled()) {
      s.startTransition(id);
      return;
    }
    let frames = 0;
    const wait = () => {
      if (useBenchStore.getState().transitionId) return;
      if (settled() || ++frames > 180) {
        useBenchStore.getState().startTransition(id);
        return;
      }
      requestAnimationFrame(wait);
    };
    requestAnimationFrame(wait);
  };

  /** Material Memory's click path. Its hit box is deliberately absent
   *  at its own berth so the cloth can be dragged, so the cloth forwards
   *  clicks here and gets the same single-plays / double-enters
   *  contract every other instrument has. */
  const clothPending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clothSelect = () => {
    const st = useBenchStore.getState();
    if (st.transitionId) return;
    const mine = berthOf("material-memory");
    if (st.berth !== mine) {
      st.setBerth(mine);
      return;
    }
    if (clothPending.current) {
      clearTimeout(clothPending.current);
      clothPending.current = null;
      beginTransition("material-memory");
    } else {
      clothPending.current = setTimeout(() => {
        clothPending.current = null;
      }, 250);
    }
  };

  /** Beat 3: the surface owns the viewport — hand over to the route.
   *  The CUT_KEY flag dresses the case page in the same surface
   *  (BenchArrival) and later arms the 0.5s walk-back reverse. */
  const onCut = (id: string) => {
    const station = STATIONS.find((s) => s.id === id);
    if (!station?.href) return;
    sessionStorage.setItem(CUT_KEY, id);
    if (station.external) window.location.href = station.href;
    else router.push(station.href);
  };

  return (
    <>
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
        <directionalLight
          position={[-3, 6, 4]}
          intensity={1.4}
          color="#fff6e8"
        />
        <ambientLight intensity={0.75} />
        <Table />
        <group ref={ring}>
          {/* outward-facing: each berth rotated to its tangent normal so
              the face always addresses the viewing arc */}
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
        <group position={berthPos(berthOf("material-memory"))} rotation={[0, berthAngle(berthOf("material-memory")), 0]}>
          <Cloth position={[0, 0, 0]} onSelect={clothSelect} />
        </group>
          <PointerTargets beginTransition={beginTransition} />
        </group>
        <GlintArc />
        <Rig ring={ring} overlayEl={overlayEl} onCut={onCut} />
      </Canvas>
      <HoverCard />
      <CutOverlay overlayEl={overlayEl} />
    </>
  );
}
