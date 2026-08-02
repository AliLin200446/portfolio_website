import type { Metadata } from "next";
import { Suspense } from "react";
import ExperimentsIndex from "@/components/ExperimentsIndex";
import { FolioBar } from "@/components/folio/FolioChrome";

export const metadata: Metadata = { title: "Experiments" };

/*
 * /experiments landing. FolioChrome blood: paper, mono data, 0.5px
 * lines, no cards, no shadows, no radius, no cinnabar. Which pieces
 * count as experiments is the author's call; this file only frames
 * them.
 */
export default function ExperimentsPage() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <FolioBar backHref="/" />
      <section className="pt-16 pb-8">
        <h1 className="font-serif text-5xl tracking-tight sm:text-6xl">
          EXPERIMENTS
        </h1>
      </section>
      {/* 可筛选文字索引 — 数据在 content/experiments.ts,作者填字即增删 */}
      <Suspense>
        <ExperimentsIndex />
      </Suspense>
      <div className="pb-24" />
    </main>
  );
}
