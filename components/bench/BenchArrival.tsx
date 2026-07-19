"use client";

import { useEffect, useState } from "react";

/*
 * Match-cut arrival (CAROUSEL transitions): if this case page was
 * entered through the bench dive, the first frame is the same surface
 * the home overlay ended on — the veil then dissolves 0.35s into the
 * page. RESONANCE additionally inherits the strike: the page lands at
 * scale 1.015 and settles to 1.0 in 0.4s, once, never looping.
 * Direct visits (no bench-cut flag) render nothing. The flag is kept
 * in sessionStorage so the home page can play the 0.5s reverse when
 * the visitor walks back (← Index).
 * reduced-motion: instant arrival — no veil, no scale.
 */

const CUT_BG: Record<string, string> = {
  latent: "#14100d",
  resonance: "#F5F2EC",
  "skeletal-silk": "#FBF5E8",
  vestige: "#F5F2EC",
};

/** silk holds its warm white a touch longer, then falls off */
const VEIL_MS: Record<string, number> = { "skeletal-silk": 500 };
const VEIL_EASE: Record<string, string> = {
  "skeletal-silk": "cubic-bezier(0.5, 0, 0.75, 1)",
};

export default function BenchArrival({ slug }: { slug: string }) {
  const [veil, setVeil] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("bench-cut") !== slug || !CUT_BG[slug]) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setVeil(CUT_BG[slug]);
    if (slug === "resonance")
      document.body.animate(
        [{ transform: "scale(1.015)" }, { transform: "scale(1)" }],
        { duration: 400, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
    const id = setTimeout(() => setVeil(null), (VEIL_MS[slug] ?? 350) + 30);
    return () => clearTimeout(id);
  }, [slug]);

  if (!veil) return null;
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        background: veil,
        pointerEvents: "none",
        animation: `bench-veil ${VEIL_MS[slug] ?? 350}ms ${
          VEIL_EASE[slug] ?? "ease"
        } forwards`,
      }}
    />
  );
}
