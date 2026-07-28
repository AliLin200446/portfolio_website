"use client";

import { useState } from "react";

/*
 * LATENT hero: the live before/after comparator. Pure SVG
 * feGaussianBlur, no WebGL context, interactive, silent.
 *
 * The readout used to print Math.round(t * 24) while the filter ran at
 * t * 16, so the number on screen was never the number being drawn:
 * at rest it claimed 10 where the filter was at 6.4. It also called the
 * result "px", which it is not.
 *
 * One value now feeds both, and it is labelled for what it is. SVG
 * stdDeviation is a true gaussian sigma in user units of this viewBox,
 * so the label reads sigma, not px.
 *
 * Note this sigma is NOT the engine's halationRadius. That parameter
 * drives an iteration count (N = radius^2 / 4, renderer.ts:310-317), so
 * the calibrated 4.9 lands near sigma 7.5 in quarter-res texels. The two
 * scales are not interchangeable and this comparator does not pretend
 * otherwise.
 */

/** gaussian sigma, in the user units of the 960x420 viewBox below */
const SIGMA_MAX = 16;

export default function HalationHero() {
  const [t, setT] = useState(0.4);
  // the single value: what the filter uses IS what the label prints
  const sigma = t * SIGMA_MAX;
  return (
    <div>
      <svg viewBox="0 0 960 420" className="w-full border border-line" aria-label="halation before/after comparator">
        <defs>
          <filter id="hero-halo" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation={sigma} />
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
          aria-label="halation blur sigma"
          className="h-px w-48 cursor-pointer appearance-none bg-line accent-[#8C6A3F]"
        />
        <span className="text-muted">
          halation blur &#963; {sigma.toFixed(1)} &#183; viewBox units
        </span>
      </div>
    </div>
  );
}
