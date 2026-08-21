"use client";

import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
import Cocoon from "./Cocoon";
import FilmRoll from "./FilmRoll";
import Movement from "./Movement";

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
 * springs back on release. No wrap and no exit: the sequence is the
 * argument, looping it would say every position is interchangeable,
 * and a shove that leaves for another page turns an overscroll into
 * navigation nobody asked for.
 *
 * MOUNTING. Only |i - berth| <= 1 carries geometry. The berth index
 * follows the camera continuously rather than only on snap, so a long
 * drag mounts each instrument before it enters frame instead of
 * revealing an empty rail.
 *
 * HOVER: pointer over the front instrument plays that instrument's own
 * mechanism and prefetches its case route. It says nothing. The card
 * that used to rise here was written when five objects shared a table
 * and a visitor needed to be told which was which; one at a time,
 * under its own name and description, it repeated what was already on
 * screen an inch below. Never fires for a neighbour.
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
/** How much of the stage each instrument takes. Judged by eye against
 *  the rendered frame, which is the only way to judge it: the fit makes
 *  five objects the same measured size, and measured-equal is not the
 *  same as reading-equal. A solid dark block at the size of an open
 *  wire movement looks like a claim about the work.
 *
 *  The cocoon is the one left at full stage: it is mostly air. */
const TRIM: Record<string, number> = {
  latent: 0.8,
  teardown: 0.8,
  "skeletal-silk": 1,
};

/** The silhouette rule, in one place because three callers have to
 *  agree on it: Fit sizes against it, Fit records the placed x from it,
 *  and the dive assertion re-measures with it.
 *
 *  Box3 measures geometry, and geometry can lie about the silhouette:
 *  FilmRoll's leader is a full length ribbon that the shader reveals
 *  along its curve, so at rest two thirds of it is present and not
 *  drawn. Framing on it centres a strip nobody can see and pushes the
 *  canister off to the side. userData.noFrame marks that case at the
 *  source rather than special casing an instrument here. */
function frameBox(o: THREE.Object3D, out: THREE.Box3, scratch: THREE.Box3) {
  out.makeEmpty();
  o.traverse((c) => {
    const m = c as THREE.Mesh;
    if (!m.isMesh || m.userData.noFrame || !m.geometry) return;
    // recomputed, never reused: a geometry whose vertices are rewritten
    // every frame carries a cached box of the shape it started as
    m.geometry.computeBoundingBox();
    if (!m.geometry.boundingBox) return;
    scratch.copy(m.geometry.boundingBox).applyMatrix4(m.matrixWorld);
    out.union(scratch);
  });
  return out;
}

/** World size of each instrument AFTER it has been fitted, plus the x
 *  it actually ended up on. Written by Fit, read by the hit boxes and
 *  by the dive.
 *
 *  The hit boxes used to be the stage: 86 percent of the frame wide,
 *  whatever the object inside it came out as. Latent is 22 percent of
 *  the frame wide before its trim, so four fifths of its target was
 *  empty paper and the pointer triggered it from most of the way
 *  across the screen, well before it was anywhere near the object.
 *
 *  `x` is MEASURED off the placed object, not recomputed from the
 *  formula that placed it. That distinction is the whole point: a
 *  number derived from railX(berthOf(id)) agrees with the placement
 *  code even when the placement code is wrong, which is how a bad
 *  index stays invisible. A number read back off the scene graph
 *  disagrees. */
const FITTED = new Map<string, { w: number; h: number; d: number; x: number }>();

/** The placed instruments, by id, so the dive can re-measure one at the
 *  moment it fires rather than trusting a cache written at mount.
 *  Cleared on unmount: an entry here means "this object is in the
 *  scene right now", which is a thing the dive needs to know. */
const FIT_NODES = new Map<string, THREE.Object3D>();

/** Where the camera must end up in x to be looking at an instrument.
 *
 *  Undefined means the object is not currently placed, which is a real
 *  state: nothing is fitted before first layout. Callers must treat it
 *  as "no target", never as 0 — 0 is a valid rail position and flying
 *  there looks like a deliberate move to the wrong instrument. */
const diveXOf = (id: string): number | undefined => FITTED.get(id)?.x;

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
/** Read by BenchLoader to skip the boot readout on a return trip.
 *  Duplicated there on purpose: see the note beside it. */
const READY_KEY = "bench-ready";

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
};

/** The surface each cut hands to the case page. Colors match
 *  BenchArrival's CUT_BG so the route change is invisible. */
const CUT_SURFACE: Record<string, { bg: string; label?: string }> = {
  latent: { bg: "#14100d" },
  "skeletal-silk": { bg: "#FBF5E8" },
  teardown: { bg: "#241C15", label: "LOG #: " },
};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const clampRail = (x: number) => Math.max(0, Math.min(BERTH_MAX, x));
/** Nearest berth to a rail position, always a real index. Everything
 *  that used to take a modulo takes this instead: the ring wrapped, the
 *  rail ends, and a modulo here is how a click reached the wrong
 *  instrument the last two times. */
const berthAt = (x: number) =>
  Math.max(0, Math.min(BERTH_ORDER.length - 1, Math.round(x / BERTH_SPACING)));

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
  pending,
  overlayEl,
  onCut,
}: {
  pos: React.RefObject<RailPos>;
  /** A hover that arrived before the rail stopped, waiting for it to. */
  pending: React.RefObject<string | null>;
  overlayEl: React.RefObject<HTMLDivElement | null>;
  onCut: (id: string) => void;
}) {
  const { camera, invalidate, gl } = useThree();
  const berth = useBenchStore((s) => s.berth);
  const setBerth = useBenchStore((s) => s.setBerth);
  const transitionId = useBenchStore((s) => s.transitionId);
  const tt = useRef(0); // transition time (s)
  const cutDone = useRef(false);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduced = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  // a drag moves the camera directly, so the caption and the ticks
  // follow the target rather than waiting for the snap
  const dragBerth = useRef(-1);

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
    if (!id) return;
    const dive = DIVES[id];
    if (!dive) return;
    const dp = MASTER(clamp01(tt.current / T_TOTAL));
    const q = 1 - dp;
    /* THE DIVE'S X USED TO BE THE CAMERA'S OWN X, AT BOTH ENDS.
     *
     * It read `dp*dp*ax`, so the arc started and finished on whatever
     * rail position the camera already held, and never referred to the
     * instrument at all. That was not a shortcut, it was an unstated
     * dependency on an invariant the RAIL happened to maintain: the
     * rail moves the camera to railX(berth) and the fit stands each
     * object on railX(berthOf(id)), so for the object you are entering,
     * camera x and object x were the same number. Aiming at nothing and
     * aiming at the instrument produced identical frames, so the bug
     * could not be seen.
     *
     * The invariant holds only while exactly one instrument can be in
     * front of the camera. Standing three side by side breaks it
     * permanently, and then a dive into the left or right instrument
     * flies straight down into the middle one.
     *
     * `tx` is the instrument's measured x. On the rail it equals ax
     * whenever the rail has settled, so this is behaviour neutral
     * today; off the rail it is the difference between arriving at the
     * object and arriving at its neighbour. */
    const tx = diveXOf(id) ?? ax;
    // the control point bows the arc sideways off the line of travel,
    // which is now a real line rather than a point
    const cx = (ax + tx) / 2 + 0.38;
    const cy = (CAM_Y + dive.y) / 2 - 0.14;
    const cz = (CAM_Z + dive.z) / 2;
    out.pos.set(
      q * q * ax + 2 * q * dp * cx + dp * dp * tx,
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
      scheduleSnap();
      invalidate();
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (transiting()) return;
      push((e.deltaX + e.deltaY) * WHEEL_K);
    };

    let dragging = false;
    let startX = 0;
    let startRaw = 0;
    const onDown = (e: PointerEvent) => {
      if (transiting()) return;
      dragging = true;
      startX = e.clientX;
      startRaw = pos.current.raw;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      // pull the rail right, travel left: the hand moves the objects,
      // not the camera
      pos.current.raw = startRaw - (e.clientX - startX) * DRAG_K;
      pos.current.target = resist(pos.current.raw);
      track();
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
    };
  }, [gl, invalidate, setBerth, pos]);

  useFrame((_, delta) => {
    const p = pos.current;
    const dx = p.target - p.x;
    // reduced motion gets the cut, not the travel
    p.x += reduced.current ? dx : dx * DAMPING;

    // A hover that landed while the rail was still gliding in is held
    // rather than dropped. Hover used to require the rail to already be
    // still, and there was no retry, so the natural motion of sliding
    // to an instrument and going straight to it lost the mechanism and
    // you had to leave and come back. Only SKELETAL SILK and VESTIGE
    // showed it: they are the only two whose hover runs through
    // playMechanism and that you have to travel to, since LATENT is the
    // berth you land on.
    //
    // This cannot strand: the loop stops at |target - x| <= 0.0008,
    // which is tighter than SETTLE_EPS, so anything still pending is
    // still being animated toward.
    const want = pending.current;
    if (want && Math.abs(p.x - railX(berthOf(want))) < SETTLE_EPS) {
      pending.current = null;
      const st = useBenchStore.getState();
      // only if the pointer is still on it: a hover that has already
      // moved on should not fire late
      if (st.hovered === want && !st.transitionId) playMechanism(want);
    }

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
}

/** Only the instrument in front and its two neighbours carry geometry.
 *
 *  With three on the rail the window covers all of them, so nothing
 *  unmounts today. It is kept because it is the reason a fourth
 *  instrument can be added without the frame cost growing with it. */
/** Stands one instrument on its berth at stage size.
 *
 *  The fit is measured from the model at mount rather than written down
 *  as a scale factor per instrument, so editing a model re-fits it
 *  instead of quietly changing how big it looks. Measured once: these
 *  are static resting shapes, and re-fitting the cloth every frame
 *  would make it breathe in and out as it swings. */
function Fit({
  id,
  onFit,
  children,
}: {
  id: string;
  onFit: () => void;
  children: React.ReactNode;
}) {
  const trim = TRIM[id] ?? 1;
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
      frameBox(o, box, scratch);
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
      // Read the placed x back off the scene graph rather than reusing
      // the expression above. It costs one Box3 and it is the only
      // reason the dive assertion can disagree with the placement code:
      // recomputing railX(berthOf(id)) here would make the recorded x
      // and the placed x the same expression, so a wrong index would
      // move the object AND move the number that is supposed to catch
      // it. Measured, they part company.
      o.updateMatrixWorld(true);
      frameBox(o, box, scratch);
      if (box.isEmpty()) return;
      // the object is now standing on y = 0 and receding from z = 0, so
      // its world size is just d scaled; x is where it actually landed
      FITTED.set(id, {
        w: d.x * s,
        h: d.y * s,
        d: d.z * s,
        x: (box.min.x + box.max.x) / 2,
      });
      FIT_NODES.set(id, o);
      onFit();
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
    return () => {
      clearTimeout(again);
      // an entry in FIT_NODES means "in the scene right now". Leaving a
      // stale node here would let the dive re-measure an unmounted
      // object and conclude it is aimed correctly at something nobody
      // can see.
      if (FIT_NODES.get(id) === o) FIT_NODES.delete(id);
    };
  }, [id, trim, onFit, invalidate, size.width, size.height]);
  return <group ref={g}>{children}</group>;
}

function Instruments({ onFit }: { onFit: () => void }) {
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
        <Fit id="latent" onFit={onFit}>
          <FilmRoll position={[0, 0, 0]} />
        </Fit>
      )}
      {near("teardown") && (
        <Fit id="teardown" onFit={onFit}>
          <Movement position={[0, 0, 0]} />
        </Fit>
      )}
      {near("skeletal-silk") && (
        <Fit id="skeletal-silk" onFit={onFit}>
          <Cocoon position={[0, 0, 0]} />
        </Fit>
      )}
    </>
  );
}

function PointerTargets({
  beginTransition,
  railSettled,
  defer,
}: {
  beginTransition: (id: string) => void;
  /** Hold a mechanism until the rail stops, or clear a held one. */
  defer: (id: string | null) => void;
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
  const router = useRouter();
  const { size } = useThree();
  const stage = stageOf(size.width, size.height);
  /** the object's own size once measured; the stage only until then */
  const hit = (id: string) =>
    FITTED.get(id) ?? { w: stage.w, h: stage.h, d: 1.5 };

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
        Math.abs(i - berth) > 1 ? null : (
          <mesh
            key={id}
            position={[railX(i), hit(id).h / 2, -hit(id).d / 2]}
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
              // setHovered still matters with the card gone: Movement
              // reads it to know it is the one being looked at, since
              // its own hit box belongs to this group and not to it
              setHovered(id);
              const st = STATIONS.find((x) => x.id === id);
              if (st?.href && !st.external) router.prefetch(st.href);
              if (!useBenchStore.getState().transitionId && railSettled())
                playMechanism(id);
            }}
            onPointerOut={() => {
              setHovered(null);
              defer(null);
              document.body.style.cursor = "";
            }}
          >
            {/* the object, not the stage. A target the size of the
                stage means the pointer is "on" an instrument while it
                is still most of a screen away from it. */}
            <boxGeometry args={[hit(id).w, hit(id).h, hit(id).d]} />
          </mesh>
        )
      )}
    </>
  );
}

/* ── DOM layer ────────────────────────────────────────────────────── */

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
      // stops at the top of the footer, not at the bottom of the
      // window. pb-16 was reserving 64px for a bar that measures 49,
      // and on a 768 tall screen that waste is the difference between
      // the ticks clearing the footer and sitting 14px under it
      style={{ top: `${horizonFrac() * 100}%`, bottom: "3.0625rem" }}
    >
      {/* the horizon: the instruments stand on this */}
      <div className="border-t border-line" />
      <div className="flex h-full flex-col justify-between pb-2 pt-4">
        {/* Half the window, on the same centre line as the ticks below
            at four fifths. The 60ch cap that used to sit inside this
            block is gone with it: a measure inside a measure meant the
            frame said one width and the text took another, and it was
            the inner one that decided how many lines a description
            broke into. One width, set here, is what makes five
            descriptions of different lengths land on the same number
            of lines. */}
        <div className="mx-auto w-1/2">
          <p className="font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-[0.18em] text-bronze">
            {String(berth + 1).padStart(2, "0")} / {String(BERTH_ORDER.length).padStart(2, "0")}
            <span className="ml-3 text-muted">{station?.label}</span>
          </p>
          <p className="mt-2 font-serif text-[length:var(--text-lead)] leading-snug text-ink">
            {station?.blurb}
          </p>
        </div>

        {/* Five equal segments across four fifths of the window, on the
            same centre line as the text above. Rules, not dots: the site
            draws rules everywhere else, and a dot would be a new
            vocabulary for something the reader already knows how to
            read. Equal width is the point, so nothing outside the five
            shares the row. */}
        <nav aria-label="Instruments" className="mx-auto w-4/5">
          <div className="flex gap-2">
            {BERTH_ORDER.map((sid, i) => {
              const on = i === berth;
              const st = STATIONS.find((x) => x.id === sid);
              return (
                <button
                  key={sid}
                  type="button"
                  onClick={() => setBerth(i)}
                  aria-current={on ? "true" : undefined}
                  aria-label={st?.label ?? sid}
                  className="group grid flex-1 gap-1.5 text-left"
                >
                  <span
                    className={`h-px w-full transition-colors ${
                      on ? "bg-bronze" : "bg-line group-hover:bg-muted"
                    }`}
                  />
                  <span
                    className={`font-mono font-medium text-[length:var(--text-meta)] tracking-widest transition-colors ${
                      on ? "text-bronze" : "text-muted group-hover:text-ink"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
          {/* the ends of the rail, on their own line so the five stay
              equal. Both ends are hard stops and say so; getting to
              the experiments cabinet is the top nav's job, which is
              where a visitor already looks for it. */}
          <div className="mt-2 flex h-4 items-baseline justify-between font-mono font-medium text-[length:var(--text-meta)] tracking-widest text-muted">
            <span>{berth === 0 ? "start" : ""}</span>
            <span>{berth === last ? "end" : ""}</span>
          </div>
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
  /** The instrument a hover asked for while the rail was still moving. */
  const pending = useRef<string | null>(null);
  // bumped when an instrument finishes fitting, so the hit boxes
  // re-render at the object's size instead of the stage fallback
  // A state bump, not a key. PointerTargets reads FITTED at render
  // time, so a re-render is all it needs; keying it would unmount and
  // remount the hit boxes on every fit, including the deferred one at
  // 900ms, and a remount under a resting pointer fires a spurious
  // pointerout followed by nothing.
  const [, setFitTick] = useState(0);
  const onFit = useCallback(() => setFitTick((t) => t + 1), []);
  const router = useRouter();

  useEffect(() => {
    useBenchStore.getState().setBoot(35, "three runtime");
  }, []);

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
    if (id === "latent") s.b1Feed();

    const target = berthOf(id);
    /** The regression guard, rewritten.
     *
     *  It used to compare pos.current.x against railX(target): the
     *  camera's rail position against the formula that placed the
     *  object. Both sides ran through berthOf, so a wrong index moved
     *  the object and moved the expected value with it, and the two
     *  agreed while the camera flew at the wrong instrument. That is
     *  precisely why it never caught the `% 6` bug it was written for.
     *  A test whose two sides share a term can only catch disagreement
     *  between things that were never going to disagree.
     *
     *  Now it measures. The object is re-measured off the live scene
     *  graph at the moment the dive fires, and that measurement is
     *  compared against the x the camera is actually going to fly to.
     *  The two reach the same number by different routes, so they can
     *  part company.
     *
     *  What it catches: a stale FITTED entry after a resize whose refit
     *  did not run or early-returned; an instrument that has moved
     *  itself off its slot since it was fitted; and a dive fired at an
     *  instrument that is not currently in the scene.
     *
     *  What it does NOT catch, written down so nobody trusts it further
     *  than it goes:
     *
     *  - A wrong `id` arriving from the hit box. Every check here is
     *    keyed by id, so the wrong instrument measured against the
     *    wrong instrument's aim agrees. That belongs to the hit box.
     *  - Someone restoring the old `dp*dp*ax` endpoint in poseAt. These
     *    checks read diveXOf, not the arc, so the aim would still look
     *    right while the camera flew somewhere else. What protects that
     *    now is structural rather than asserted: the endpoint reads the
     *    measured x, so there is no second number to drift from. Asking
     *    the assertion to re-derive the arc's endpoint would put a
     *    shared formula on both sides again, which is the fault being
     *    removed. */
    const assertAligned = (where: string) => {
      if (process.env.NODE_ENV === "production") return;

      const node = FIT_NODES.get(id);
      if (!node) {
        console.error(
          `[rail] dive fired for "${id}" (${where}) but that instrument is ` +
            `not in the scene: nothing has been fitted under that id. The ` +
            `camera has no target and will fly to wherever it already is.`
        );
        return;
      }
      const aim = diveXOf(id);
      if (aim === undefined) {
        console.error(
          `[rail] dive fired for "${id}" (${where}) with no recorded x. ` +
            `Fit ran but did not write FITTED, so the arc falls back to the ` +
            `camera's own position and lands on whatever is standing there.`
        );
        return;
      }
      const measured = frameBox(node, new THREE.Box3(), new THREE.Box3());
      if (measured.isEmpty()) {
        console.error(
          `[rail] dive fired for "${id}" (${where}) but the instrument ` +
            `measures empty right now, so where it appears cannot be ` +
            `confirmed. Every mesh is either missing or marked noFrame.`
        );
        return;
      }
      const mx = (measured.min.x + measured.max.x) / 2;
      if (Math.abs(aim - mx) > 0.05)
        console.error(
          `[rail] dive for "${id}" (${where}) aims at x=${aim.toFixed(4)} ` +
            `but the instrument is measuring at x=${mx.toFixed(4)}, ` +
            `${Math.abs(aim - mx).toFixed(3)} world units away. The camera ` +
            `will fly at whatever is standing at the aim point instead.`
        );
      // Index agreement, kept but demoted. Today this cannot fire:
      // select() calls setBerth(i) with the same i it derives the id
      // from, so the two are the same number by construction. It is
      // here for the day somebody changes select, or adds a second way
      // in, and the two stop being derived from each other. It is NOT
      // the guard that catches the `% 6` class of bug, and it never
      // was: the measurement above is.
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
          const done = () => {
            setBoot(100, "ready");
            // this session has now paid for the runtime; a second visit
            // to the home page should not be shown a load that is not
            // happening
            sessionStorage.setItem(READY_KEY, "1");
          };
          gl.compileAsync(scene, camera).then(done).catch(done);
        }}
        aria-hidden
      >
        {/* warm paper haze: the rail dims into it either side. No blue */}
        <fog attach="fog" args={["#E9E3D6", 7, 20]} />
        <directionalLight position={[-3, 6, 4]} intensity={1.4} color="#fff6e8" />
        <ambientLight intensity={0.75} />
        <Instruments onFit={onFit} />
        <PointerTargets
          beginTransition={beginTransition}
          railSettled={railSettled}
          defer={(id) => {
            pending.current = id;
          }}
        />
        <Rig pos={pos} pending={pending} overlayEl={overlayEl} onCut={onCut} />
      </Canvas>
      <RailCaption />
      <CutOverlay overlayEl={overlayEl} />
    </>
  );
}
