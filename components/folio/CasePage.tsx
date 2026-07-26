import BenchArrival from "@/components/bench/BenchArrival";
import CaseIndex from "./CaseIndex";
import { berthOf } from "@/lib/bench";
import type { CasePageData } from "@/content/case/casepages";
import ExhibitFlow from "./ExhibitFlow";
import FieldNotes from "./FieldNotes";
import { FolioBar } from "./FolioChrome";
import HalationHero from "./HalationHero";
import LiveFacade from "./LiveFacade";

/*
 * CASE PAGE v2 — ONE template for all six project pages, ⑤⑥ toggled
 * by type (手记 folio / 陈列签 specimen). Copy renders VERBATIM from
 * content/case/casepages.ts; 〔TODO〕/〔回填〕 stay visible — they are
 * the author's worklist, never fabricated. HERO gate: a missing asset
 * renders a marked block; such a page must not ship live.
 * Tokens: paper/ink/oxblood/copper · serif display, Newsreader
 * CLAIM · mono for ALL metadata and captions · no cards/shadows/radius.
 */

/** TEARDOWN-FILL §1: a passage section — mono section label, then
 *  passages whose optional run-in heading sits in mono caps ahead of
 *  its own paragraph. Narrow measure, 0.5px rule, nothing else. */
function Passages({
  id,
  label,
  passages,
}: {
  id: string;
  label: string;
  passages: NonNullable<CasePageData["brief"]>;
}) {
  return (
    <section id={id} className="scroll-mt-8 border-t border-line py-14">
      <p className="font-mono text-xs uppercase tracking-widest text-bronze">
        {label}
      </p>
      <div className="mt-8 max-w-[68ch]">
        {passages.map((p, i) => (
          <div key={i} className={i > 0 ? "mt-6" : undefined}>
            {p.paras.map((para, k) => (
              <p key={k} className="mb-4 font-serif text-[17px] leading-relaxed">
                {k === 0 && p.heading && (
                  <span className="font-mono text-xs uppercase tracking-widest text-ink">
                    {p.heading}{" "}
                  </span>
                )}
                {para}
              </p>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function Caption({ text }: { text: string }) {
  return (
    <p className="mt-3 whitespace-pre-line font-mono text-[11px] tracking-wide text-muted">
      {text}
    </p>
  );
}

function Hero({ data }: { data: CasePageData }) {
  const h = data.hero;
  return (
    <section
      id={data.type === "folio" ? "hero" : "piece"}
      className="scroll-mt-8 py-10"
    >
      {h.kind === "latent-comparator" && <HalationHero />}
      {h.kind === "facade" && (
        <LiveFacade
          liveUrl={h.liveUrl}
          embeddable={h.embeddable}
          poster={h.poster}
          posterNote={h.posterNote}
          base={h.base}
        />
      )}
      {h.kind === "gate" && (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 border border-line bg-[#EDE9E0]">
          <span className="font-mono text-xs text-oxblood">
            HERO〔gate〕· 素材缺 · 本页不可上线
          </span>
          <span className="font-mono text-[11px] text-muted">
            待接素材:{h.priority}
          </span>
        </div>
      )}
      <Caption text={data.heroCaption} />
    </section>
  );
}

/** ④ half-width mechanism diagram, hand-drawn feel: mono labels in
 *  jittered boxes with arrows. Only spec-given labels; otherwise a
 *  labeled placeholder. */
function MechDiagram({ mech }: { mech: CasePageData["mech"] }) {
  if (!mech.nodes)
    return (
      <div className="flex h-32 items-center justify-center border border-line bg-[#EDE9E0]">
        <span className="font-mono text-[11px] text-muted">
          {mech.placeholder}
        </span>
      </div>
    );
  return (
    <div className="flex flex-wrap items-center gap-2 border border-line p-6">
      {mech.nodes.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          <span
            className="border border-ink px-3 py-1.5 font-mono text-[11px]"
            style={{ transform: `rotate(${i % 2 ? 0.7 : -0.6}deg)` }}
          >
            {n}
          </span>
          {i < mech.nodes!.length - 1 && (
            <span aria-hidden className="font-mono text-xs text-muted">
              →
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

export default function CasePage({ data }: { data: CasePageData }) {
  const berth = berthOf(data.slug);
  // CASE-NAV §2: the index mirrors what THIS page actually renders —
  // empty sections never appear (data-driven, no hardcoding)
  const folio = data.type === "folio";
  const items = [
    { id: "claim", label: "CLAIM" },
    { id: folio ? "hero" : "piece", label: folio ? "HERO" : "PIECE" },
    ...(data.what
      ? [{ id: folio ? "what" : "label", label: folio ? "WHAT" : "LABEL" }]
      : []),
    ...(data.brief ? [{ id: "brief", label: "BRIEF" }] : []),
    ...(data.problem ? [{ id: "problem", label: "PROBLEM" }] : []),
    ...(data.approach ? [{ id: "approach", label: "APPROACH" }] : []),
    ...(folio && (data.exhibitFlow || data.process)
      ? [{ id: "exhibits", label: "EXHIBITS" }]
      : []),
    ...(folio && data.findings ? [{ id: "findings", label: "FINDINGS" }] : []),
    ...(data.fieldNotes ? [{ id: "fieldnotes", label: "FIELD NOTES" }] : []),
    ...(data.value ? [{ id: "value", label: "VALUE" }] : []),
  ];
  return (
    <main className="mx-auto max-w-5xl px-6">
      <BenchArrival slug={data.slug} />
      <FolioBar backHref={berth >= 0 ? `/?berth=${berth}` : "/"} />
      <CaseIndex items={items} />

      {/* ① colophon head: serif name + one mono metadata line */}
      <section className="pt-14">
        <h1 className="font-serif text-5xl tracking-tight sm:text-6xl">
          {data.name}
        </h1>
        {data.subtitle && (
          <p className="mt-3 font-serif text-xl text-muted">
            {data.subtitle}
          </p>
        )}
        <p className="mt-4 font-mono text-xs tracking-wide text-muted">
          {data.metaLine}
        </p>
        {data.metaLine2 && (
          <p className="mt-1 font-mono text-xs tracking-wide text-muted">
            {data.metaLine2}
          </p>
        )}
      </section>

      {/* ② CLAIM: one sentence, half a screen of air */}
      <section id="claim" className="flex min-h-[45svh] scroll-mt-8 items-center">
        <p className="max-w-[34ch] whitespace-pre-line font-serif text-4xl leading-tight sm:text-5xl">
          {data.claim}
        </p>
      </section>

      {/* ③ HERO: the single largest asset, full width */}
      <Hero data={data} />

      {/* ④ WHAT: verbatim sentences + half-width mechanism diagram.
          Absent on pages whose copy has no WHAT (TEARDOWN). */}
      {data.what && (
      <section
        id={folio ? "what" : "label"}
        className="grid scroll-mt-8 gap-10 border-t border-line py-14 sm:grid-cols-2"
      >
        <p className="max-w-[60ch] font-serif text-lg leading-relaxed">
          {/* 雷1: an unattributed statistic never walks alone — the
              〔source〕 tag renders visibly until the citation lands */}
          {data.what.includes("〔source") ? (
            <>
              {data.what.slice(0, data.what.indexOf("〔source"))}
              <span className="font-mono text-[11px] tracking-wide text-bronze">
                {data.what.slice(data.what.indexOf("〔source"))}
              </span>
            </>
          ) : (
            data.what
          )}
        </p>
        <MechDiagram mech={data.mech} />
      </section>
      )}

      {/* BRIEF · PROBLEM · APPROACH — author copy, verbatim */}
      {data.brief && <Passages id="brief" label="BRIEF" passages={data.brief} />}
      {data.problem && (
        <Passages id="problem" label="PROBLEM" passages={data.problem} />
      )}
      {data.approach && (
        <Passages id="approach" label="APPROACH" passages={data.approach} />
      )}

      {/* ⑤ PROCESS — 手记 only. With exhibitFlow: the split-screen
          scrollytelling movement returns (ExhibitFlow — IntersectionObserver,
          js-scrolly enhancement layer, single-column degradation with zero
          content loss). Without it: the v2 static grid. */}
      {data.type === "folio" && data.exhibitFlow && (
        <section id="exhibits" className="scroll-mt-8 border-t border-line py-8">
          <p className="font-mono text-xs uppercase tracking-widest text-bronze">
            PROCESS
          </p>
          <ExhibitFlow exhibits={data.exhibitFlow} />
        </section>
      )}
      {data.type === "folio" && !data.exhibitFlow && data.process && (
        <section id="exhibits" className="scroll-mt-8 border-t border-line py-14">
          <p className="font-mono text-xs uppercase tracking-widest text-bronze">
            PROCESS
          </p>
          <div className="mt-8 grid gap-10 sm:grid-cols-3">
            {data.process.map((ex) => (
              <figure key={ex.n}>
                <div className="flex aspect-[4/3] items-center justify-center border border-line bg-[#EDE9E0]">
                  <span className="px-4 text-center font-mono text-[10px] text-muted">
                    [EVIDENCE: EXHIBIT {ex.n} · {ex.title}]
                  </span>
                </div>
                <figcaption className="mt-3 font-mono text-[10px] leading-relaxed text-muted">
                  EXHIBIT {ex.n} · {ex.title} · 图注{ex.caption}
                </figcaption>
                <p className="mt-2 font-serif text-sm text-muted">
                  观察:{ex.observation}
                </p>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ⑥ FINDINGS — 手记 only, number-led, one size up */}
      {data.type === "folio" && data.findings && (
        <section id="findings" className="scroll-mt-8 border-t border-line py-14">
          <p className="font-mono text-xs uppercase tracking-widest text-bronze">
            FINDINGS
          </p>
          <ol className="mt-8 space-y-8">
            {data.findings.map((f, i) => (
              <li key={f} className="grid gap-6 sm:grid-cols-[5rem_1fr]">
                <span className="font-mono text-2xl text-bronze">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="max-w-[60ch] font-serif text-xl leading-relaxed">
                  {f}
                </p>
              </li>
            ))}
          </ol>
          {data.findingsNote && (
            <p className="mt-10 max-w-[68ch] font-serif text-[17px] leading-relaxed text-muted">
              {data.findingsNote}
            </p>
          )}
        </section>
      )}

      {/* FIELD NOTES — the six cards + their evidence (teardown only) */}
      {data.fieldNotes && (
        <section id="fieldnotes" className="scroll-mt-8 border-t border-line py-14">
          <p className="font-mono text-xs uppercase tracking-widest text-bronze">
            FIELD NOTES
          </p>
          <FieldNotes />
        </section>
      )}

      {/* VALUE — author copy, verbatim */}
      {data.value && <Passages id="value" label="VALUE" passages={data.value} />}

      {/* ⑦ colophon foot */}
      <footer className="mt-10 border-t border-line py-10">
        {data.zh && <p className="mb-6 font-serif text-lg">{data.zh}</p>}
        <div className="flex flex-wrap items-baseline justify-between gap-4 font-mono text-xs text-muted">
          <span>Ali Lin — {data.role}</span>
          <a href={data.next.href} className="transition-colors hover:text-bronze">
            NEXT → {data.next.label}
          </a>
        </div>
      </footer>
      <div className="pb-12" />
    </main>
  );
}
