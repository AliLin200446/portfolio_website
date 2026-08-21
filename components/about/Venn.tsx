"use client";

import { useEffect, useId, useState } from "react";
import {
  INTRO,
  PANELS,
  PANEL_ORDER,
  type RegionKey,
} from "@/content/about";

/*
 * THREE CIRCLES. Eye, hand, instrument; the three pairs between them;
 * and the middle, which is the claim the page is making.
 *
 * HIT TESTING IS NOT THE CIRCLES. A pointer inside the centre is also
 * inside all three circles, so hovering circles would light three
 * regions at once and answer with whichever happened to be on top.
 * There is instead a layer of seven transparent paths, one per region
 * of the partition, cut from the circles' actual intersections. They
 * are disjoint by construction, so a point belongs to exactly one.
 *
 * The paths are computed, not drawn. Circle centres and radius are
 * fixed, so the six intersection points and every arc between them are
 * arithmetic, done once and written down below with the numbers that
 * produced them. Nothing here was nudged into place.
 *
 * The circles themselves only ever change stroke-width and opacity. No
 * transform, no scale, no rotation: three overlapping circles are a
 * diagram of a claim, and a diagram that moves is a decoration.
 *
 * KEYBOARD IS NOT THE PATHS. A tabindex on an SVG child makes it
 * focusable enough that document.activeElement moves to it, and then
 * fires no event at all: not focus, not focusin, not at document level
 * either. Measured, not assumed. So nothing can observe it and the
 * whole keyboard route would have been silently dead. The seven
 * regions are therefore paired with seven real buttons, hidden until
 * focused, which carry the labels, the focus ring and the same state.
 * Pointer users get the shapes; keyboard users get a list that
 * announces itself.
 */

/* ── geometry ───────────────────────────────────────────────────────
 * A (340,155) eye · B (295,235) hand · C (385,235) instrument, r 115.
 *
 * Pairwise intersections, each pair giving two points, named by which
 * side of the third circle they fall on:
 *   A n B  ->  in (409.404, 246.696)   out (225.596, 143.304)
 *   A n C  ->  in (270.596, 246.696)   out (454.404, 143.304)
 *   B n C  ->  in (340.000, 129.170)   out (340.000, 340.830)
 * The three `in` points are the corners of the centre.
 */
const R = 115;
/* Each circle carries a colour from the site palette, and its label
 * takes the same one, so the coding is legible without a key.
 *
 * Chosen against measured contrast on paper, not by eye: ink 15.97,
 * wood 8.42, bronze-text 4.87, all clear of 4.5:1 so the labels pass
 * as text and not merely as graphics. Cinnabar is not among them and
 * neither is the brand sun at 4.79, which sits close enough to
 * cinnabar to blur the one-per-screen rule. The middle keeps it. */
const CIRCLES = [
  { key: "A", cx: 340, cy: 155, color: "#866339" }, // eye, copper
  { key: "B", cx: 295, cy: 235, color: "#3a4a3f" }, // hand, wood
  { key: "C", cx: 385, cy: 235, color: "#1a1714" }, // instrument, ink
] as const;
const COLOR = Object.fromEntries(CIRCLES.map((c) => [c.key, c.color])) as Record<
  "A" | "B" | "C",
  string
>;

/** Which circles a region is inside. Drives both the stroke weight and
 *  which circles fade, so the two can never disagree. */
const OF: Record<RegionKey, ReadonlyArray<"A" | "B" | "C">> = {
  eye: ["A"],
  hand: ["B"],
  instrument: ["C"],
  "eye-hand": ["A", "B"],
  "hand-instrument": ["B", "C"],
  "eye-instrument": ["A", "C"],
  center: ["A", "B", "C"],
};

/** One closed path per region, arcs only, all radius 115. */
const D: Record<RegionKey, string> = {
  eye: "M225.596 143.304A115 115 0 0 1 454.404 143.304A115 115 0 0 0 340.000 129.170A115 115 0 0 0 225.596 143.304Z",
  hand: "M225.596 143.304A115 115 0 0 0 270.596 246.696A115 115 0 0 0 340.000 340.830A115 115 0 0 1 225.596 143.304Z",
  instrument:
    "M454.404 143.304A115 115 0 0 1 409.404 246.696A115 115 0 0 1 340.000 340.830A115 115 0 0 0 454.404 143.304Z",
  "eye-hand":
    "M225.596 143.304A115 115 0 0 0 270.596 246.696A115 115 0 0 1 340.000 129.170A115 115 0 0 0 225.596 143.304Z",
  "hand-instrument":
    "M340.000 340.830A115 115 0 0 0 409.404 246.696A115 115 0 0 1 270.596 246.696A115 115 0 0 0 340.000 340.830Z",
  "eye-instrument":
    "M454.404 143.304A115 115 0 0 1 409.404 246.696A115 115 0 0 0 340.000 129.170A115 115 0 0 1 454.404 143.304Z",
  center:
    "M270.596 246.696A115 115 0 0 0 409.404 246.696A115 115 0 0 0 340.000 129.170A115 115 0 0 0 270.596 246.696Z",
};

/** Regions in painting order. Disjoint, so this decides nothing about
 *  hit testing; it only keeps the diff readable. */
const REGIONS: RegionKey[] = [
  ...PANEL_ORDER.filter((k) => k !== "center"),
  "center",
];

const INK = "#1a1714";
const OXBLOOD = "#9a3b22";
const AMBER = "#FFB46B";

function Diagram({
  active,
  focused,
  onEnter,
  onLeave,
  interactive,
  labelledBy,
}: {
  active: RegionKey | null;
  focused: RegionKey | null;
  onEnter: (k: RegionKey) => void;
  onLeave: () => void;
  interactive: boolean;
  labelledBy: string;
}) {
  const lit = (c: "A" | "B" | "C") => !active || OF[active].includes(c);

  return (
    <svg
      viewBox="0 0 680 400"
      className="w-full"
      role="img"
      aria-labelledby={labelledBy}
    >
      <title id={labelledBy}>
        Three overlapping circles: eye, hand and instrument. Ali Lin
        sits where all three meet.
      </title>

      {CIRCLES.map((c) => (
        <circle
          key={c.key}
          cx={c.cx}
          cy={c.cy}
          r={R}
          fill="none"
          stroke={c.color}
          strokeWidth={active && lit(c.key) ? 2.5 : 1.5}
          opacity={active && !lit(c.key) ? 0.35 : 1}
          className="venn-part"
        />
      ))}

      <g
        fontFamily="var(--font-geist-mono), ui-monospace, monospace"
        fontSize="11"
        letterSpacing="0.08em"
        textAnchor="middle"
      >
        <text x={340} y={92} fill={COLOR.A}>EYE</text>
        <text x={240} y={294} fill={COLOR.B}>HAND</text>
        <text x={444} y={294} fill={COLOR.C}>INSTRUMENT</text>
      </g>

      <g
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        fontSize="14"
        textAnchor="middle"
        fill={active === "center" ? OXBLOOD : INK}
        className="venn-part"
      >
        <text x={340} y={210}>Ali Lin</text>
      </g>

      {/* the hit layer. Transparent, never `none`: a path with no fill
          takes no pointer events at all. */}
      {interactive && (
        <g>
          {REGIONS.map((k) => (
            <path
              key={k}
              d={D[k]}
              fill={active === k ? "rgba(26,23,20,0.05)" : "transparent"}
              stroke={focused === k ? AMBER : "none"}
              strokeWidth={focused === k ? 1.5 : 0}
              pointerEvents="auto"
              aria-hidden
              data-region={k}
              className="venn-part"
              onPointerOver={() => onEnter(k)}
              onPointerOut={onLeave}
            />
          ))}
        </g>
      )}
    </svg>
  );
}

function Block({ k, heading }: { k: RegionKey; heading: 2 | 3 }) {
  const p = PANELS[k];
  const H = heading === 2 ? "h2" : "h3";
  return (
    <>
      <H className="font-serif text-[length:var(--text-lead)] leading-tight">{p.title}</H>
      <p className="mt-3 max-w-[46ch] text-[length:var(--text-body)] leading-relaxed text-ink/80">
        {p.body}
      </p>
    </>
  );
}

export default function Venn() {
  const [active, setActive] = useState<RegionKey | null>(null);
  const [focused, setFocused] = useState<RegionKey | null>(null);
  // false until proven otherwise, so the server, the phone, a coarse
  // pointer and a browser with no JS all get the same thing: the
  // diagram, then all seven blocks, all readable without hovering
  // anything.
  const [interactive, setInteractive] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setInteractive(
      window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches
    );
  }, []);

  const shown = PANELS[active ?? "center"];

  const intro = (
    <p className="max-w-[46ch] font-serif text-[length:var(--text-lead)] leading-snug text-muted">
      {INTRO}
    </p>
  );

  if (!interactive)
    return (
      <>
        {intro}
        <div className="mx-auto mt-10 w-full max-w-[340px]">
          <Diagram
            active={null}
            focused={null}
            onEnter={() => {}}
            onLeave={() => {}}
            interactive={false}
            labelledBy={titleId}
          />
        </div>
        <div className="mt-12">
          {PANEL_ORDER.map((k) => (
            <section
              key={k}
              className="border-t border-line py-7"
              style={{ borderTopWidth: "0.5px" }}
            >
              <Block k={k} heading={2} />
            </section>
          ))}
        </div>
      </>
    );

  return (
    <>
      {intro}
      <div className="mt-10 grid grid-cols-[55fr_45fr]">
        <div className="pr-10">
          <div className="mx-auto w-full max-w-[520px]">
            <Diagram
              active={active}
              focused={focused}
              onEnter={setActive}
              onLeave={() => setActive(null)}
              interactive
              labelledBy={titleId}
            />
          </div>

          {/* The keyboard route. Hidden until focused, so the drawing
              is exactly the drawing, and a Tab through it surfaces
              seven named stops one at a time. These are real buttons
              because the SVG regions cannot be: see the note at the
              top. */}
          {/* absolutely positioned in BOTH states on purpose. A button
              that grows from clipped to full size when focused reflows
              the column, which slides the diagram out from under a
              resting mouse pointer and fires pointerover on whichever
              region moved under it. The focus route would then fight
              the pointer route. Nothing here changes layout. */}
          <div className="relative h-8">
            {REGIONS.map((k) => (
              <button
                key={k}
                type="button"
                onFocus={() => {
                  setFocused(k);
                  setActive(k);
                }}
                onBlur={() => {
                  setFocused(null);
                  setActive(null);
                }}
                className="absolute left-0 top-1 h-px w-px overflow-hidden whitespace-nowrap bg-paper font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-[0.08em] text-ink opacity-0 focus:h-auto focus:w-auto focus:overflow-visible focus:px-2 focus:py-1 focus:opacity-100 focus:outline focus:outline-[1.5px] focus:outline-offset-2 focus:outline-[#FFB46B]"
              >
                {PANELS[k].title}
              </button>
            ))}
          </div>
        </div>
        {/* fixed height so the diagram never shifts as the text
            changes length; the longest block sets it */}
        <div
          className="min-h-[15rem] border-l border-line pl-10"
          style={{ borderLeftWidth: "0.5px" }}
          aria-live="polite"
        >
          <h2 className="font-serif text-[length:var(--text-lead)] leading-tight">
            {shown.title}
          </h2>
          <p className="mt-3 max-w-[46ch] text-[length:var(--text-body)] leading-relaxed text-ink/80">
            {shown.body}
          </p>
        </div>
      </div>
    </>
  );
}
