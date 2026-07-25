import type { Metadata } from "next";
import { FolioBar } from "@/components/folio/FolioChrome";

export const metadata: Metadata = { title: "Photography" };

/*
 * NAV-IA §3 — /photography landing skeleton. Hairline grid (0.5px, no
 * radius), every cell a VISIBLE 〔回填:图片〕 frame — no sample images,
 * ever. The <img> slots ship with loading="lazy" wiring so future
 * volume never touches LCP; captions carry the condition template
 * (胶片/机身 · 地点 · 年份), the exhibit-tag voice.
 */
const CELLS = Array.from({ length: 6 }, (_, i) => i);

export default function PhotographyPage() {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <FolioBar backHref="/" />
      <section className="pt-16 pb-8">
        <h1 className="font-serif text-5xl tracking-tight sm:text-6xl">
          PHOTOGRAPHY
        </h1>
        <p className="mt-2 font-serif text-lg">Lin Chenan Photography</p>
        <p className="mt-3 font-mono text-xs tracking-wide text-muted">
          〔回填:一句定位〕
        </p>
      </section>
      <section className="grid grid-cols-1 gap-px border-t border-line py-14 sm:grid-cols-2 lg:grid-cols-3">
        {CELLS.map((i) => (
          <figure key={i} className="border border-line p-2" style={{ borderWidth: "0.5px" }}>
            {/* 图片到位时换 <img loading="lazy" …> — 懒加载结构就位 */}
            <div className="flex aspect-[4/5] items-center justify-center bg-[#EDE9E0]">
              <span className="font-mono text-[10px] text-muted">〔回填:图片〕</span>
            </div>
            <figcaption className="mt-2 font-mono text-[10px] tracking-wide text-muted">
              〔胶片/机身 · 地点 · 年份〕
            </figcaption>
          </figure>
        ))}
      </section>
      <div className="pb-24" />
    </main>
  );
}
