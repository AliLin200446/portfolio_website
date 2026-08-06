"use client";

import { useEffect, useState } from "react";
import { LatencyAnatomy, StepDelta, SeedDeterminism } from "../TeardownFigures";

/*
 * TEARDOWN: the findings list and its one swapping frame.
 *
 * Client component by exception, and a LEAF. The list and the frame share
 * one hover index, which server rendering cannot express. CaseHero above
 * and CaseTemplate below stay server components.
 *
 * FIGURES ARE NOT COPIED. Findings 1 to 3 mount the same
 * LatencyAnatomy, SeedDeterminism and StepDelta that CaseTemplate
 * already renders further down the page. Nothing here screenshots or
 * reimplements them, and TeardownFigures.tsx is not modified.
 *
 * MOUNT COST. useSettle in TeardownFigures starts no animation on mount:
 * its useEffect only registers a cancelAnimationFrame cleanup, and run()
 * is called by each figure's own internal row hover. Mounting all three
 * at once is therefore three static SVG trees and zero animation frames,
 * so none of them needs pausing and none is ever unmounted on hover.
 *
 * The hidden panels take pointer-events: none so a figure sitting at
 * opacity 0 cannot capture a hover and start its own rAF underneath the
 * visible one.
 *
 * FINDING 4 HAS NO FIGURE, and is not given one. The frame shows the two
 * source lines instead, read from the live evidence file. Reusing
 * finding 3's chart here would attach a picture to a claim it does not
 * measure.
 *
 * ACCESSIBILITY. Every figure already carries role="img" and a written
 * aria-label inside TeardownFigures (lines 148, 206, 487). Nothing is
 * added here; the inactive panels are aria-hidden so a screen reader is
 * offered one figure rather than four.
 */

type Finding = {
  n: number;
  title: string;
  body: string;
  caption: string;
};

const FINDINGS: Finding[] = [
  {
    n: 1,
    title: "The Hidden Segment",
    // content/cases/teardown.ts:105 -> e4-latency/stats.md:11-13, 20-22
    body: "Queue standard deviation is 277.0 ms against 9.9 ms for inference, and queue is not returned.",
    caption: "FIG A · latency anatomy",
  },
  {
    n: 2,
    title: "Identical Bytes",
    // content/cases/teardown.ts:119 -> e3-seed/report.txt
    body: "Three runs returned three different inference times, one sha256, and zero of 262,144 pixels differing.",
    caption: "FIG D · seed determinism",
  },
  {
    n: 3,
    title: "Past 28",
    // _tools/adjacent-diffs.txt:8-9
    body: "S20 to S28 moves 7.655 percent of pixels; the next eight steps move only 1.488 percent.",
    caption: "FIG C · adjacent step deltas",
  },
  {
    n: 4,
    title: "No Resting Point",
    // _tools/adjacent-diffs.txt:14, 18
    body: "No adjacent guidance pair falls below 17.167 percent, and the last rung still moves 57.591 percent.",
    caption: "guidance deltas · G1 to G20 · adjacent-diffs.txt:12-18",
  },
];

/* One panel per finding, stacked and toggled by opacity. All four
   centre now that finding 4 carries a figure rather than raw text. */
function Panel({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden={!active}
      className="finding-panel absolute inset-0 flex items-center justify-center"
      style={{ opacity: active ? 1 : 0, pointerEvents: active ? "auto" : "none" }}
    >
      {children}
    </div>
  );
}

/* The seven adjacent guidance pairs, read verbatim from
   https://teardown.alilinlab.com/evidence/_tools/adjacent-diffs.txt
   lines 12 to 18. Columns in that file are pair, over32Pct,
   meanAbsDelta; only over32Pct is plotted.

   The case claim at content/cases/teardown.ts:147 is about the whole
   G1 to G20 range, not about two rungs, so the whole range is drawn.
   The two the claim quotes are marked: 17.167 is the floor and 57.591
   is the last rung. No value here is computed or rounded; each is the
   file's own string. */
const GUIDANCE: { pair: string; pct: number; line: number }[] = [
  { pair: "G1\u21922", pct: 26.017, line: 12 },
  { pair: "G2\u21923.5", pct: 49.098, line: 13 },
  { pair: "G3.5\u21925", pct: 17.167, line: 14 },
  { pair: "G5\u21927", pct: 78.724, line: 15 },
  { pair: "G7\u219210", pct: 71.619, line: 16 },
  { pair: "G10\u219215", pct: 66.024, line: 17 },
  { pair: "G15\u219220", pct: 57.591, line: 18 },
];

const FLOOR = 17.167;

/* Finding 4's figure. Built here rather than in TeardownFigures, which
   is not modified by this section. Same 560x200 viewBox as StepDelta so
   it letterboxes identically to its neighbours. */
function GuidanceDeltas() {
  const W = 560;
  const H = 200;
  const BASE = 150;
  const LEFT = 40;
  const RIGHT = 18;
  const TOP = 34;
  const MAX = 80;
  const slot = (W - LEFT - RIGHT) / GUIDANCE.length;
  const bw = 30;
  const y = (pct: number) => BASE - (pct / MAX) * (BASE - TOP);
  const AXIS = "color-mix(in srgb, var(--ink) 22%, transparent)";
  const MUTED = "color-mix(in srgb, var(--ink) 55%, transparent)";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Pixels changed between adjacent guidance rungs from G1 to G20: 26.017, 49.098, 17.167, 78.724, 71.619, 66.024 and 57.591 percent. The lowest is 17.167 percent and the last rung is 57.591 percent."
    >
      {[40, 80].map((g) => (
        <g key={g}>
          <line
            x1={LEFT}
            x2={W - RIGHT}
            y1={y(g)}
            y2={y(g)}
            stroke={AXIS}
            strokeWidth="1"
          />
          <text x={4} y={y(g) + 3} fontSize="8" fill={MUTED} fontFamily="var(--font-mono)">
            {g}%
          </text>
        </g>
      ))}

      {/* the floor the claim names, drawn so it can be checked by eye */}
      <line
        x1={LEFT}
        x2={W - RIGHT}
        y1={y(FLOOR)}
        y2={y(FLOOR)}
        stroke="var(--bronze-text)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <text
        x={W - RIGHT}
        y={y(FLOOR) - 5}
        fontSize="8"
        textAnchor="end"
        fill="var(--bronze-text)"
        fontFamily="var(--font-mono)"
      >
        floor 17.167%
      </text>

      {GUIDANCE.map((d, i) => {
        const x = LEFT + i * slot + (slot - bw) / 2;
        const h = BASE - y(d.pct);
        const marked = d.line === 14 || d.line === 18;
        return (
          <g key={d.pair}>
            <rect x={x} y={y(d.pct)} width={bw} height={h} fill="var(--ink)" />
            <text
              x={x + bw / 2}
              y={y(d.pct) - 5}
              fontSize="8"
              textAnchor="middle"
              fill={marked ? "var(--bronze-text)" : MUTED}
              fontFamily="var(--font-mono)"
            >
              {d.pct}%
            </text>
            <text
              x={x + bw / 2}
              y={BASE + 12}
              fontSize="7"
              textAnchor="middle"
              fill={MUTED}
              fontFamily="var(--font-mono)"
            >
              {d.pair}
            </text>
          </g>
        );
      })}

      <line x1={LEFT} x2={W - RIGHT} y1={BASE} y2={BASE} stroke={AXIS} strokeWidth="1" />
      <text x={LEFT} y={H - 16} fontSize="7" fill={MUTED} fontFamily="var(--font-mono)">
        {"pixels changed, \u0394>32 \u00b7 no pair falls below the floor \u00b7 the last rung still moves 57.591%"}
      </text>
      <text x={LEFT} y={H - 4} fontSize="7" fill="var(--bronze-text)" fontFamily="var(--font-mono)">
        _tools/adjacent-diffs.txt:12-18
      </text>
    </svg>
  );
}

export default function FindingsFrame() {
  const [hovered, setHovered] = useState<number | null>(null);
  const [canHover, setCanHover] = useState(false);

  /* Starts false so server and first client render agree, and so a touch
     device never enters a hover state at all. */
  useEffect(() => {
    setCanHover(
      window.matchMedia("(hover: hover) and (pointer: fine)").matches
    );
  }, []);

  const shown = canHover && hovered !== null ? hovered : 0;

  const bind = (i: number) =>
    canHover ? { onMouseEnter: () => setHovered(i) } : {};

  const figureFor = (i: number) => {
    if (i === 0) return <LatencyAnatomy />;
    if (i === 1) return <SeedDeterminism />;
    if (i === 2) return <StepDelta />;
    return <GuidanceDeltas />;
  };

  return (
    <section
      id="teardown-findings"
      aria-labelledby="teardown-findings-heading"
      style={
        {
          "--hero-hair": "color-mix(in srgb, var(--ink) 14%, transparent)",
          "--hero-slate": "#4E5B54",
          "--frame-dim": "color-mix(in srgb, var(--ink) 40%, transparent)",
        } as React.CSSProperties
      }
      className="scroll-mt-8 bg-paper px-5 pb-12 sm:pl-10 sm:pr-8 xl:pl-[132px]"
    >
      {/* Explicit placement, not order, so one h2 sits above the frame on
          one column and beside it on two. */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <h2
          id="teardown-findings-heading"
          className="pb-8 pt-10 font-serif text-5xl font-semibold uppercase leading-[0.92] tracking-tight text-ink lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:pr-[38px]"
        >
          Findings
        </h2>

        {/* The vertical rule, drawn by its own item so it still runs the
            full height of the section while the frame below aligns to
            row 2 only. Grid items placed explicitly are allowed to
            share cells. */}
        <div
          aria-hidden="true"
          className="hidden lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:block lg:border-l lg:border-[color:var(--hero-hair)]"
        />

        {/* FRAME. Desktop only: on touch there is no way to change it, so
            it is not shipped at all and the figures go inline instead.
            Sitting in row 2 puts its top and bottom edges exactly on the
            left column's first and last hairlines. No sticky: the whole
            section fits one viewport at every size measured, so sticky
            had nothing to do. The caption is absolute at top-full so it
            hangs below the frame without lengthening the row and
            dragging the frame's bottom edge off the hairline. */}
        <div className="relative hidden lg:col-span-6 lg:col-start-7 lg:row-start-2 lg:block">
          <div
            className="absolute inset-y-0 left-[38px] right-0 border border-[color:var(--hero-hair)] p-6"
            style={{
              background: "color-mix(in srgb, var(--ink) 4%, transparent)",
            }}
          >
            <div className="relative h-full w-full">
              {FINDINGS.map((f, i) => (
                <Panel key={f.n} active={shown === i}>
                  {figureFor(i)}
                </Panel>
              ))}
            </div>
          </div>
          <p className="finding-caption absolute left-[38px] top-full mt-3 font-mono text-[8px] uppercase tracking-[0.12em] text-[color:var(--hero-slate)]">
            {FINDINGS[shown].caption}
          </p>
        </div>

        {/* ROWS */}
        <div className="lg:col-span-6 lg:col-start-1 lg:row-start-2 lg:pr-[38px]">
          <ul onMouseLeave={canHover ? () => setHovered(null) : undefined}>
            {FINDINGS.map((f, i) => {
              const isOn = canHover && hovered === i;
              const dim = canHover && hovered !== null && hovered !== i;
              return (
                <li
                  key={f.n}
                  className="finding-row border-t border-[color:var(--hero-hair)] px-3 py-6"
                  style={{
                    opacity: dim ? 0.5 : 1,
                    background: isOn
                      ? "color-mix(in srgb, var(--ink) 5%, transparent)"
                      : "transparent",
                  }}
                  {...bind(i)}
                >
                  <div className="flex items-baseline gap-5">
                    <span className="w-8 shrink-0 font-serif text-[34px] leading-none text-ink">
                      {f.n}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-serif text-base uppercase tracking-[0.04em] text-bronze-text">
                        {f.title}
                      </span>
                      <span className="mt-2 block font-serif text-sm leading-[1.6] text-[color:var(--hero-slate)]">
                        {f.body}
                      </span>
                    </span>
                  </div>

                  {/* Touch path: the figure lives under its own row, full
                      width. Hidden on desktop, where the frame has it. */}
                  <div className="mt-5 lg:hidden">
                    <div
                      className="border border-[color:var(--hero-hair)] px-2 py-3"
                      style={{
                        background:
                          "color-mix(in srgb, var(--ink) 4%, transparent)",
                      }}
                    >
                      {figureFor(i)}
                    </div>
                    <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[color:var(--hero-slate)]">
                      {f.caption}
                    </p>
                  </div>
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
