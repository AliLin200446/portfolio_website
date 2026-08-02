import { create } from "zustand";
import { HOME_BERTH } from "@/lib/bench";

/** Bench state. Berth index survives case-page round trips (相C); the
 *  b* fields are the DOM↔3D bridges for each instrument's keyboard path. */
type BenchState = {
  /** which instrument is being shown. Intent: set by the ticks, the
   *  arrow keys, the nav and a drag. The camera follows it. */
  berth: number;
  setBerth: (i: number) => void;
  /** which berth the camera is physically over right now. Follows the
   *  travel rather than the intent, and exists only so the mount window
   *  covers the instruments a long jump passes over. Writing this into
   *  `berth` instead looks like it works and does not: the frame loop
   *  would overwrite every commanded jump on the next frame, before the
   *  camera had moved far enough to agree with it. */
  passing: number;
  setPassing: (i: number) => void;
  /** instrument boot: real milestones only, monotonic, never inflated */
  bootTarget: number;
  bootLabel: string;
  setBoot: (t: number, label: string) => void;
  // B1 film roll (REV: click-to-feed toggle)
  b1FeedNonce: number;
  b1Feed: () => void;
  // B3 cocoon (REV: strand-pull toggle)
  b3PullNonce: number;
  b3Pull: () => void;
  // B5 seal
  b5StampNonce: number;
  b5Stamp: () => void;
  /** hover-card target (CAROUSEL): station id under the pointer, or null */
  hovered: string | null;
  setHovered: (id: string | null) => void;
  /** enter-transition (CAROUSEL): the station diving into its case page.
   *  dir 1 = forward, -1 = reversing (Esc/re-click at 1.5×). Instruments
   *  read transitionId to play their own existing mechanism as the
   *  answer beat — no new choreography lives here. */
  transitionId: string | null;
  transitionDir: 1 | -1;
  startTransition: (id: string) => void;
  reverseTransition: () => void;
  endTransition: () => void;
};

export const useBenchStore = create<BenchState>((set) => ({
  berth: HOME_BERTH,
  setBerth: (i) => set({ berth: i }),
  passing: HOME_BERTH,
  setPassing: (i) => set({ passing: i }),
  bootTarget: 0,
  bootLabel: "runtime fetch",
  setBoot: (t, label) =>
    set((s) => ({ bootTarget: Math.max(s.bootTarget, t), bootLabel: label })),
  b1FeedNonce: 0,
  b1Feed: () => set((s) => ({ b1FeedNonce: s.b1FeedNonce + 1 })),
  b3PullNonce: 0,
  b3Pull: () => set((s) => ({ b3PullNonce: s.b3PullNonce + 1 })),
  b5StampNonce: 0,
  b5Stamp: () => set((s) => ({ b5StampNonce: s.b5StampNonce + 1 })),
  hovered: null,
  setHovered: (id) => set({ hovered: id }),
  transitionId: null,
  transitionDir: 1,
  startTransition: (id) => set({ transitionId: id, transitionDir: 1 }),
  reverseTransition: () => set({ transitionDir: -1 }),
  endTransition: () => set({ transitionId: null, transitionDir: 1 }),
}));
