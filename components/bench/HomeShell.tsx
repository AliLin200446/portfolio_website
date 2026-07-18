"use client";

import Link from "next/link";
import { STATIONS } from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";
import BenchHome, { useBench3d } from "./BenchHome";

/** B1 nameplate: DOM layer, shown at the LATENT berth. The slider is the
 *  keyboard path to the film pull; focus ring is warm light, not cinnabar. */
function LatentNameplate() {
  const berth = useBenchStore((s) => s.berth);
  const strength = useBenchStore((s) => s.b1Strength);
  const setStrength = useBenchStore((s) => s.setB1Strength);
  if (berth !== 0) return null;

  return (
    <div className="fixed bottom-16 left-6 z-10 font-mono text-xs text-muted">
      <p>
        <span className="text-ink">LATENT</span> — film physics engine ·{" "}
        <span className="text-wood">shipped July 2026</span> ·{" "}
        <a
          href="https://latentfilm.com"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-bronze"
        >
          latentfilm.com
        </a>
      </p>
      <div
        role="slider"
        tabIndex={0}
        aria-label="engineStrength — pull the film leader"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={strength}
        className="mt-2 inline-block cursor-ew-resize select-none outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]"
        onKeyDown={(e) => {
          const step = e.shiftKey ? 10 : 2;
          if (e.key === "ArrowLeft") { setStrength(strength - step); e.preventDefault(); }
          if (e.key === "ArrowRight") { setStrength(strength + step); e.preventDefault(); }
          if (e.key === "Home") { setStrength(0); e.preventDefault(); }
          if (e.key === "End") { setStrength(100); e.preventDefault(); }
        }}
      >
        STRENGTH {String(strength).padStart(3, "0")}
        <span className="text-bronze"> ·</span> ←→
      </div>
    </div>
  );
}

/*
 * THE BENCH homepage shell. All navigation is plain DOM (server-rendered
 * initial HTML), the 3D canvas is an enhancement layered underneath.
 */

function StationLink({
  station,
  className,
  children,
}: {
  station: (typeof STATIONS)[number];
  className?: string;
  children: React.ReactNode;
}) {
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

/** B5 nameplate: the keyboard path to the seal (Enter = stamp). */
function VestigeNameplate() {
  const berth = useBenchStore((s) => s.berth);
  const stamp = useBenchStore((s) => s.b5Stamp);
  if (berth !== 4) return null;

  return (
    <div className="fixed bottom-16 left-6 z-10 font-mono text-xs text-muted">
      <p>
        <span className="text-ink">VESTIGE</span> — provenance for physical
        goods · <span className="text-wood">2 provisional patents</span>
      </p>
      <button
        type="button"
        onClick={stamp}
        className="mt-2 cursor-pointer select-none border-b border-bronze pb-px outline-none transition-colors hover:text-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]"
      >
        落印 · ENTER
      </button>
    </div>
  );
}

export default function HomeShell() {
  const bench3d = useBench3d();

  return (
    <div className="min-h-svh">
      <BenchHome active={bench3d} />
      {bench3d && <LatentNameplate />}
      {bench3d && <VestigeNameplate />}

      {/* top bar: identity + full text navigation, always reachable */}
      <header className="relative z-10 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-line bg-paper/85 px-6 py-4">
        <p className="font-mono text-xs">
          <span className="text-ink">ALI LIN</span>
          <span className="text-muted">
            {" — design engineer · I instrument what AI fakes"}
          </span>
        </p>
        <nav
          aria-label="Projects"
          className="flex flex-wrap gap-x-5 gap-y-1 font-mono text-xs"
        >
          {STATIONS.map((s) => (
            <StationLink
              key={s.id}
              station={s}
              className="text-muted transition-colors hover:text-bronze"
            >
              {s.label}
            </StationLink>
          ))}
          <Link
            href="/about"
            className="text-muted transition-colors hover:text-bronze"
          >
            ABOUT
          </Link>
        </nav>
      </header>

      {/* DOM list: SSR fallback and the whole story on mobile/coarse/
          reduced-motion/no-JS. Hidden only once the 3D bench mounts. */}
      {!bench3d && (
        <section className="relative z-10 mx-auto max-w-3xl px-6 py-12">
          <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-bronze">
            Stations
          </h2>
          <ol className="border-t border-line">
            {STATIONS.map((s, i) => (
              <li key={s.id} className="border-b border-line">
                <StationLink
                  station={s}
                  className="group grid gap-1 py-5"
                >
                  <span className="font-mono text-xs text-bronze">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-2xl decoration-oxblood decoration-1 underline-offset-4 group-hover:underline">
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
          {/* TODO: drop resume.pdf into public/ */}
          <a
            href="/resume.pdf"
            className="transition-colors hover:text-bronze"
          >
            resume PDF
          </a>
        </nav>
      </footer>
    </div>
  );
}
