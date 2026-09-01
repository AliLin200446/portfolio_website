"use client";

import { useEffect, useState } from "react";

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
};

const FINDINGS: Finding[] = [
  {
    n: 1,
    title: "The Hidden Segment",
    // content/cases/teardown.ts:105 -> e4-latency/stats.md:11-13, 20-22
    body: "Queue sd 277 ms against inference sd 9.9. The segment carrying nearly all the variance is the one the response body never returns.",
  },
  {
    n: 2,
    title: "Identical Bytes",
    // content/cases/teardown.ts:119 -> e3-seed/report.txt
    body: "Three runs, three different inference times, one sha256, zero of 262,144 pixels different. Determinism holds and the documentation never says so.",
  },
  {
    n: 3,
    title: "Past 28",
    // _tools/adjacent-diffs.txt:8-9
    body: "S20 to S28 moves 7.655 percent of pixels. The next eight steps move 1.488.",
  },
  {
    n: 4,
    title: "No Resting Point",
    // _tools/adjacent-diffs.txt:14, 18
    body: "No adjacent guidance pair falls below 17.167 percent, and the last rung still moves 57.591. It never converges.",
  },
];



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


  const bind = (i: number) =>
    canHover ? { onMouseEnter: () => setHovered(i) } : {};


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
      <div>
        <h2
          id="teardown-findings-heading"
          className="pb-8 pt-10 font-serif text-[length:var(--text-display)] font-semibold uppercase leading-[0.92] tracking-tight text-ink"
        >
          Findings
        </h2>



        {/* ROWS */}
        <div className="max-w-[68ch]">
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
                    <span className="w-8 shrink-0 font-serif text-[length:var(--text-title)] leading-none text-ink">
                      {f.n}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-serif text-[length:var(--text-body)] uppercase tracking-[0.04em] text-bronze-text">
                        {f.title}
                      </span>
                      <span className="mt-2 block font-serif text-[length:var(--text-body)] leading-[1.6] text-[color:var(--hero-slate)]">
                        {f.body}
                      </span>
                    </span>
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
