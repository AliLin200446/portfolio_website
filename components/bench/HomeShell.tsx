"use client";

import Link from "next/link";
import { BERTH_ORDER, STATIONS } from "@/lib/bench";
import BenchHome, { useBench3d } from "./BenchHome";
import BenchLoader from "./BenchLoader";
import dynamic from "next/dynamic";
import { useState } from "react";

/* One instrument, mounted only on the phone path, dynamic so the
 * desktop bundle never carries it. */
const MobileBench = dynamic(() => import("./MobileBench"), {
  ssr: false,
  loading: () => <div className="aspect-square w-full border border-line bg-[#EDE9E0]" />,
});

function StationLink({
  station,
  className,
  children,
}: {
  station: (typeof STATIONS)[number];
  className?: string;
  children: React.ReactNode;
}) {
  if (!station.href) {
    // no destination yet (ACUBOT): plain label, still readable in the nav
    return <span className={className}>{children}</span>;
  }
  if (station.external) {
    return (
      <a
        href={station.href}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={station.href} className={className}>
      {children}
    </Link>
  );
}

/* One source for both layout paths. Two copies of a sentence is how
 * the hero and its case page drifted apart; see
 * scripts/check-hero-drift.mjs. */
const POSITIONING =
  "I build tools for generative systems and measure where they fail.";
const STACK = "WebGL2 / GLSL \u00b7 Three.js \u00b7 React / Next.js \u00b7 TypeScript";

export default function HomeShell() {
  const bench3d = useBench3d();
  // which instrument the phone is showing. The list is the control,
  // so the canvas needs no pointer handling of its own.
  const [shown, setShown] = useState<string>(BERTH_ORDER[0]);
  // the phone reads the same sequence the rail walks, so the two are
  // never telling a visitor a different story about what comes first
  const ordered = BERTH_ORDER.map(
    (id) => STATIONS.find((s) => s.id === id)!
  );

  return (
    <div className="min-h-svh">
      <BenchHome active={bench3d} />
      {/* instrument boot: pure HTML/CSS, first paint before Three parses */}
      {bench3d && <BenchLoader />}

      {/* WHO THIS IS. The home page carried 51 words and not one of them
          said what the person who made it does; a visitor had to infer
          it from three instrument descriptions. It sits above the rail
          on both paths because it is the sentence everything below is
          evidence for.

          Rendered twice rather than once, because the two paths lay out
          differently and a single element cannot be both: the rail is a
          fixed inset-0 canvas, so its copy has to be fixed too, while
          the DOM list is ordinary flow. The strings live in one place
          above so the two can never drift, which is the same fault the
          hero drift guard exists for. */}
      {bench3d ? (
        <div className="pointer-events-none fixed inset-x-0 top-[4.5rem] z-10 px-5 sm:px-10">
          <div className="mx-auto w-1/2">
            <p className="font-serif text-[length:var(--text-lead)] leading-snug text-ink">
              {POSITIONING}
            </p>
            <p className="mt-2 font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-[0.12em] text-muted">
              {STACK}
            </p>
          </div>
        </div>
      ) : null}

      {/* DOM list: SSR fallback and the whole story on mobile/coarse/
          reduced-motion/no-JS. Hidden only once the 3D bench mounts. */}
      {/* The pt on the section clears the fixed site bar. globals.css
          zeroes the body's 3.25rem on the index because the desktop
          scene is a fixed inset-0 canvas that wants the whole viewport,
          but THIS path is ordinary flowed content and inherits that
          zero, so it has to put the clearance back itself.

          6.5rem rather than 3.25rem because the bar wraps: one row at
          49px on a wide screen, two rows at 83px by 390, which is where
          this path is the only one that renders. The body rule was
          written for the one-row case. At 48px the first line sat 35px
          underneath the bar, and that was true before there was any
          text here to hide it with: the instrument frame's top edge was
          already under it, which is quiet enough to miss. */}
      {!bench3d && (
        <section className="relative z-10 mx-auto max-w-3xl px-6 pb-12 pt-[6.5rem]">
          {/* the bench, reduced to one turning object. Tapping a
              station below swaps it rather than opening a second
              context. */}
          <p className="font-serif text-[length:var(--text-lead)] leading-snug text-ink">
            {POSITIONING}
          </p>
          <p className="mb-8 mt-2 font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-[0.12em] text-muted">
            {STACK}
          </p>
          <div className="mb-8">
            <MobileBench slug={shown} />
          </div>
          <h2 className="mb-6 font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-widest text-bronze">
            Stations
          </h2>
          <ol className="border-t border-line">
            {ordered.map((s, i) => (
              <li
                key={s.id}
                className={`border-b border-line transition-opacity ${
                  shown === s.id ? "" : "opacity-60"
                }`}
                onPointerEnter={() => setShown(s.id)}
                onFocusCapture={() => setShown(s.id)}
              >
                <StationLink
                  station={s}
                  className="group grid gap-1 py-5"
                >
                  <span className="font-mono font-medium text-[length:var(--text-meta)] text-bronze">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-[length:var(--text-lead)] decoration-bronze decoration-1 underline-offset-4 group-hover:underline">
                    {s.label}
                  </span>
                  {s.blurb && (
                    <span className="text-[length:var(--text-body)] leading-snug text-muted">
                      {s.blurb}
                    </span>
                  )}
                  {s.external && (
                    <span className="font-mono font-medium text-[length:var(--text-meta)] text-muted">
                      teardown.alilinlab.com →
                    </span>
                  )}
                </StationLink>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* bottom bar */}
      <footer
        className={`${
          bench3d ? "fixed inset-x-0 bottom-0" : "relative"
        } z-10 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-line bg-paper/85 px-6 py-4 font-mono font-medium text-[length:var(--text-meta)] text-muted`}
      >
        <span>New York</span>
        <nav aria-label="Contact" className="flex flex-wrap gap-x-5 gap-y-1">
          <a
            href="mailto:alilin406@outlook.com"
            className="transition-colors hover:text-bronze"
          >
            alilin406@outlook.com
          </a>
          <a
            href="https://x.com/alilinlab"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-bronze"
          >
            X
          </a>
          <a
            href="https://github.com/AliLin200446"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-bronze"
          >
            GitHub
          </a>
        </nav>
      </footer>
    </div>
  );
}
