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
    caption: "no figure for this finding · source lines shown",
  },
];

/* Read verbatim from
   https://teardown.alilinlab.com/evidence/_tools/adjacent-diffs.txt
   Columns on line 1 of that file are: pair, over32Pct, meanAbsDelta. */
const RAW_LINES: [string, string][] = [
  ["14", "G3.5→G5 17.167% 10.84"],
  ["18", "G15→G20 57.591% 33.36"],
];

/* One panel per finding, stacked. The frame is 560x200, the tallest of
   the three instrument viewBoxes; the two 560x190 figures centre inside
   it and letterbox by 5 percent of the frame height. */
function Panel({
  active,
  top = false,
  children,
}: {
  active: boolean;
  top?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      aria-hidden={!active}
      className={`finding-panel absolute inset-0 flex justify-center ${
        top ? "items-start" : "items-center"
      }`}
      style={{ opacity: active ? 1 : 0, pointerEvents: active ? "auto" : "none" }}
    >
      {children}
    </div>
  );
}

function RawEvidence() {
  return (
    <div className="w-full px-4">
      <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-bronze-text">
        _tools/adjacent-diffs.txt:14, 18
      </p>
      <div className="mt-3">
        {RAW_LINES.map(([ln, text]) => (
          <p key={ln} className="font-mono text-[11px] leading-[1.9] text-ink">
            <span className="mr-3 text-[color:var(--frame-dim)]">{ln}</span>
            {text}
          </p>
        ))}
      </div>
    </div>
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
    return <RawEvidence />;
  };

  return (
    <section
      aria-labelledby="teardown-findings"
      style={
        {
          "--hero-hair": "color-mix(in srgb, var(--ink) 14%, transparent)",
          "--hero-slate": "#4E5B54",
          "--frame-dim": "color-mix(in srgb, var(--ink) 40%, transparent)",
        } as React.CSSProperties
      }
      className="bg-paper px-5 pb-12 sm:pl-10 sm:pr-8 xl:pl-[132px]"
    >
      {/* Explicit placement, not order, so one h2 sits above the frame on
          one column and beside it on two. */}
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <h2
          id="teardown-findings"
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
                <Panel key={f.n} active={shown === i} top={i === 3}>
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
