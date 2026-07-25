"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FORMATS, rolls, type Format, type Roll } from "@/content/photography";

/*
 * PHOTO SHEET — a contact sheet, not a gallery: rolls as groups, mono
 * headers, frame numbers, hairline separators. Thumbs stay small (the
 * photograph reads as a swatch inside the paper order); color is let
 * loose ONLY inside the loupe. Pipeline rides next/image: build-time
 * multi-size, WebP/AVIF, lazy thumbs (~300px), loupe full size
 * (≤2000px) requested ONLY on click; re-encoding strips EXIF/GPS.
 * No-JS: every frame is a plain link to its image (loupe is an
 * enhancement); filter renders everything. Keyboard: Tab→Enter opens,
 * Esc closes, ←/→ cycle within the roll. reduced-motion: no fades.
 */

export default function PhotoSheet() {
  const router = useRouter();
  const params = useSearchParams();
  const active = (params.get("format") as Format | null) ?? null;
  const [loupe, setLoupe] = useState<{ roll: Roll; i: number } | null>(null);

  const shown = active ? rolls.filter((r) => r.format === active) : rolls;
  const counts = Object.fromEntries(
    FORMATS.map((f) => [f, rolls.filter((r) => r.format === f).length])
  );

  useEffect(() => {
    if (!loupe) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLoupe(null);
      if (e.key === "ArrowRight")
        setLoupe((l) => l && { roll: l.roll, i: (l.i + 1) % l.roll.frames.length });
      if (e.key === "ArrowLeft")
        setLoupe((l) => l && { roll: l.roll, i: (l.i + l.roll.frames.length - 1) % l.roll.frames.length });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loupe]);

  if (rolls.length === 0)
    return (
      <p className="border-t border-line py-14 font-mono text-sm text-muted">
        〔回填:content/photography.ts — 一卷一组:camera · stock · format ·
        place · year + frames(片号 · src)〕
      </p>
    );

  const alt = (r: Roll, f: Roll["frames"][number]) =>
    f.note ?? `${r.camera} · ${r.stock} · ${r.place} · ${r.year}`;

  return (
    <>
      <div className="flex flex-wrap gap-x-5 border-t border-line py-4 font-mono text-xs" style={{ borderTopWidth: "0.5px" }}>
        <button type="button" onClick={() => router.replace("/photography", { scroll: false })} className={active === null ? "text-bronze" : "text-muted hover:text-ink"}>
          ALL <span className="text-[10px]">{rolls.length}</span>
        </button>
        {FORMATS.map((f) => (
          <button key={f} type="button" onClick={() => router.replace(`/photography?format=${f}`, { scroll: false })} className={`uppercase ${active === f ? "text-bronze" : "text-muted hover:text-ink"}`}>
            {f} <span className="text-[10px]">{counts[f]}</span>
          </button>
        ))}
      </div>

      {shown.map((r) => (
        <section key={r.id} className="border-t border-line py-8" style={{ borderTopWidth: "0.5px" }}>
          <h2 className="mb-4 font-mono text-xs tracking-wide text-muted">
            {r.camera} · {r.stock} · {r.place} · {r.year}
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {r.frames.map((f, i) => (
              <a
                key={f.n}
                href={f.src}
                onClick={(e) => {
                  e.preventDefault();
                  setLoupe({ roll: r, i });
                }}
                className="group relative block outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]"
              >
                <Image src={f.thumb ?? f.src} alt={alt(r, f)} width={360} height={360} sizes="(max-width: 768px) 45vw, 200px" className="aspect-square w-full object-cover" loading="lazy" />
                <span className="absolute bottom-1 right-1 font-mono text-[10px] text-paper" style={{ textShadow: "0 0 3px rgba(0,0,0,0.5)" }}>
                  {f.n}
                </span>
              </a>
            ))}
          </div>
        </section>
      ))}

      {loupe && (
        <div
          role="dialog"
          aria-modal="true"
          className="loupe fixed inset-0 z-40 flex flex-col items-center justify-center bg-paper/97 p-6"
          onClick={() => setLoupe(null)}
        >
          <div onClick={(e) => e.stopPropagation()} className="max-h-[82svh]">
            <Image
              src={loupe.roll.frames[loupe.i].src}
              alt={alt(loupe.roll, loupe.roll.frames[loupe.i])}
              width={2000}
              height={2000}
              sizes="90vw"
              className="max-h-[82svh] w-auto object-contain"
              priority
            />
          </div>
          <p className="mt-4 font-mono text-xs text-muted">
            {loupe.roll.frames[loupe.i].n} · {loupe.roll.camera} · {loupe.roll.stock} · {loupe.roll.place} · {loupe.roll.year}
            {loupe.roll.frames[loupe.i].note ? ` · ${loupe.roll.frames[loupe.i].note}` : ""}
          </p>
          <div className="mt-2 flex gap-6 font-mono text-xs">
            <button type="button" onClick={() => setLoupe((l) => l && { roll: l.roll, i: (l.i + l.roll.frames.length - 1) % l.roll.frames.length })} className="text-muted hover:text-bronze">←</button>
            <button type="button" onClick={() => setLoupe(null)} className="text-muted hover:text-bronze">ESC</button>
            <button type="button" onClick={() => setLoupe((l) => l && { roll: l.roll, i: (l.i + 1) % l.roll.frames.length })} className="text-muted hover:text-bronze">→</button>
          </div>
        </div>
      )}
      <style>{`
        .loupe { animation: plate-in 0.2s ease; }
        @media (prefers-reduced-motion: reduce) { .loupe { animation: none; } }
      `}</style>
    </>
  );
}
