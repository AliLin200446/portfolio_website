"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { STATIONS, berthOf, HOME_BERTH } from "@/lib/bench";
import { useBenchStore } from "@/lib/benchStore";
import BenchHome, { useBench3d } from "./BenchHome";
import BenchLoader from "./BenchLoader";

const plateBase =
  "fixed bottom-16 left-6 z-10 font-mono text-xs text-muted";
const plateBtn =
  "mt-2 cursor-pointer select-none border-b border-bronze pb-px outline-none transition-colors hover:text-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]";

/** B2 companion piece: the luma sparkline. Display, not a control. */
function LumaSparkline() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const hist = useRef<number[]>([]);
  const luma = useBenchStore((s) => s.b2Luma);

  useEffect(() => {
    hist.current.push(luma);
    if (hist.current.length > 60) hist.current.shift();
    const c = canvas.current;
    if (!c) return;
    const g = c.getContext("2d")!;
    g.clearRect(0, 0, 60, 12);
    g.strokeStyle = "#1a1714";
    g.lineWidth = 1;
    g.beginPath();
    hist.current.forEach((v, i) => {
      const x = i + 0.5;
      const y = 11 - v * 10;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    });
    g.stroke();
  }, [luma]);

  return (
    <div className="mt-2 flex items-center gap-2">
      <canvas ref={canvas} width={60} height={12} aria-hidden />
      <span style={{ fontSize: 9 }} className="text-muted">
        driven by video luminance
      </span>
    </div>
  );
}

function ResonanceNameplate() {
  const berth = useBenchStore((s) => s.berth);
  const strike = useBenchStore((s) => s.b2Strike);
  if (berth !== berthOf("resonance")) return null;
  return (
    <div className={plateBase}>
      <p>
        <span className="text-ink">RESONANCE</span> — physics for AI video ·{" "}
        <a
          href="https://resonance.alilinlab.com"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-bronze"
        >
          live → resonance.alilinlab.com
        </a>
      </p>
      <button type="button" onClick={strike} className={plateBtn}>
        敲击 · ENTER
      </button>
      <LumaSparkline />
    </div>
  );
}

function SilkNameplate() {
  const berth = useBenchStore((s) => s.berth);
  const pull = useBenchStore((s) => s.b3Pull);
  if (berth !== berthOf("skeletal-silk")) return null;
  return (
    <div className={plateBase}>
      <p>
        <span className="text-ink">SKELETAL SILK</span> — AI as material
        interpreter ·{" "}
        <a
          href="https://skeletal-silk.alilinlab.com"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-bronze"
        >
          skeletal-silk.alilinlab.com
        </a>
      </p>
      <button type="button" onClick={pull} className={plateBtn}>
        轻推 · ENTER
      </button>
    </div>
  );
}

function TeardownNameplate() {
  const berth = useBenchStore((s) => s.berth);
  if (berth !== berthOf("teardown")) return null;
  return (
    <div className={plateBase}>
      <p>
        <span className="text-ink">TEARDOWN №1</span> — an API, instrumented ·{" "}
        <a
          href="https://teardown.alilinlab.com"
          target="_blank"
          rel="noreferrer"
          className="transition-colors hover:text-bronze"
        >
          teardown.alilinlab.com
        </a>
      </p>
    </div>
  );
}

function AcubotNameplate() {
  const berth = useBenchStore((s) => s.berth);
  if (berth !== berthOf("acubot")) return null;
  return (
    <div className={plateBase}>
      <p>
        <span className="text-ink">ACUBOT</span> — a lineage, structured ·{" "}
        <span className="text-wood">136 points · 4,138 cases</span>
      </p>
    </div>
  );
}

/** B1 nameplate: keyboard path is the feed toggle (B1-REV). */
function LatentNameplate() {
  const berth = useBenchStore((s) => s.berth);
  const feed = useBenchStore((s) => s.b1Feed);
  if (berth !== berthOf("latent")) return null;

  return (
    <div className={plateBase}>
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
      <button type="button" onClick={feed} className={plateBtn}>
        喂片 · ENTER
      </button>
    </div>
  );
}

function VestigeNameplate() {
  const berth = useBenchStore((s) => s.berth);
  const stamp = useBenchStore((s) => s.b5Stamp);
  if (berth !== berthOf("vestige")) return null;

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

  return (
    <div className="min-h-svh">
      <BenchHome active={bench3d} />
      {/* instrument boot: pure HTML/CSS, first paint before Three parses */}
      {bench3d && <BenchLoader />}
      {bench3d && (
        <>
          <LatentNameplate />
          <ResonanceNameplate />
          <SilkNameplate />
          <TeardownNameplate />
          <VestigeNameplate />
          <AcubotNameplate />
        </>
      )}

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
          {STATIONS.map((s) =>
            bench3d ? (
              // 3D mode: nav is a jump menu — spring the rail to the berth.
              // Nav keeps the narrative order; space keeps its own.
              <NavJump key={s.id} station={s} />
            ) : (
              <StationLink
                key={s.id}
                station={s}
                className="text-muted transition-colors hover:text-bronze"
              >
                {s.label}
              </StationLink>
            )
          )}
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
