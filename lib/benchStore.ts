import { create } from "zustand";

/** Bench state. Berth index survives case-page round trips (相C); the
 *  b* fields are the DOM↔3D bridges for each instrument's keyboard path. */
type BenchState = {
  berth: number;
  setBerth: (i: number) => void;
  // B1 film roll (REV: click-to-feed toggle)
  b1FeedNonce: number;
  b1Feed: () => void;
  // B2 tuning fork
  b2Luma: number;
  setB2Luma: (v: number) => void;
  b2StrikeNonce: number;
  b2Strike: () => void;
  // B3 cocoon
  b3BoneNonce: number;
  b3Bone: () => void;
  /** keyboard-focus equivalent of sustained hover (透态) */
  b3Reveal: boolean;
  setB3Reveal: (v: boolean) => void;
  // B4 movement
  b4Sel: number;
  setB4Sel: (i: number) => void;
  b4GrabNonce: number;
  b4Grab: () => void;
  // B5 seal
  b5StampNonce: number;
  b5Stamp: () => void;
  // B6 bronze figure
  b6PointIdx: number;
  setB6PointIdx: (i: number) => void;
  b6NeedleNonce: number;
  b6Needle: () => void;
};

export const useBenchStore = create<BenchState>((set) => ({
  berth: 0,
  setBerth: (i) => set({ berth: i }),
  b1FeedNonce: 0,
  b1Feed: () => set((s) => ({ b1FeedNonce: s.b1FeedNonce + 1 })),
  b2Luma: 0,
  setB2Luma: (v) => set({ b2Luma: v }),
  b2StrikeNonce: 0,
  b2Strike: () => set((s) => ({ b2StrikeNonce: s.b2StrikeNonce + 1 })),
  b3BoneNonce: 0,
  b3Bone: () => set((s) => ({ b3BoneNonce: s.b3BoneNonce + 1 })),
  b3Reveal: false,
  setB3Reveal: (v) => set({ b3Reveal: v }),
  b4Sel: 1, // queue wheel is the protagonist
  setB4Sel: (i) => set({ b4Sel: ((i % 3) + 3) % 3 }),
  b4GrabNonce: 0,
  b4Grab: () => set((s) => ({ b4GrabNonce: s.b4GrabNonce + 1 })),
  b5StampNonce: 0,
  b5Stamp: () => set((s) => ({ b5StampNonce: s.b5StampNonce + 1 })),
  b6PointIdx: 0,
  setB6PointIdx: (i) => set({ b6PointIdx: i }),
  b6NeedleNonce: 0,
  b6Needle: () => set((s) => ({ b6NeedleNonce: s.b6NeedleNonce + 1 })),
}));
