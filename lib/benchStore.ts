import { create } from "zustand";
import { HOME_BERTH } from "@/lib/bench";

/** Bench state. Berth index survives case-page round trips (相C); the
 *  b* fields are the DOM↔3D bridges for each instrument's keyboard path. */
type BenchState = {
  berth: number;
  setBerth: (i: number) => void;
  /** instrument boot: real milestones only, monotonic, never inflated */
  bootTarget: number;
  bootLabel: string;
  setBoot: (t: number, label: string) => void;
  // B1 film roll (REV: click-to-feed toggle)
  b1FeedNonce: number;
  b1Feed: () => void;
  // B2 tuning fork
  b2Luma: number;
  setB2Luma: (v: number) => void;
  b2StrikeNonce: number;
  b2Strike: () => void;
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
  bootTarget: 0,
  bootLabel: "runtime fetch",
  setBoot: (t, label) =>
    set((s) => ({ bootTarget: Math.max(s.bootTarget, t), bootLabel: label })),
  b1FeedNonce: 0,
  b1Feed: () => set((s) => ({ b1FeedNonce: s.b1FeedNonce + 1 })),
  b2Luma: 0,
  setB2Luma: (v) => set({ b2Luma: v }),
  b2StrikeNonce: 0,
  b2Strike: () => set((s) => ({ b2StrikeNonce: s.b2StrikeNonce + 1 })),
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
