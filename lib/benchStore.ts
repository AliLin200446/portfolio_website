import { create } from "zustand";

/** Bench state. Berth index survives case-page round trips (相C);
 *  b1Strength links the film-roll pull to the DOM nameplate slider. */
type BenchState = {
  berth: number;
  setBerth: (i: number) => void;
  b1Strength: number;
  setB1Strength: (s: number) => void;
  /** increments to request a B5 seal stamp (keyboard path via nameplate) */
  b5StampNonce: number;
  b5Stamp: () => void;
};

export const useBenchStore = create<BenchState>((set) => ({
  berth: 0,
  setBerth: (i) => set({ berth: i }),
  b1Strength: 0,
  setB1Strength: (s) =>
    set({ b1Strength: Math.max(0, Math.min(100, Math.round(s))) }),
  b5StampNonce: 0,
  b5Stamp: () => set((s) => ({ b5StampNonce: s.b5StampNonce + 1 })),
}));
