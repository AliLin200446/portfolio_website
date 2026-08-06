"use client";

import { useEffect, useState } from "react";

/*
 * LATENT: the five-pass breakdown. Client component ON PURPOSE and by
 * exception: the two columns share one hover index, which server
 * rendering cannot express. It is a LEAF. CaseHero and CaseTemplate
 * above and below it stay server components, so the cost is this file
 * and nothing else.
 *
 * No 3D library. The stack is five SVG rhombi at fixed coordinates;
 * nothing rotates, nothing animates a transform, and there is no camera.
 * R3F would add a renderer and a frame loop to draw five static
 * polygons.
 *
 * PASSES: read out of latent/src/gl/renderer.ts, where five Pass objects
 * are constructed at lines 92-96 and drawn in this order at 289, 302,
 * 349, 381 and 403. The descriptions come from the shader sources, not
 * from the case copy. If the pipeline changes, this file is wrong until
 * it changes with it.
 */
type Pass = { n: number; name: string; body: string };

const PASSES: Pass[] = [
  {
    n: 1,
    name: "Threshold",
    // threshold.frag.glsl:26-29
    body: "Masks highlights with a smoothstep on gamma-space luma, so the threshold tracks perceived brightness.",
  },
  {
    n: 2,
    name: "Blur",
    // blur.frag.glsl:5, 19-23
    body: "Five texture fetches per direction, run horizontally then vertically as a separable gaussian.",
  },
  {
    n: 3,
    name: "Composite",
    // composite.frag.glsl:38-39
    body: "Screen blends the tinted glow over the base in linear light, adding energy without hard clipping.",
  },
  {
    n: 4,
    name: "Color Response",
    // colorResponse.frag.glsl:6-11
    body: "Applies the stock's dye-layer crosstalk matrix, then its characteristic curve.",
  },
  {
    n: 5,
    name: "Grain",
    // grain.frag.glsl:8, 21-22, 44
    body: "Granularity rises with developed density and saturates, seeded by a pcg3d integer hash.",
  },
];

/* Geometry for the exploded stack. Bottom plane is pass 1, top is pass 5,
   so the array is walked in reverse when drawing. Even 80px spacing. */
const CX = 200;
const HALF_W = 150;
const HALF_D = 62;
const TOP_Y = 96;
const GAP = 80;

function planeY(n: number) {
  // pass 1 sits lowest, pass 5 highest
  return TOP_Y + (5 - n) * GAP;
}

function rhombus(cy: number) {
  return [
    `${CX - HALF_W},${cy}`,
    `${CX},${cy - HALF_D}`,
    `${CX + HALF_W},${cy}`,
    `${CX},${cy + HALF_D}`,
  ].join(" ");
}

export default function PassBreakdown() {
  const [active, setActive] = useState<number | null>(null);
  /* Starts false so the server render and the first client render agree,
     and so a touch device never enters a hover state at all. */
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCanHover(
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
    );
  }, []);

  const on = canHover ? active : null;
  const bind = (n: number) =>
    canHover
      ? { onMouseEnter: () => setActive(n), onMouseLeave: () => setActive(null) }
      : {};

  return (
    <section
      aria-labelledby="latent-passes"
      style={
        {
          "--hero-hair": "color-mix(in srgb, var(--ink) 14%, transparent)",
          "--hero-slate": "#4E5B54",
        } as React.CSSProperties
      }
      className="bg-paper px-5 sm:pl-10 sm:pr-8 xl:pl-[132px]"
    >
      {/* Explicit column and row placement rather than `order`, because a
          single heading has to sit in two different places: above the
          diagram on one column, and at the top of the left column beside
          it on two. Placement lets one h2 do both. DOM order is heading,
          diagram, rows, which is exactly the phone reading order. */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <h2
          id="latent-passes"
          className="pb-8 pt-10 font-serif text-5xl font-semibold uppercase leading-[0.92] tracking-tight text-ink lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:pr-[38px]"
        >
          Five GL Passes
        </h2>

        {/* DIAGRAM. Spans both rows on desktop so its rule runs the full
            height of the section and the sticky box has room to travel. */}
        <div className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:border-l lg:border-[color:var(--hero-hair)]">
          <div className="lg:sticky lg:top-[4.25rem] py-10 lg:pl-[38px]">
            <svg
              viewBox="0 0 400 520"
              className="h-auto w-full max-w-[420px]"
              role="img"
              aria-label="An exploded stack of five planes, one per GLSL pass, the first pass at the bottom and the last at the top."
            >
              {[...PASSES].reverse().map((p) => {
                const cy = planeY(p.n);
                const isOn = on === p.n;
                const dim = on !== null && !isOn;
                return (
                  <g
                    key={p.n}
                    className="pass-plane"
                    style={{ opacity: dim ? 0.35 : 1 }}
                    {...bind(p.n)}
                  >
                    <polygon
                      points={rhombus(cy)}
                      className="pass-plane-face"
                      style={{
                        fill: `color-mix(in srgb, var(--ink) ${isOn ? 12 : 6}%, transparent)`,
                        stroke: isOn
                          ? "var(--oxblood)"
                          : "color-mix(in srgb, var(--ink) 34%, transparent)",
                        strokeWidth: 1,
                      }}
                    />
                    {/* numeral at the leading (left) vertex */}
                    <text
                      x={CX - HALF_W - 14}
                      y={cy + 5}
                      textAnchor="end"
                      className="font-serif"
                      /* Ink at both states on purpose. The spec puts
                         oxblood on the STROKE only, so the highlight
                         spends exactly one oxblood mark on this screen
                         rather than two. */
                      style={{
                        fontSize: 15,
                        fill: `color-mix(in srgb, var(--ink) ${isOn ? 85 : 55}%, transparent)`,
                      }}
                    >
                      {p.n}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* ROWS */}
        <div className="lg:col-span-6 lg:col-start-1 lg:row-start-2 lg:pr-[38px]">
          <ul>
            {PASSES.map((p) => {
              const isOn = on === p.n;
              const dim = on !== null && !isOn;
              return (
                <li
                  key={p.n}
                  className="pass-row flex items-baseline gap-5 border-t border-[color:var(--hero-hair)] px-3 py-6"
                  style={{
                    opacity: dim ? 0.5 : 1,
                    background: isOn
                      ? "color-mix(in srgb, var(--ink) 5%, transparent)"
                      : "transparent",
                  }}
                  {...bind(p.n)}
                >
                  <span className="w-8 shrink-0 font-serif text-[34px] leading-none text-ink">
                    {p.n}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-serif text-base uppercase tracking-[0.04em] text-bronze-text">
                      {p.name}
                    </span>
                    <span className="mt-2 block font-serif text-sm leading-[1.6] text-[color:var(--hero-slate)]">
                      {p.body}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="border-t border-[color:var(--hero-hair)]" />
        </div>
      </div>
    </section>
  );
}
