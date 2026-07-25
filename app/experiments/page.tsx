import type { Metadata } from "next";
import { Suspense } from "react";
import ExperimentsIndex from "@/components/ExperimentsIndex";
import { FolioBar } from "@/components/folio/FolioChrome";

export const metadata: Metadata = { title: "Experiments" };

/*
 * NAV-IA §2 — /experiments landing skeleton. FolioChrome blood: paper,
 * mono data, 0.5px lines, no cards/shadows/radius, no cinnabar. All
 * copy is a VISIBLE placeholder — nothing invented, and which pieces
 * count as experiments is the author's call, not ours.
 * // 候选: Cyber I Ching / Whorl / De-AI spectral study — 作者确认后启用
 */
export default function ExperimentsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <FolioBar backHref="/" />
      <section className="pt-16 pb-8">
        <h1 className="font-serif text-5xl tracking-tight sm:text-6xl">
          EXPERIMENTS
        </h1>
        <p className="mt-4 font-mono text-xs tracking-wide text-muted">
          〔回填:一句定位——建议给 Experiments 自己的编辑立场,如「短周期的技术试探」,不要写成「其余作品」〕
        </p>
      </section>
      {/* 可筛选文字索引 — 数据在 content/experiments.ts,作者填字即增删 */}
      <Suspense>
        <ExperimentsIndex />
      </Suspense>
      <div className="pb-24" />
    </main>
  );
}
