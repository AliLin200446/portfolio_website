"use client";

import { useEffect, useRef, useState } from "react";
import type { Exhibit } from "@/lib/labfolio";
import { SectionNo } from "./FolioChrome";

/*
 * EXHIBIT FLOW (§2, the core) — split-screen scrollytelling: left
 * column scrolls the notebook text, right column is a sticky exhibit
 * panel that answers whichever EXHIBIT the reader has reached
 * (IntersectionObserver on a center band; crossfade is a CSS
 * transition fired by that state change — scroll-driven, so the moment
 * the reader stops, nothing moves: zero rAF idling, §5).
 *
 * Accessibility is structural, not bolted on (§6): the split screen is
 * an ENHANCEMENT layer. Inline visuals live in the left flow and the
 * sticky panel is hidden unless the wrapper carries `js-scrolly` —
 * added only after the client mounts on a wide, motion-tolerant
 * viewport. No JS / reduced-motion / <768px therefore fall back to one
 * linear column (text, then its exhibit) with zero content loss.
 *
 * The right panel never runs WebGL (§6 red line): placeholders are
 * labeled empty frames awaiting the author's evidence pack; the live
 * comparator is a pure SVG halation instrument — its radius follows
 * the scroll through EXHIBIT 03 and yields to the reader's slider.
 *
 * 朱 budget (§3): the ACTIVE exhibit number is the page's single
 * oxblood instance — one at a time, by construction.
 */

function HalationSvg({ id, r }: { id: string; r: number }) {
  // procedural night test pattern: point highlights over film base;
  // halation = gaussian blur of the highlights behind themselves
  return (
    <svg viewBox="0 0 480 300" className="w-full" aria-label="halation comparator">
      <defs>
        <filter id={`halo-${id}`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={r} />
        </filter>
      </defs>
      <rect width="480" height="300" fill="#14100d" />
      <g filter={`url(#halo-${id})`} fill="#FF8C46" opacity="0.8">
        <circle cx="120" cy="90" r="7" />
        <circle cx="300" cy="150" r="10" />
        <circle cx="390" cy="70" r="5" />
        <circle cx="200" cy="230" r="6" />
      </g>
      <g fill="#FFE9D2">
        <circle cx="120" cy="90" r="4" />
        <circle cx="300" cy="150" r="6" />
        <circle cx="390" cy="70" r="3" />
        <circle cx="200" cy="230" r="3.5" />
      </g>
    </svg>
  );
}

function Instrument({ idSuffix }: { idSuffix: string }) {
  const [t, setT] = useState(0.35);
  return (
    <div>
      <HalationSvg id={idSuffix} r={t * 14} />
      <div className="mt-3 flex items-center gap-4 font-mono text-xs">
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(t * 100)}
          onChange={(e) => setT(Number(e.target.value) / 100)}
          aria-label="halation radius"
          className="h-px w-40 cursor-pointer appearance-none bg-line accent-[#8C6A3F]"
          data-instrument-slider={idSuffix}
        />
        <span data-instrument-readout={idSuffix} className="text-muted">
          halation radius · {Math.round(t * 24)} px
        </span>
      </div>
    </div>
  );
}

function Visual({ ex, idSuffix }: { ex: Exhibit; idSuffix: string }) {
  return (
    <figure>
      {ex.visual === "instrument" ? (
        <Instrument idSuffix={idSuffix} />
      ) : (
        <div className="relative flex aspect-[16/10] items-center justify-center border border-line bg-[#EDE9E0]">
          <span className="px-6 text-center font-mono text-[10px] tracking-wide text-muted">
            {ex.placeholderLabel}
          </span>
        </div>
      )}
      <figcaption className="mt-3 font-mono text-[10px] leading-relaxed tracking-wide text-muted">
        EXHIBIT {ex.no} · {ex.caption}
      </figcaption>
    </figure>
  );
}

export default function ExhibitFlow({ exhibits }: { exhibits: Exhibit[] }) {
  const wrap = useRef<HTMLDivElement>(null);
  const blocks = useRef<(HTMLDivElement | null)[]>([]);
  const [enhanced, setEnhanced] = useState(false);
  const [active, setActive] = useState(0);

  // enhancement gate: wide viewport + motion tolerance + JS present
  useEffect(() => {
    const ok = window.matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)"
    );
    const update = () => setEnhanced(ok.matches);
    update();
    ok.addEventListener("change", update);
    return () => ok.removeEventListener("change", update);
  }, []);

  // which EXHIBIT owns the center band owns the sticky panel
  useEffect(() => {
    if (!enhanced) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting)
            setActive(Number((e.target as HTMLElement).dataset.exhibit));
      },
      { rootMargin: "-40% 0px -45% 0px" }
    );
    blocks.current.forEach((b) => b && io.observe(b));
    return () => io.disconnect();
  }, [enhanced]);

  // EXHIBIT 03: the comparator follows the scroll (direct DOM writes,
  // passive listener — stops the instant the scroll stops)
  useEffect(() => {
    if (!enhanced) return;
    const idx = exhibits.findIndex((e) => e.visual === "instrument");
    if (idx < 0) return;
    let userHold = 0;
    let synthetic = false;
    const onInput = () => {
      if (synthetic) return;
      userHold = Date.now(); // the reader's hand wins for a while
    };
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;
    const onScroll = () => {
      if (Date.now() - userHold < 4000) return;
      const el = blocks.current[idx];
      if (!el) return;
      const r = el.getBoundingClientRect();
      const p = Math.max(
        0,
        Math.min(1, (window.innerHeight * 0.75 - r.top) / (r.height || 1))
      );
      const slider = document.querySelector<HTMLInputElement>(
        '[data-instrument-slider="sticky"]'
      );
      if (slider && setter) {
        const v = Math.round(p * 100);
        if (Number(slider.value) !== v) {
          // controlled input: go through the native setter so React's
          // root input listener picks the change up as the new state
          synthetic = true;
          setter.call(slider, String(v));
          slider.dispatchEvent(new Event("input", { bubbles: true }));
          synthetic = false;
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("input", onInput, true);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("input", onInput, true);
    };
  }, [enhanced, exhibits]);

  return (
    <div
      ref={wrap}
      className={enhanced ? "js-scrolly" : undefined}
      data-exhibit-flow
    >
      <div className={enhanced ? "grid grid-cols-2 gap-16" : undefined}>
        {/* left: the scrolling notebook flow (with margin notes) */}
        <div>
          {exhibits.map((ex, i) => (
            <div
              key={ex.no}
              data-exhibit={i}
              ref={(el) => {
                blocks.current[i] = el;
              }}
              className={enhanced ? "min-h-[80svh] py-16" : "py-12"}
            >
              <p className="font-mono text-xs uppercase tracking-widest">
                <span className={enhanced && active === i ? "text-oxblood" : "text-bronze"}>
                  EXHIBIT {ex.no}
                </span>
                <span className="text-muted"> · {ex.heading}</span>
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,60ch)_9rem]">
                <div>
                  {ex.paras.map((p) => (
                    <p key={p} className="mb-5 max-w-[60ch] font-serif text-[17px] leading-7">
                      {p}
                    </p>
                  ))}
                </div>
                {/* right-edge margin note: the author's real aside */}
                {ex.note && (
                  <aside className="border-l border-line pl-4 font-serif text-sm italic leading-6 text-muted">
                    {ex.note}
                  </aside>
                )}
              </div>
              {/* inline visual: THE content on mobile / no-JS / reduced;
                  hidden only when the sticky panel took over */}
              {!enhanced && (
                <div className="mt-8">
                  <Visual ex={ex} idSuffix={`inline-${i}`} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* right: the sticky exhibit panel (enhancement layer only) */}
        {enhanced && (
          <div>
            <div className="sticky top-0 flex h-svh items-center">
              <div className="relative w-full">
                {exhibits.map((ex, i) => (
                  <div
                    key={ex.no}
                    className="col-start-1 row-start-1"
                    style={{
                      position: i === 0 ? "relative" : "absolute",
                      inset: i === 0 ? undefined : 0,
                      opacity: active === i ? 1 : 0,
                      transition: "opacity 0.35s ease-out",
                      pointerEvents: active === i ? "auto" : "none",
                    }}
                    aria-hidden={active !== i}
                  >
                    <Visual
                      ex={ex}
                      idSuffix={ex.visual === "instrument" ? "sticky" : `s-${i}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
