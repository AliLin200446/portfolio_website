"use client";

import { useProgress } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { useBenchStore } from "@/lib/benchStore";

/*
 * LOADER — instrument boot, not loading theater.
 * Honest readout: the shown value only ever chases the REAL target
 * (runtime chunk → webgl context → assets via the shared drei manager →
 * compileAsync) and never runs ahead of it. If reality plateaus, the
 * bar stops. That stop is the point.
 * Pure HTML/CSS overlay, zero images, zero new deps; the number lerps
 * via direct DOM writes (no per-frame React), the bar moves on
 * transform: scaleX. Copper fill, no cinnabar (the seal owns it),
 * 0.5px borders, no radius. One #FFB46B flash at 100, then the bench
 * develops through a paper-on-paper crossfade.
 */

const LERP = 0.1;

function cleanLabel(url: string) {
  const base = url.split("/").pop() ?? url;
  return base.split(".")[0].replace(/[-_]/g, " ").toLowerCase() || "assets";
}

export default function BenchLoader() {
  const bootTarget = useBenchStore((s) => s.bootTarget);
  const bootLabel = useBenchStore((s) => s.bootLabel);
  const { active, progress, item } = useProgress();

  const [phase, setPhase] = useState<"boot" | "fade" | "gone">("boot");

  // CASE-NAV §3: within a session that already reached the reading
  // pose, ANY return to the home page skips the boot theater — the
  // runtime is cached, honesty means not replaying a load that isn't
  // happening. First visits keep the full honest readout.
  useEffect(() => {
    if (sessionStorage.getItem("bench-carousel-arrived") === "1")
      setPhase("gone");
  }, []);
  const shown = useRef(0);
  const numRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const reduced = useRef(false);

  // real target: milestones, with any genuine assets mapped into 60–90
  const target = Math.max(bootTarget, active ? 60 + progress * 0.3 : 0);
  const label = active && item ? cleanLabel(item) : bootLabel;

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
        <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#6b6459" }}>
          BENCH · booting
        </div>
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
