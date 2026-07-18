import { create } from "zustand";

/** Bench camera state. Berth index survives case-page round trips (相C). */
type BenchState = {
  berth: number;
  setBerth: (i: number) => void;
};

export const useBenchStore = create<BenchState>((set) => ({
  berth: 0,
  setBerth: (i) => set({ berth: i }),
}));
