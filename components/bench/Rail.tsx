"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import {
  BERTH_MAX,
  BERTH_ORDER,
  BERTH_SPACING,
  HOME_BERTH,
  STATIONS,
  berthOf,
  railX,
} from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";
import Cloth, { clothDrag, getWeaveURL } from "./Cloth";
import Cocoon from "./Cocoon";
import FilmRoll from "./FilmRoll";
import Movement from "./Movement";
import Seal from "./Seal";

/*
 * THE RAIL. Five instruments on one straight line, one on screen at a
 * time, in a fixed order.
 *
 * This replaces the turntable. The turntable said "here is a table of
 * things, take your pick"; the rail says "here they are, in this
 * order". Only one of those is a portfolio. The camera translates
 * along X and never rotates or orbits; the scene does not move.
 *
 * ENDS ARE HARD. Past either end the target is resisted at 0.35 and
 * springs back on release. No wrap: the sequence is the argument, and
 * looping it would say every position is interchangeable.
 *
 * MOUNTING. Only |i - berth| <= 1 carries geometry. The berth index
 * follows the camera continuously rather than only on snap, so a long
 * drag mounts each instrument before it enters frame instead of
 * revealing an empty rail.
 *
 * HOVER (§决策C): pointer over the front instrument raises a one-line
 * Geist Mono DOM card, prefetches the case route, and plays that
 * instrument's own mechanism. Never fires for a neighbour.
 *
 * TRANSITION (穿过表面进入): click → three beats, <=1.0s: the
 * instrument answers with its own mechanism, the camera dives along an
 * arc into its surface, and a DOM sheet matching that surface takes
 * the viewport so the case page arrives already dressed in it
 * (BenchArrival). Esc or any press reverses at 1.5x. Unchanged from
 * the turntable except for where the dive aims.
 *
 * Constitution: frameloop="demand", settled = zero rAF, DOM above 3D,
 * warm fog only, no shadows, no orbit.
 */

/* ── camera ────────────────────────────────────────────────────────
 * One reading pose, translated along X. There is no establishing shot
 * any more: an overhead park existed to show the whole table at once,
 * and a rail that shows one object at a time has nothing to establish.
 */
const FOV = 40;
const CAM_Y = 1.05;
const CAM_Z = 3.3;
const CAM_PITCH = THREE.MathUtils.degToRad(-7.6);

const DAMPING = 0.11;
const SNAP_DELAY_MS = 160;
/** how much of a push past either end actually lands. Low enough to
 *  feel like a wall, high enough that the wall is visible. */
const EDGE_RESIST = 0.35;
/** world units. Under this the rail counts as standing still, which is
 *  what gates hover and what the dive waits for. */
const SETTLE_EPS = 0.02;

/* Travel is expressed per berth, not per world unit, so the feel does
 * not change if the rail is ever spaced differently. */
const WHEEL_PER_BERTH = 790; // wheel units to cross one berth
const DRAG_PER_BERTH = 252; // pixels to cross one berth
const WHEEL_K = BERTH_SPACING / WHEEL_PER_BERTH;
const DRAG_K = BERTH_SPACING / DRAG_PER_BERTH;

/* ── the stage ─────────────────────────────────────────────────────
 * Every instrument is scaled to fit this box and stood on y = 0.
 *
 * They are not built to a shared scale and never were: measured at the
 * reading pose, the film canister is 0.448 world units tall and the
 * movement 0.288, so mounting them at their own size would have shown
 * one instrument at 25 percent of the frame and the next at 16. On a
 * turntable, where you saw all five at once, relative size was
 * information. One at a time it is only noise, so each gets the same
 * stage instead of the same scale factor.
 *
 * The box is 86 percent of the frame's width and 62 percent of its
 * height, whichever binds first, so nothing is ever cropped. The
 * height figure is set by the masthead: the floor projects to 74
 * percent down the frame and the masthead ends at 6, so 62 is what
 * fits between them without an instrument sliding under the nav. Which one
 * binds depends on the model: the wide ones (a canister on its side, a
 * movement lying flat) run out of width first and land near half the
 * frame height. Filling 70 percent of the HEIGHT with a shape 2.6 times
 * wider than it is tall would need 110 percent of the width at 16:9,
 * so it is not on offer without cutting the object in half.
 *
 * Frame width follows the window, so this is measured at runtime and
 * re-measured on resize. */
const STAGE_W_FRAC = 0.86;
const STAGE_H_FRAC = 0.62;
/** Perpendicular distance from the camera to the plane the instruments
 *  stand in, which is what sets how much frame there is to fill. */
const READ_DEPTH = CAM_Z * Math.cos(CAM_PITCH) - CAM_Y * Math.sin(CAM_PITCH);
/** The frame at that distance, in world units. Height is fixed by the
 *  vertical fov; width follows the window, which is why the stage has
 *  to be measured at runtime rather than written down. */
const frameAt = (depth: number, w: number, h: number) => {
  const fh = 2 * depth * Math.tan(THREE.MathUtils.degToRad(FOV) / 2);
  return { w: fh * (w / h), h: fh };
};
const stageOf = (w: number, h: number) => {
  const f = frameAt(READ_DEPTH, w, h);
  return { w: f.w * STAGE_W_FRAC, h: f.h * STAGE_H_FRAC };
};


const CUT_KEY = "bench-cut";

/* Transition timeline: ONE 1.0s grammar, answer ~0.2 / dive to 0.85 /
 * handover at 0.85. Reverse runs the same curve at 1.5x. */
const T_TOTAL = 1.0;
const T_NAV = 0.85;
const FADE_START = 0.6;
const FADE_LEN = 0.22;

function cubicBezierEase(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const fx = (t: number) => ((ax * t + bx) * t + cx) * t;
  const fy = (t: number) => ((ay * t + by) * t + cy) * t;
  const dfx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 5; i += 1) {
      const d = dfx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= (fx(t) - x) / d;
    }
    return fy(Math.max(0, Math.min(1, t)));
  };
}
const MASTER = cubicBezierEase(0.65, 0, 0.35, 1);
const ROLL_MAX = THREE.MathUtils.degToRad(2.2);

/** Where the camera lands inside each instrument's surface. `z` is the
 *  distance left in front of the object, so these read as the same
 *  numbers they were on the turntable, where the front berth stood at
 *  z = RADIUS rather than at the origin. */
type DivePose = { y: number; z: number; pitch: number };
const DIVES: Record<string, DivePose> = {
  latent: { y: 0.5, z: 1.0, pitch: -6 },
  "skeletal-silk": { y: 0.56, z: 0.95, pitch: -2 },
  teardown: { y: 0.85, z: 0.7, pitch: -38 },
  vestige: { y: 0.5, z: 1.0, pitch: -18 },
  // TRANSITION: 揭帛 pending,另轮实装: 现走通用覆面 crossfade,无答礼拍
  "material-memory": { y: 0.55, z: 1.1, pitch: -8 },
};

/** The surface each cut hands to the case page. Colors match
 *  BenchArrival's CUT_BG so the route change is invisible. */
const CUT_SURFACE: Record<string, { bg: string; label?: string }> = {
  latent: { bg: "#14100d" },
  "skeletal-silk": { bg: "#FBF5E8" },
  teardown: { bg: "#241C15", label: "LOG #: " },
  vestige: { bg: "#F5F2EC" },
  "material-memory": { bg: "#F5F2EC" }, // 揭帛 pending: paper crossfade
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const clampRail = (x: number) => Math.max(0, Math.min(BERTH_MAX, x));
/** Nearest berth to a rail position, always a real index. Everything
 *  that used to take a modulo takes this instead: the ring wrapped, the
 *  rail ends, and a modulo here is how a click reached the wrong
 *  instrument the last two times. */
const berthAt = (x: number) =>
  Math.max(0, Math.min(BERTH_ORDER.length - 1, Math.round(x / BERTH_SPACING)));

/** How far past the last berth a push has to travel before it stops
 *  being a bounce and becomes a way out. Just over three quarters of a
 *  berth: about 200px of drag or one firm trackpad throw, which is more
 *  than anyone does by accident and less than a wrestle. Nothing
 *  equivalent guards the left end, because there is nothing before the
 *  first instrument to arrive at. */
const EXIT_PUSH = BERTH_SPACING * 0.8;

/** Past either end, only EDGE_RESIST of the push lands. */
const resist = (x: number) => {
  if (x < 0) return x * EDGE_RESIST;
  if (x > BERTH_MAX) return BERTH_MAX + (x - BERTH_MAX) * EDGE_RESIST;
  return x;
};

/**
 * Screen-space Y of the world y=0 plane, as a fraction of viewport
 * height, derived from the camera constants above. The horizon rule
 * under the instruments is a DOM element, so it has to be told where
 * the floor projects to; computing it here means it cannot drift out
 * of step with the camera the way a hand-tuned percentage would.
 */
export function horizonFrac(): number {
  const cp = Math.cos(CAM_PITCH);
  const sp = Math.sin(CAM_PITCH);
  const yc = -CAM_Y * cp + -CAM_Z * sp;
  const depth = -(-CAM_Y * -sp + -CAM_Z * cp);
  const ndc = yc / depth / Math.tan(THREE.MathUtils.degToRad(FOV) / 2);
  return 0.5 - 0.5 * ndc;
}

/** Shared rail position. `x` is where the camera is, `target` where it
 *  is heading (already resisted at the ends), `raw` the unresisted
 *  accumulation so a continued push keeps meeting the same wall. */
type RailPos = { x: number; target: number; raw: number };

/* ── camera + transition driver ───────────────────────────────────── */

function Rig({
  pos,
  overlayEl,
  onCut,
  onPastEnd,
}: {
  pos: React.RefObject<RailPos>;
  overlayEl: React.RefObject<HTMLDivElement | null>;
  onCut: (id: string) => void;
  onPastEnd: () => void;
}) {
  const { camera, invalidate, gl } = useThree();
  const berth = useBenchStore((s) => s.berth);
  const setBerth = useBenchStore((s) => s.setBerth);
  const transitionId = useBenchStore((s) => s.transitionId);
  // a drag moves the camera directly, so the caption and the ticks
  // follow the target rather than waiting for the snap
  const dragBerth = useRef(-1);
  // one exit per gesture: the check runs on every wheel tick and every
  // pointermove, and the route change is not instant
  const exited = useRef(false);
  /** How far past the last berth this push has travelled. Kept apart
   *  from `raw`, which the snap clamps back onto a berth 160ms after
   *  the last input: a deliberate, unhurried shove against the wall
   *  stalls for longer than that between events, and measuring the exit
   *  off `raw` meant it only ever fired inside one uninterrupted burst.
   *  This decays on its own instead. */
  const pastEnd = useRef(0);
  const pastEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tt = useRef(0); // transition time (s)
  const cutDone = useRef(false);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const scratch = useRef({ pos: new THREE.Vector3(), pitch: 0, roll: 0 });

  const poseAt = (out: { pos: THREE.Vector3; pitch: number; roll: number }) => {
    const ax = pos.current.x;
    out.pos.set(ax, CAM_Y, CAM_Z);
    out.pitch = CAM_PITCH;
    out.roll = 0;
    // the dive ARCS on top: a quadratic bezier that bows sideways and
    // sinks a touch instead of taking the shortest line, with a
    // path-inherent lean <=2.2 degrees. No orbit, no free look. dp
    // comes off the single MASTER curve, so it is C1 through every beat
    const id = useBenchStore.getState().transitionId;
    const dive = id ? DIVES[id] : undefined;
    if (!dive) return;
    const dp = MASTER(clamp01(tt.current / T_TOTAL));
    const q = 1 - dp;
    // x starts and ends on the rail; the control point only bows it
    const cx = ax + 0.38;
    const cy = (CAM_Y + dive.y) / 2 - 0.14;
    const cz = (CAM_Z + dive.z) / 2;
    out.pos.set(
      q * q * ax + 2 * q * dp * cx + dp * dp * ax,
      q * q * CAM_Y + 2 * q * dp * cy + dp * dp * dive.y,
      q * q * CAM_Z + 2 * q * dp * cz + dp * dp * dive.z
    );
    out.pitch += (THREE.MathUtils.degToRad(dive.pitch) - out.pitch) * dp;
    out.roll = Math.sin(dp * Math.PI) * ROLL_MAX;
  };

  const applyCamera = (cam: THREE.Camera) => {
    poseAt(scratch.current);
    cam.position.copy(scratch.current.pos);
    cam.rotation.set(scratch.current.pitch, 0, scratch.current.roll);
  };

  useEffect(() => {
    // ?berth=N deep-link is authoritative at mount
    const raw = new URLSearchParams(window.location.search).get("berth");
    const b = raw === null ? NaN : Number(raw);
    let initial = useBenchStore.getState().berth;
    if (Number.isInteger(b) && b >= 0 && b < BERTH_ORDER.length) {
      initial = b;
      setBerth(b);
    }
    pos.current.x = pos.current.target = pos.current.raw = railX(initial);

    // stale transition from an outbound nav dies here; then, if we came
    // back from a case page entered THROUGH an instrument, resume at the
    // cut frame and reverse out (器物落回醒态)
    useBenchStore.getState().endTransition();
    const back = sessionStorage.getItem(CUT_KEY);
    if (back && BERTH_ORDER[initial] === back && DIVES[back]) {
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
  }, [camera, invalidate, setBerth, pos, overlayEl]);

  // a fresh forward transition starts its clock here
  useEffect(() => {
    if (transitionId && useBenchStore.getState().transitionDir === 1) {
      tt.current = 0;
      cutDone.current = false;
    }
    invalidate();
  }, [transitionId, invalidate]);

  // nav / keyboard / tick jumps: the store is truth, the rail springs
  useEffect(() => {
    const want = railX(berth);
    if (Math.abs(want - pos.current.target) > 0.005) {
      pos.current.target = pos.current.raw = want;
      invalidate();
    }
  }, [berth, invalidate, pos]);

  useEffect(() => {
    const el = gl.domElement;
    const transiting = () => useBenchStore.getState().transitionId !== null;

    const scheduleSnap = () => {
      if (snapTimer.current) clearTimeout(snapTimer.current);
      snapTimer.current = setTimeout(() => {
        // berthAt clamps into range; there is no modulo on a rail, and
        // the count it clamps against comes off BERTH_ORDER.length
        const i = berthAt(clampRail(pos.current.raw));
        pos.current.target = pos.current.raw = railX(i);
        setBerth(i);
        invalidate();
      }, SNAP_DELAY_MS);
    };

    /** Past the end of the rail is not nothing. The last instrument is
     *  the last case, and what follows the cases is the cabinet, so a
     *  push that keeps going after the wall lands there instead of
     *  bouncing forever. It has to clear EXIT_PUSH, so a bounce is
     *  still a bounce. */
    const checkExit = (dx: number) => {
      if (exited.current || transiting()) return;
      // only travel that is both forward and already at the wall counts
      if (dx <= 0 || pos.current.raw < BERTH_MAX) {
        pastEnd.current = 0;
        return;
      }
      pastEnd.current += dx;
      if (pastEndTimer.current) clearTimeout(pastEndTimer.current);
      pastEndTimer.current = setTimeout(() => {
        pastEnd.current = 0;
      }, 500);
      if (pastEnd.current < EXIT_PUSH) return;
      exited.current = true;
      onPastEnd();
    };

    /** direct manipulation: the target is the hand, and `berth` follows
     *  it so the description under the instrument changes as it arrives
     *  rather than after the snap lands. */
    const track = () => {
      const i = berthAt(clampRail(pos.current.raw));
      if (i !== dragBerth.current) {
        dragBerth.current = i;
        if (i !== useBenchStore.getState().berth) setBerth(i);
      }
    };

    const push = (dx: number) => {
      pos.current.raw += dx;
      pos.current.target = resist(pos.current.raw);
      track();
      checkExit(dx);
      scheduleSnap();
      invalidate();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (transiting() || clothDrag.active) return;
      push((e.deltaX + e.deltaY) * WHEEL_K);
    };

    let dragging = false;
    let startX = 0;
    let startRaw = 0;
    const onDown = (e: PointerEvent) => {
      if (transiting() || clothDrag.active) return;
      dragging = true;
      startX = e.clientX;
      startRaw = pos.current.raw;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging || clothDrag.active) return;
      // pull the rail right, travel left: the hand moves the objects,
      // not the camera
      const was = pos.current.raw;
      pos.current.raw = startRaw - (e.clientX - startX) * DRAG_K;
      pos.current.target = resist(pos.current.raw);
      track();
      checkExit(pos.current.raw - was);
      invalidate();
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      scheduleSnap();
    };

    // global left/right stepping. Clamped, never wrapped: the ends of
    // the rail are the ends of the argument
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && transiting()) {
        useBenchStore.getState().reverseTransition();
        invalidate();
        return;
      }
      if (e.target !== document.body || transiting()) return;
      const b = useBenchStore.getState().berth;
      const last = BERTH_ORDER.length - 1;
      if (e.key === "ArrowLeft") {
        useBenchStore.getState().setBerth(Math.max(0, b - 1));
        e.preventDefault();
      }
      if (e.key === "ArrowRight") {
        useBenchStore.getState().setBerth(Math.min(last, b + 1));
        e.preventDefault();
      }
    };
    // any press mid-transition = pull back out (1.5x reverse)
    const onPressCapture = () => {
      if (transiting()) {
        useBenchStore.getState().reverseTransition();
        invalidate();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerdown", onPressCapture, true);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerdown", onPressCapture, true);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey);
      if (snapTimer.current) clearTimeout(snapTimer.current);
      if (pastEndTimer.current) clearTimeout(pastEndTimer.current);
    };
  }, [gl, invalidate, setBerth, pos, onPastEnd]);

  useFrame((_, delta) => {
    const p = pos.current;
    const dx = p.target - p.x;
    // reduced motion gets the cut, not the travel
    p.x += reduced.current ? dx : dx * DAMPING;

    // the mount window follows the camera, not the snap: without this a
    // jump from one end to the other would fly over bare paper. It goes
    // to `passing`, never to `berth`. Writing it to `berth` puts the
    // frame loop in a fight with every commanded jump, and the loop
    // wins, because it runs before the camera has moved far enough to
    // agree: the ticks then do nothing at all.
    const live = berthAt(p.x);
    if (live !== useBenchStore.getState().passing)
      useBenchStore.getState().setPassing(live);

    // transition clock: forward 1x, reverse 1.5x; overlay opacity is
    // written directly, no per-frame React
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

    applyCamera(camera);
    // settled = stop: no residual rAF, the frame goes still
    if (Math.abs(dx) > 0.0008 || transBusy) invalidate();
  });

  return null;
}

/* ── instruments ──────────────────────────────────────────────────── */

function playMechanism(id: string) {
  const s = useBenchStore.getState();
  if (id === "latent") s.b1Feed();
  if (id === "skeletal-silk") s.b3Pull();
  if (id === "vestige") s.b5Stamp();
}

/** Only the instrument in front and its two neighbours carry geometry.
 *
 *  Unmounting Cloth resets its Verlet state, so sliding away from
 *  MATERIAL MEMORY and back gives you a fresh sheet rather than the one
 *  you left mid-swing. That is deliberate, not a bug: keeping the sim
 *  alive off screen means running it every frame for something nobody
 *  is looking at, which is the exact cost the mount window exists to
 *  avoid. A returning visitor gets cloth at rest, which is also the
 *  better first frame. */
/** Stands one instrument on its berth at stage size.
 *
 *  The fit is measured from the model at mount rather than written down
 *  as a scale factor per instrument, so editing a model re-fits it
 *  instead of quietly changing how big it looks. Measured once: these
 *  are static resting shapes, and re-fitting the cloth every frame
 *  would make it breathe in and out as it swings. */
function Fit({
  id,
  trim = 1,
  children,
}: {
  id: string;
  /** A deliberate step off the shared stage, for the one object that
   *  reads too heavy at it. Not a scale factor for the model: the fit
   *  is still measured, this only says how much of the stage to take. */
  trim?: number;
  children: React.ReactNode;
}) {
  const g = useRef<THREE.Group>(null);
  const { invalidate, size } = useThree();
  useLayoutEffect(() => {
    const o = g.current;
    if (!o) return;
    const box = new THREE.Box3();
    const scratch = new THREE.Box3();

    const fit = () => {
      o.scale.setScalar(1);
      o.position.set(0, 0, 0);
      o.updateMatrixWorld(true);
      // Box3 measures geometry, and geometry can lie about the
      // silhouette: FilmRoll's leader is a full length ribbon that the
      // shader reveals along its curve, so at rest two thirds of it is
      // present and not drawn. Framing on it centres a strip nobody can
      // see and pushes the canister off to the side. userData.noFrame
      // marks that case at the source rather than special casing an
      // instrument here.
      box.makeEmpty();
      o.traverse((c) => {
        const m = c as THREE.Mesh;
        if (!m.isMesh || m.userData.noFrame || !m.geometry) return;
        // recomputed, never reused: the cloth is a PlaneGeometry whose
        // vertices the Verlet sim rewrites every frame, and its cached
        // box is the flat sheet it started as
        m.geometry.computeBoundingBox();
        if (!m.geometry.boundingBox) return;
        scratch.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);
        box.union(scratch);
      });
      if (box.isEmpty()) return;
      const d = box.getSize(new THREE.Vector3());
      if (d.x < 1e-4 || d.y < 1e-4) return;
      // The horizon rule is drawn at the z = 0 plane, so an instrument
      // centred on z pokes forward of it by half its depth: the
      // movement is a wide disc and its near rim landed 15 percent of
      // the screen below the line, straight through the description.
      // Every instrument therefore stands with its FRONT face on z = 0
      // and recedes backwards, which is also how a thing on a table
      // reads.
      //
      // The fit is solved against the frame at the RULE, which is where
      // the near face sits, not at the object's centre. Solving at the
      // centre sizes the object for a frame further away than its
      // nearest surface, and the near surface is the one that fills the
      // view: latent came out at 75.8 percent of the frame height with
      // its top cut off. Solved here, the near face fills the stage
      // exactly and everything behind it falls away inside the frame.
      const f = frameAt(READ_DEPTH, size.width, size.height);
      const s =
        Math.min((f.w * STAGE_W_FRAC) / d.x, (f.h * STAGE_H_FRAC) / d.y) * trim;
      o.scale.setScalar(s);
      o.position.set(
        railX(berthOf(id)) - ((box.min.x + box.max.x) / 2) * s,
        -box.min.y * s,
        -box.max.z * s
      );
      invalidate();
    };

    fit();
    // Once more when the live ones have stopped moving. MATERIAL
    // MEMORY hangs a cloth that is still falling at mount, so its
    // bounds at that instant are the sheet part way down; fitting to
    // them left the hem eleven percent of the screen below the rule,
    // through the description. A static instrument measures the same
    // both times and this costs it one Box3.
    const again = setTimeout(fit, 900);
    return () => clearTimeout(again);
  }, [id, trim, invalidate, size.width, size.height]);
  return <group ref={g}>{children}</group>;
}

function Instruments({ clothSelect }: { clothSelect: (dragged: boolean) => void }) {
  const berth = useBenchStore((s) => s.berth);
  const passing = useBenchStore((s) => s.passing);
  // both windows: `berth` so the destination is already standing there
  // when the camera arrives, `passing` so a jump across the rail does
  // not fly over bare paper
  const near = (id: string) => {
    const i = berthOf(id);
    return Math.abs(i - berth) <= 1 || Math.abs(i - passing) <= 1;
  };
  return (
    <>
      {near("latent") && (
        <Fit id="latent">
          <FilmRoll position={[0, 0, 0]} />
        </Fit>
      )}
      {near("teardown") && (
        <Fit id="teardown">
          <Movement position={[0, 0, 0]} />
        </Fit>
      )}
      {near("skeletal-silk") && (
        <Fit id="skeletal-silk">
          <Cocoon position={[0, 0, 0]} />
        </Fit>
      )}
      {near("material-memory") && (
        <Fit id="material-memory">
          <Cloth position={[0, 0, 0]} onSelect={clothSelect} />
        </Fit>
      )}
      {near("vestige") && (
        <Fit id="vestige" trim={0.8}>
          {/* the seal is a solid dark block and the only instrument
              that is nearly all mass. At the full stage it read as
              heavier than the four before it, which is a claim about
              the work rather than about the object. */}
          <Seal position={[0, 0, 0]} />
        </Fit>
      )}
    </>
  );
}

function PointerTargets({
  beginTransition,
  railSettled,
}: {
  beginTransition: (id: string) => void;
  /** true only when the rail has stopped. A moving rail drags every hit
   *  box under a stationary cursor in turn, and each one fires its own
   *  pointerover, which is why travelling to a berth used to appear to
   *  animate the neighbours. Hover must mean the pointer moved onto an
   *  object, not the object moved under the pointer. */
  railSettled: () => boolean;
}) {
  const berth = useBenchStore((s) => s.berth);
  const setBerth = useBenchStore((s) => s.setBerth);
  const setHovered = useBenchStore((s) => s.setHovered);
  const { size } = useThree();
  const stage = stageOf(size.width, size.height);

  /** One click path for every instrument: click always enters. Off
   *  centre it has to bring the object to the front first, but that is
   *  the same journey, not a different outcome. beginTransition waits
   *  for the rail before the camera dives. */
  const select = (i: number, id: string) => {
    if (useBenchStore.getState().transitionId) return;
    if (i !== berth) setBerth(i);
    beginTransition(id);
  };

  return (
    <>
      {BERTH_ORDER.map((id, i) =>
        // MATERIAL MEMORY has no hit box when it is the one on screen:
        // the cloth needs the pointer for dragging, so it forwards
        // clicks itself. Off centre it keeps a box so it can be reached
        Math.abs(i - berth) > 1 || (id === "material-memory" && i === berth) ? null : (
          <mesh
            key={id}
            position={[railX(i), stage.h / 2, 0]}
            visible={false}
            onClick={(e) => {
              e.stopPropagation();
              select(i, id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
              // Hover needs all three: the pointer is on THIS object,
              // this object is the one on screen, and the rail is
              // standing still
              if (i !== berth) return;
              setHovered(id);
              if (!useBenchStore.getState().transitionId && railSettled())
                playMechanism(id);
            }}
            onPointerOut={() => {
              setHovered(null);
              document.body.style.cursor = "";
            }}
          >
            {/* the stage box, not the model: a hit target that changed
                every time a model did would be a different affordance
                on each instrument */}
            <boxGeometry args={[stage.w, stage.h, 1.5]} />
          </mesh>
        )
      )}
    </>
  );
}

/* ── DOM layer ────────────────────────────────────────────────────── */

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
  return (
    <div
      aria-hidden
      className="hovercard pointer-events-none fixed left-1/2 z-10 font-mono"
      style={{
        top: `calc(${horizonFrac() * 100}% - 34px)`,
        fontSize: 11,
        letterSpacing: "0.08em",
        color: "#1a1714",
        background: "rgba(245,242,236,0.92)",
        border: "0.5px solid #E3DED4",
        padding: "6px 12px",
        whiteSpace: "nowrap",
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
    </div>
  );
}

/** The horizon, the description, and the ticks. Everything below the
 *  instrument is DOM: it is typography, and the case pages set it in
 *  type, so the home page should too. The rule is where the world floor
 *  projects to, computed from the camera rather than nudged by eye. */
function RailCaption() {
  const berth = useBenchStore((s) => s.berth);
  const setBerth = useBenchStore((s) => s.setBerth);
  const id = BERTH_ORDER[berth];
  const station = STATIONS.find((s) => s.id === id);
  const last = BERTH_ORDER.length - 1;

  return (
    <div
      className="fixed inset-x-0 z-10"
      style={{ top: `${horizonFrac() * 100}%`, bottom: 0 }}
    >
      {/* the horizon: the instruments stand on this */}
      <div className="border-t border-line" />
      <div className="mx-auto flex h-full max-w-3xl flex-col justify-between px-6 pb-16 pt-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-bronze">
            {String(berth + 1).padStart(2, "0")} / {String(BERTH_ORDER.length).padStart(2, "0")}
            <span className="ml-3 text-muted">{station?.label}</span>
          </p>
          <p className="mt-2 max-w-[60ch] font-serif text-[17px] leading-snug text-ink">
            {station?.blurb}
          </p>
        </div>

        {/* five rules, one per instrument. Not dots: the site draws
            rules everywhere else and a dot would be a new vocabulary
            for something the reader already knows how to read */}
        <nav aria-label="Instruments" className="flex items-end gap-3">
          {BERTH_ORDER.map((sid, i) => {
            const on = i === berth;
            const s = STATIONS.find((x) => x.id === sid);
            return (
              <button
                key={sid}
                type="button"
                onClick={() => setBerth(i)}
                aria-current={on ? "true" : undefined}
                aria-label={s?.label ?? sid}
                className="group grid w-14 gap-1.5 text-left"
              >
                <span
                  className={`h-px w-full transition-colors ${
                    on ? "bg-bronze" : "bg-line group-hover:bg-muted"
                  }`}
                />
                <span
                  className={`font-mono text-[10px] tracking-widest transition-colors ${
                    on ? "text-bronze" : "text-muted group-hover:text-ink"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </button>
            );
          })}
          {/* the same destination the overscroll reaches. A gesture is
              not a control: anyone on a keyboard, or anyone who never
              thinks to shove the rail, needs the door to be visible. */}
          {berth === last ? (
            <Link
              href="/experiments"
              className="pb-0.5 font-mono text-[10px] tracking-widest text-bronze transition-colors hover:text-ink"
            >
              experiments {String.fromCharCode(8594)}
            </Link>
          ) : (
            <span className="pb-0.5 font-mono text-[10px] tracking-widest text-muted">
              {berth === 0 ? "start" : ""}
            </span>
          )}
        </nav>
      </div>
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
      style={{ background: surface?.bg ?? "transparent", pointerEvents: "none" }}
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
      {/* UNVEIL 拍③: the page develops out of the warp/weft. The
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
            animation: "bench-label-in 0.2s ease 0.05s both",
          }}
        >
          {surface.label}
        </span>
      )}
    </div>
  );
}

/* ── the rail ─────────────────────────────────────────────────────── */

export default function Rail() {
  const pos = useRef<RailPos>({
    x: railX(HOME_BERTH),
    target: railX(HOME_BERTH),
    raw: railX(HOME_BERTH),
  });
  const overlayEl = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    useBenchStore.getState().setBoot(35, "three runtime");
    // the way out of the rail, ready before anyone pushes at it
    router.prefetch("/experiments");
  }, [router]);

  const onPastEnd = useCallback(() => {
    router.push("/experiments");
  }, [router]);

  /** Is the rail standing still at berth i? The ONE definition.
   *
   *  This test lived in three copies on the turntable, one inside the
   *  dive, one inside the assertion and one for hover. Three copies is
   *  how the `% 6` bug survived: a fix to one left the other two
   *  quietly disagreeing. */
  const railSettledAt = (i: number) =>
    Math.abs(pos.current.x - railX(i)) < SETTLE_EPS;
  const railSettled = () => railSettledAt(useBenchStore.getState().berth);

  /** Beat 1: the instrument answers with its own mechanism, through the
   *  same store bridge the nameplate buttons use. Cocoon (lantern) and
   *  Movement (hard stop) respond to transitionId directly. */
  const beginTransition = (id: string) => {
    const station = STATIONS.find((s) => s.id === id);
    if (!station?.href || !DIVES[id]) return; // no entry yet
    const s = useBenchStore.getState();
    if (s.transitionId) return;
    if (id === "material-memory" && clothDrag.active) {
      // mid-drag enter: let the cloth go, settle a beat, then run the
      // SAME guarded path rather than starting the dive blind on a timer
      setTimeout(() => {
        if (!useBenchStore.getState().transitionId) beginTransition(id);
      }, 200);
      return;
    }
    if (id === "latent") s.b1Feed();
    if (id === "vestige") s.b5Stamp();

    const target = berthOf(id);
    /** The regression guard. The dive is a fixed pose relative to the
     *  camera's rail position; it does not aim at an object. So entering
     *  before the rail has arrived flies the camera at whoever is
     *  standing there instead. The store's berth updates instantly while
     *  the rail springs over about a second, so checking berth alone is
     *  not enough: wait for the geometry, not the state.
     *
     *  This bug has now shipped twice, both times invisible until
     *  someone clicked. */
    const assertAligned = (where: string) => {
      if (process.env.NODE_ENV === "production") return;
      const d = pos.current.x - railX(target);
      if (Math.abs(d) > 0.05)
        console.error(
          `[rail] dive started ${d.toFixed(3)} world units off target for ` +
            `"${id}" (${where}). camera.x=${pos.current.x.toFixed(4)} ` +
            `want=${railX(target).toFixed(4)}. The camera will fly at ` +
            `whatever is standing there instead.`
        );
      // Index agreement. Today this cannot fire: select() calls
      // setBerth(i) with the same i it derives the id from, so the two
      // are the same number by construction. It is here for the day
      // somebody changes select, or adds a second way in, and the two
      // stop being derived from each other. It is NOT the guard that
      // catches the `% 6` class of bug: that one is the geometry test
      // above, because a wrong index makes both sides wrong together.
      const active = useBenchStore.getState().berth;
      if (active !== target)
        console.error(
          `[rail] dive target ${target} ("${id}") is not the active berth ` +
            `${active} (${where}).`
        );
    };

    if (railSettledAt(target)) {
      assertAligned("immediate");
      s.startTransition(id);
      return;
    }
    let frames = 0;
    const wait = () => {
      if (useBenchStore.getState().transitionId) return;
      if (railSettledAt(target) || ++frames > 180) {
        assertAligned(frames > 180 ? "frame cap" : "settled");
        useBenchStore.getState().startTransition(id);
        return;
      }
      requestAnimationFrame(wait);
    };
    requestAnimationFrame(wait);
  };

  /** MATERIAL MEMORY's click path. Its hit box is deliberately absent
   *  when it is the one on screen so the cloth can be dragged, so the
   *  cloth forwards clicks here and gets the same contract. */
  const clothSelect = (dragged: boolean) => {
    // A pointer that travelled more than a few pixels was a drag meant
    // to sway the fabric, not a click meant to leave the page
    if (dragged) return;
    const st = useBenchStore.getState();
    if (st.transitionId) return;
    const mine = berthOf("material-memory");
    if (st.berth !== mine) st.setBerth(mine);
    beginTransition("material-memory");
  };

  /** Beat 3: the surface owns the viewport, hand over to the route. The
   *  CUT_KEY flag dresses the case page in the same surface
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
        camera={{ fov: FOV }}
        gl={{ antialias: true, powerPreference: "low-power" }}
        onCreated={({ gl, scene, camera }) => {
          gl.setClearColor("#F5F2EC");
          if (process.env.NODE_ENV !== "production")
            (window as unknown as { __rail?: unknown }).__rail = { gl, scene, camera };
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
        {/* warm paper haze: the rail dims into it either side. No blue */}
        <fog attach="fog" args={["#E9E3D6", 7, 20]} />
        <directionalLight position={[-3, 6, 4]} intensity={1.4} color="#fff6e8" />
        <ambientLight intensity={0.75} />
        <Instruments clothSelect={clothSelect} />
        <PointerTargets
          beginTransition={beginTransition}
          railSettled={railSettled}
        />
        <Rig
          pos={pos}
          overlayEl={overlayEl}
          onCut={onCut}
          onPastEnd={onPastEnd}
        />
      </Canvas>
      <RailCaption />
      <HoverCard />
      <CutOverlay overlayEl={overlayEl} />
    </>
  );
}
