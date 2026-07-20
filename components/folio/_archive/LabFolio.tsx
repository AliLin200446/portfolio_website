// DEPRECATED (CASE-v2-MERGE Step 5): off the routes, kept for reuse.
import BenchArrival from "@/components/bench/BenchArrival";
import type { LabFolioData } from "@/lib/labfolio";
import ExhibitFlow from "../ExhibitFlow";
import {
  ColophonHead,
  ColophonTail,
  FolioBar,
  SectionNo,
} from "../FolioChrome";

/*
 * LAB FOLIO v2 (手记 · 分屏) — the notebook template, upgraded: the
 * exhibit flow is a split-screen scrollytelling movement inside an
 * otherwise single-column page. Swiss skeleton, house skin (§3): the
 * grid, the numerals-as-composition, the ordered figure/text split are
 * borrowed; the paper/ink/oxblood/copper palette and the Newsreader
 * serif stay. Full-screen breathing for claim / findings / colophons —
 * the split is one movement, not the whole metronome.
 * Shares FolioChrome with the specimen label (§7): swap the body, the
 * head and tail never move.
 */

export default function LabFolio({ data }: { data: LabFolioData }) {
  return (
    <main className="mx-auto max-w-6xl px-6">
      <BenchArrival slug={data.slug} />
      <FolioBar backHref={data.backHref} />

      {/* ① colophon head — shared chrome */}
      <ColophonHead title={data.title} meta={data.meta} />

      {/* ② the claim: one thesis, one screen of air */}
      <section className="flex min-h-[70svh] items-center">
        <p className="max-w-[16ch] font-serif text-5xl italic leading-tight sm:text-6xl">
          {data.claim}
        </p>
      </section>

      {/* ③ the exhibit flow — the split-screen movement */}
      <section className="border-t border-line pt-8">
        <SectionNo n="03" label="EXHIBITS" />
        <ExhibitFlow exhibits={data.exhibits} />
      </section>

      {/* ⑥ findings: numbered conclusions, single column, no split */}
      <section className="border-t border-line py-20">
        <SectionNo n="06" label="FINDINGS" />
        <ol className="mt-10 space-y-10">
          {data.findings.map((f, i) => (
            <li key={f} className="grid gap-6 sm:grid-cols-[6rem_1fr]">
              <span className="font-mono text-3xl text-bronze">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="max-w-[60ch] font-serif text-xl leading-relaxed">
                {f}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ⑦ colophon tail — shared chrome */}
      <ColophonTail
        couplet={data.couplet}
        year={data.year}
        next={data.next}
      />
      <div className="pb-12" />
    </main>
  );
}
