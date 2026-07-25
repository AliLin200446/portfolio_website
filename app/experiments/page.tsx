import type { Metadata } from "next";
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
          〔回填:一句定位〕
        </p>
      </section>
      {/* 清单骨架: 名称 · 一句话 · 年份 · 链接 (陈列签的薄) */}
      <section className="border-t border-line py-14">
        <p className="font-mono text-sm text-muted">
          〔回填:experiments 清单 — 条目格式:名称 · 一句话 · 年份 · 链接〕
        </p>
      </section>
      <div className="pb-24" />
    </main>
  );
}
