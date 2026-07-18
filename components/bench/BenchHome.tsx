"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Bench = dynamic(() => import("./Bench"), { ssr: false });

/*
 * Mounts the 3D bench only on desktop fine-pointer displays without
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
  }, []);
  return mount;
}

export default function BenchHome({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 z-0">
      <Bench />
    </div>
  );
}
