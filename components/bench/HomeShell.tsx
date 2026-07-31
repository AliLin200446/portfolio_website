"use client";

import Link from "next/link";
import { STATIONS, berthOf } from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";
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

/** Nav entry in 3D mode: click springs the rail to the station's berth.
 *  Current berth carries a copper marker — never cinnabar. */
function NavJump({ station }: { station: (typeof STATIONS)[number] }) {
  const berth = useBenchStore((s) => s.berth);
  const setBerth = useBenchStore((s) => s.setBerth);
  const mine = berthOf(station.id);
  const current = berth === mine;
  return (
    <button
      type="button"
      onClick={() => setBerth(mine)}
      aria-current={current ? "true" : undefined}
      className={`transition-colors hover:text-bronze ${
        current
          ? "border-b border-bronze text-ink"
          : "text-muted"
      }`}
    >
      {station.label}
    </button>
  );
}

export default function HomeShell() {
  const bench3d = useBench3d();
  // which instrument the phone is showing. The list is the control,
  // so the canvas needs no pointer handling of its own.
  const [shown, setShown] = useState("latent");

  return (
    <div className="min-h-svh">
      <BenchHome active={bench3d} />
      {/* instrument boot: pure HTML/CSS, first paint before Three parses */}
      {bench3d && <BenchLoader />}

      {/* DOM list: SSR fallback and the whole story on mobile/coarse/
          reduced-motion/no-JS. Hidden only once the 3D bench mounts. */}
      {!bench3d && (
        <section className="relative z-10 mx-auto max-w-3xl px-6 py-12">
          {/* the bench, reduced to one turning object. Tapping a
              station below swaps it rather than opening a second
              context. */}
          <div className="mb-8">
            <MobileBench slug={shown} />
          </div>
          <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-bronze">
            Stations
          </h2>
          <ol className="border-t border-line">
            {STATIONS.map((s, i) => (
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
                  <span className="font-mono text-xs text-bronze">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-2xl decoration-bronze decoration-1 underline-offset-4 group-hover:underline">
                    {s.label}
                  </span>
                  {s.line && (
                    <span className="text-sm text-muted">{s.line}</span>
                  )}
                  {s.external && (
                    <span className="font-mono text-xs text-muted">
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
        } z-10 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-line bg-paper/85 px-6 py-4 font-mono text-xs text-muted`}
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
