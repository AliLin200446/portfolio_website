"use client";

import { useEffect, useRef, useState } from "react";
import { fieldNotes } from "@/content/case/fieldnotes";
import { SPLIT_GRID, useSplitEnhancement } from "./ExhibitFlow";

/*
 * FIELD NOTES — six index cards. Default: the card set. Click a card and
 * the section becomes a master-detail split: left the note in full,
 * right its evidence (value · label · source file:line · N · threshold).
 * Selection-driven, not scroll-driven — but it REUSES ExhibitFlow's
 * split primitives (useSplitEnhancement gate + SPLIT_GRID shell) rather
 * than growing a second split system.
 *
 * Card form is a field card, not a UI card: 0.5px rules, paper ground,
 * a ruled line under the header, mono number and data, Newsreader
 * title. Zero shadow, zero radius. Hover gives feedback only (copper
 * border + #FFB46B glint on the number) — never a layout change, so the
 * page cannot jump under the pointer. Click enters the split; Esc or
 * clicking the same card returns. Inside the split the six numbers
 * switch cards directly (crossfade, no bounce).
 *
 * Degradation (same model as ExhibitFlow, no new strategy): no JS /
 * reduced-motion / <1024px render every card in full with its evidence
 * beneath it — one linear column, zero content loss. The enhancement is
 * only ever the split. Nothing animates on its own; there is no rAF
 * anywhere in this component.
 *
 * Evidence is text and links only: no WebGL, no render target, no
 * canvas. Empty fields render nothing rather than an empty slot.
 */

function Evidence({ note }: { note: (typeof fieldNotes)[number] }) {
  if (!note.metrics.length) return null;
  return (
    <dl className="max-h-[70svh] overflow-y-auto pr-2">
      {note.metrics.map((m, i) => (
        <div
          key={i}
          className="border-b border-line py-3"
          style={{ borderBottomWidth: "0.5px" }}
        >
          <dt className="font-mono text-[length:var(--text-body)] text-ink">{m.value}</dt>
          {m.label && (
            <dd className="mt-1 font-mono font-medium text-[length:var(--text-meta)] text-muted">{m.label}</dd>
          )}
          <dd className="mt-1 font-mono font-medium text-[length:var(--text-meta)] tracking-wide text-bronze">
            {m.source}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function CardFace({
  note,
  n,
  open,
}: {
  note: (typeof fieldNotes)[number];
  n: number;
  open: boolean;
}) {
  return (
    <>
      <div
        className="flex items-baseline justify-between border-b border-line pb-2"
        style={{ borderBottomWidth: "0.5px" }}
      >
        <span className="font-mono font-medium text-[length:var(--text-meta)] tracking-widest text-bronze group-hover:text-[#FFB46B]">
          {String(n).padStart(2, "0")}
        </span>
        <span className="font-mono font-medium text-[length:var(--text-meta)] tracking-wide text-muted">
          {note.metrics.length} sources
        </span>
      </div>
      <p className="mt-3 font-serif text-[length:var(--text-lead)] leading-snug">{note.title}</p>
      <p className="mt-2 font-mono font-medium text-[length:var(--text-meta)] text-muted">{note.headline}</p>
      {open && (
        <p className="mt-4 max-w-[60ch] font-serif text-[length:var(--text-body)] leading-relaxed">
          {note.body}
        </p>
      )}
    </>
  );
}

export default function FieldNotes() {
  const enhanced = useSplitEnhancement();
  const [sel, setSel] = useState<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sel === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSel(null);
      if (e.key === "ArrowRight") setSel((s) => ((s ?? 0) + 1) % fieldNotes.length);
      if (e.key === "ArrowLeft")
        setSel((s) => ((s ?? 0) + fieldNotes.length - 1) % fieldNotes.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel]);

  const cardCls =
    "group block w-full border border-line bg-paper p-4 text-left outline-none transition-colors hover:border-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]";

  // base layer: every card, in full, with its evidence — this is the
  // whole content and it is what no-JS / reduced / narrow readers get
  if (!enhanced)
    return (
      <div className="mt-8 space-y-10">
        {fieldNotes.map((note, i) => (
          <article key={note.id} className="border border-line p-4" style={{ borderWidth: "0.5px" }}>
            <CardFace note={note} n={i + 1} open />
            <div className="mt-4">
              <Evidence note={note} />
            </div>
          </article>
        ))}
      </div>
    );

  const note = sel !== null ? fieldNotes[sel] : null;

  return (
    <div ref={wrap} className="mt-8" data-fieldnotes>
      {/* the split reserves the same block the card set occupied, so
          entering and leaving it cannot shift the page (CLS ≈ 0) */}
      <div className="min-h-[26rem]">
        {note ? (
          <div className={SPLIT_GRID}>
            <div>
              {/* card switcher: stay in the split, change the note */}
              <div className="mb-5 flex flex-wrap items-center gap-3 font-mono font-medium text-[length:var(--text-meta)]">
                {fieldNotes.map((f, i) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSel(i)}
                    aria-current={i === sel ? "true" : undefined}
                    className={`outline-none transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B] ${
                      i === sel ? "text-bronze" : "text-muted hover:text-ink"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSel(null)}
                  className="ml-auto text-muted outline-none transition-colors hover:text-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]"
                >
                  ESC · all cards
                </button>
              </div>
              <div key={note.id} className="fn-fade border border-line p-4" style={{ borderWidth: "0.5px" }}>
                <CardFace note={note} n={sel! + 1} open />
              </div>
            </div>
            <div key={note.id + "-ev"} className="fn-fade">
              <p className="mb-2 font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-widest text-muted">
                evidence
              </p>
              <Evidence note={note} />
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fieldNotes.map((f, i) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setSel(i)}
                className={cardCls}
                style={{ borderWidth: "0.5px" }}
              >
                <CardFace note={f} n={i + 1} open={false} />
              </button>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .fn-fade { animation: fn-fade 0.25s ease-out; }
        @media (prefers-reduced-motion: reduce) { .fn-fade { animation: none; } }
        @keyframes fn-fade { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}
