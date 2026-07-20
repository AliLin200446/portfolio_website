"use client";

import { useState } from "react";

/*
 * LATENT hero: the live before/after 拉杆 (spec ③ first priority).
 * Same honest procedural comparator as the exhibit instrument — pure
 * SVG feGaussianBlur, no WebGL context, interactive, silent.
 */

export default function HalationHero() {
  const [t, setT] = useState(0.4);
  return (
    <div>
      <svg viewBox="0 0 960 420" className="w-full border border-line" aria-label="halation before/after comparator">
        <defs>
          <filter id="hero-halo" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation={t * 16} />
          </filter>
        </defs>
        <rect width="960" height="420" fill="#14100d" />
        <g filter="url(#hero-halo)" fill="#FF8C46" opacity="0.8">
          <circle cx="220" cy="140" r="10" />
          <circle cx="560" cy="230" r="14" />
          <circle cx="780" cy="110" r="7" />
          <circle cx="380" cy="330" r="9" />
        </g>
        <g fill="#FFE9D2">
          <circle cx="220" cy="140" r="6" />
          <circle cx="560" cy="230" r="8" />
          <circle cx="780" cy="110" r="4" />
          <circle cx="380" cy="330" r="5" />
        </g>
      </svg>
      <div className="mt-3 flex items-center gap-4 font-mono text-xs">
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(t * 100)}
          onChange={(e) => setT(Number(e.target.value) / 100)}
          aria-label="halation radius"
          className="h-px w-48 cursor-pointer appearance-none bg-line accent-[#8C6A3F]"
        />
        <span className="text-muted">halation radius · {Math.round(t * 24)} px</span>
      </div>
    </div>
  );
}
