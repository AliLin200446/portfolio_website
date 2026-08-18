"use client";

import { useEffect, useRef, useState } from "react";
import { useBenchStore } from "@/lib/benchStore";

/*
 * BUNDLE RULE, and it is not a style preference:
 *
 *   Nothing from three, fiber or drei at module scope in any eagerly
 *   imported file. One static import defeats the dynamic one. This
 *   cost 100 kB gz on the home page until 2026-08.
 *
 * The mechanism: Rail is loaded with dynamic(ssr:false) so the 3D
 * module stays out of the first paint. This file is NOT dynamic, and
 * it sat one `import { useProgress } from "@react-three/drei"` away
 * from the whole three dependency tree. That single line pulled the
 * 383 kB three chunk into the home route's First Load, where it
 * blocked the first paint of a page whose first paint is deliberately
 * plain DOM. The dynamic import had been correct the whole time and
 * was doing nothing.
 *
 * Worse, the import bought nothing. useProgress reports on
 * THREE.DefaultLoadingManager, which only speaks when a THREE Loader
 * runs. Every instrument here is procedural geometry: no useLoader, no
 * useTexture, no useGLTF, no drei component that fetches. `active` was
 * therefore always false, so the branch it fed always took the same
 * arm. Deleting it changes what the loader displays in exactly zero
 * cases. If an instrument ever does load a real asset, feed it through
 * setBoot from inside Rail, which is already dynamic. Do not import
 * drei here to get it back.
 *
 * LOADER — instrument boot, not loading theater.
 * Honest readout: the shown value only ever chases the REAL target
 * (runtime chunk → webgl context → shader compile) and never runs
 * ahead of it. If reality plateaus, the bar stops. That stop is the
 * point.
 * Pure HTML/CSS overlay, zero images, zero new deps; the number lerps
 * via direct DOM writes (no per-frame React), the bar moves on
 * transform: scaleX. Copper fill, no cinnabar (the seal owns it),
 * 0.5px borders, no radius. One #FFB46B flash at 100, then the bench
 * develops through a paper-on-paper crossfade.
 */

const LERP = 0.1;
/** Set by the rail once the scene is compiled. The string is shared
 *  with Rail.tsx by value, not by import: this overlay is deliberately
 *  plain DOM and must not pull the 3D module into the first paint. */
const READY_KEY = "bench-ready";

export default function BenchLoader() {
  const bootTarget = useBenchStore((s) => s.bootTarget);
  const bootLabel = useBenchStore((s) => s.bootLabel);

  const [phase, setPhase] = useState<"boot" | "fade" | "gone">("boot");

  // CASE-NAV §3: within a session that already booted once, ANY return
  // to the home page skips the boot theater. The runtime is cached, and
  // honesty means not replaying a load that is not happening. First
  // visits keep the full honest readout.
  //
  // The rail writes this key when boot reaches 100. It used to be
  // written by the turntable's overhead-to-reading descent, which the
  // rail does not have, so for a while nothing wrote it at all and the
  // loader replayed on every trip back from a case page.
  useEffect(() => {
    if (sessionStorage.getItem(READY_KEY) === "1") setPhase("gone");
  }, []);
  const shown = useRef(0);
  const numRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);

  // real target: the milestones, and nothing else. bootTarget is
  // monotonic and never negative, so this is what the old
  // Math.max(bootTarget, active ? … : 0) evaluated to on every frame
  // this page has ever rendered.
  const target = bootTarget;
  const label = bootLabel;

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  useEffect(() => {
    if (phase !== "boot") return;
    let raf = 0;
    const tick = () => {
      const t = target;
      if (reduced.current) {
        // discrete honest steps, no sweep
        shown.current = t;
      } else {
        shown.current += (t - shown.current) * LERP;
        // arrived is arrived: snap the asymptotic tail, never overshoot
        if (t - shown.current < 0.4) shown.current = t;
      }
      const v = Math.floor(shown.current);
      if (numRef.current) numRef.current.textContent = String(v);
      if (barRef.current)
        barRef.current.style.transform = `scaleX(${shown.current / 100})`;
      if (shown.current >= 99.95 && t >= 100) {
        setPhase(reduced.current ? "gone" : "fade");
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, phase]);

  useEffect(() => {
    if (phase !== "fade") return;
    // content fades 1.2s (the shared numeric-readout convention), then
    // the sheet dissolves — paper onto paper, seamless
    const id = setTimeout(() => setPhase("gone"), 1750);
    return () => clearTimeout(id);
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      aria-hidden
      className="fixed inset-0 z-[5] flex items-center justify-center"
      style={{
        background: "#F5F2EC",
        opacity: phase === "fade" ? 0 : 1,
        transition: phase === "fade" ? "opacity 0.55s ease 1.2s" : undefined,
        pointerEvents: phase === "fade" ? "none" : "auto",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          color: "#1A1A1A",
          textAlign: "left",
          opacity: phase === "fade" ? 0 : 1,
          transition: phase === "fade" ? "opacity 1.2s ease" : undefined,
        }}
      >
        <div style={{ fontSize: 64, lineHeight: 1.2, fontVariantNumeric: "tabular-nums" }}>
          <span ref={numRef}>0</span>
        </div>
        <div
          style={{
            width: 280,
            border: "0.5px solid rgba(26,26,26,0.25)",
            height: 3,
            marginTop: 10,
            boxShadow: phase === "fade" ? "0 0 8px 1px #FFB46B" : "none",
            transition: "box-shadow 0.15s ease",
          }}
        >
          <div
            ref={barRef}
            style={{
              height: "100%",
              background: "#8C6A3F",
              transform: "scaleX(0)",
              transformOrigin: "left",
            }}
          />
        </div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: "0.14em",
            color: "#6b6459",
            marginTop: 10,
            minHeight: 14,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}
