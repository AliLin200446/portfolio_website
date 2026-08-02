"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { BERTH_ORDER } from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";

const Rail = dynamic(() => import("./Rail"), { ssr: false });

/*
 * Mounts the 3D rail only on desktop fine-pointer displays without
 * reduced-motion. Everywhere else (mobile, coarse, reduced, no JS) the
 * server-rendered DOM list stays visible — navigation never depends on
 * WebGL. Returns [mount3d] so the page can hide the list when 3D is up.
 */
export function useBench3d() {
  const [mount, setMount] = useState(false);
  useEffect(() => {
    const ok = window.matchMedia(
      "(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
    ).matches;
    setMount(ok);
    // ?berth=N deep-link (also used by case pages to return to a berth).
    // Bounded by BERTH_ORDER, which is what a berth indexes. It read
    // STATIONS.length, a different array that happens to hold the same
    // five ids today. That is the `% 6` shape exactly: a number that is
    // right by coincidence, until the two arrays stop matching and a
    // deep link lands on nothing.
    const raw = new URLSearchParams(window.location.search).get("berth");
    const b = raw === null ? NaN : Number(raw);
    if (Number.isInteger(b) && b >= 0 && b < BERTH_ORDER.length)
      useBenchStore.getState().setBerth(b);
  }, []);
  return mount;
}

export default function BenchHome({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 z-0">
      <Rail />
    </div>
  );
}
