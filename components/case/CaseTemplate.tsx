import Image from "next/image";
import Link from "next/link";
import BenchArrival from "@/components/bench/BenchArrival";
import CaseIndex, { type IndexItem } from "@/components/folio/CaseIndex";
import PassStackFacade from "./PassStackFacade";
import ExperimentSpaceFacade from "./ExperimentSpaceFacade";
import SilkControl from "./SilkControl";
import HalationHero from "@/components/folio/HalationHero";
import { LatencyAnatomy, StepDelta, StepFit, SeedDeterminism } from "./TeardownFigures";
import LiveFacade from "@/components/folio/LiveFacade";
import { berthOf } from "@/lib/bench";
import type { CaseData, Figure } from "@/content/cases/_schema";

/*
 * CASE TEMPLATE. One component, six pages. Sections run in one fixed
 * order and never move: MASTHEAD · CLAIM · HERO · WHAT · BUILD ·
 * PROOF · MORE. Six cases sharing one rigorous structure read as one
 * methodical person; six bespoke layouts read as six.
 *
 * Type is fixed here so no page can drift: Geist Mono for nav, section
 * labels, metadata, captions and data; Spectral (roman, no axis
 * loaded) for prose; single column capped at 68ch. Figures alternate
 * with prose. No more than two paragraphs without a visual break
 * and every figure carries a mono caption.
 *
 * Reused rather than rebuilt: the left rail is the same CaseIndex the
 * Teardown page uses, the live embed is the same click-to-run
 * LiveFacade (no iframe exists before the click), and the halation
 * comparator is the same SVG instrument.
 */

const LABEL = "font-mono text-sm uppercase tracking-widest text-bronze-text";
const PROSE = "max-w-[68ch] font-serif text-[21px] leading-relaxed";
const CAPTION =
  "mt-3 font-mono text-[13px] leading-relaxed tracking-wide text-muted";

/** A value that has not arrived yet. Loud on purpose: mono, boxed,
 *  annotation-red. It exists so an unfinished page cannot be mistaken
 *  for a finished one. These chips are temporary by definition; when
 *  the real value lands the chip goes with it. */
function Pending({ what, ip }: { what: string; ip?: boolean }) {
  return (
    <span className="mt-2 inline-flex items-center gap-2 border border-oxblood px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-oxblood">
      {ip ? "pending-ip" : "pending"}
      <span className="tracking-normal normal-case">{what}</span>
    </span>
  );
}

function Fig({ figure }: { figure: Figure }) {
  const body = () => {
    switch (figure.kind) {
      case "live":
        return (
          <LiveFacade
            liveUrl={figure.url}
            embeddable
            poster={figure.poster}
            motion={figure.motion}
            motionStill={figure.motionStill}
            posterNote={
              figure.poster || figure.motion
                ? undefined
                : "high-res still pending. The live engine runs on click"
            }
          />
        );
      case "instrument":
        if (figure.component === "latency") return <LatencyAnatomy />;
        if (figure.component === "stepdelta") return <StepDelta />;
        if (figure.component === "stepfit") return <StepFit />;
        if (figure.component === "seed") return <SeedDeterminism />;
        if (figure.component === "passstack") return <PassStackFacade />;
        if (figure.component === "expspace") return <ExperimentSpaceFacade />;
        if (figure.component === "silkcontrol") return <SilkControl />;
        return <HalationHero />;
      case "video":
        return (
          /* controls, because without them this element had no way to
             start: no autoplay, no controls and preload="none" render
             a poster that never becomes a video. preload stays none so
             a 20 MB hero costs nothing until somebody asks for it,
             which is the same bargain the 3D facades on this page
             already make. */
          <video
            src={figure.src}
            poster={figure.poster}
            controls
            muted
            loop
            playsInline
            preload="none"
            className="w-full border border-line"
          />
        );
      case "image":
        // full measure width, hairline border, never scaled past its
        // native size; lazy by default, and next/image serves a 2x
        // source at this width so it stays sharp on retina
        return (
          <Image
            src={figure.src}
            alt={figure.caption}
            width={figure.width ?? 1600}
            height={figure.height ?? 1000}
            sizes="(max-width: 1024px) 100vw, 976px"
            className="h-auto w-full border border-line"
            style={{ maxWidth: figure.width ? `${figure.width}px` : undefined }}
          />
        );
      case "code":
        return (
          <pre className="overflow-x-auto border border-line bg-[#EDE9E0] p-4 font-mono text-xs leading-relaxed text-ink">
            {figure.code}
          </pre>
        );
      case "pending":
        return (
          <div className="flex aspect-[16/10] items-center justify-center border border-line bg-[#EDE9E0]">
            <span className="px-6 text-center font-mono text-[10px] tracking-wide text-muted">
              {figure.note}
            </span>
          </div>
        );
    }
  };
  return (
    <figure className="my-10">
      {body()}
      <figcaption className={CAPTION}>
        {figure.kind === "image" && figure.selfCaptioned
          ? figure.attribution
          : Array.isArray(figure.caption)
            ? // one line per entry. No new styling: the block inherits
              // the same mono size and leading the single-line caption
              // already uses, so a string caption renders identically.
              figure.caption.map((line) => <span key={line} className="block">{line}</span>)
            : figure.caption}
        {(figure.kind === "instrument" || figure.kind === "code") && figure.sourceHref && (
          <>
            {" · "}
            <a
              href={figure.sourceHref}
              target="_blank"
              rel="noreferrer"
              className="border-b border-bronze pb-px transition-colors hover:text-bronze-text"
            >
              {figure.sourceLabel ?? "source"}
            </a>
          </>
        )}
        {figure.pending && (
          <>
            <br />
            <Pending what={figure.pending} />
          </>
        )}
      </figcaption>
    </figure>
  );
}

export default function CaseTemplate({
  data,
  leadingIndexItems,
}: {
  data: CaseData;
  /* Anchors for full-bleed sections mounted ABOVE this template by the
     route. The template cannot see them, so it is told about them
     rather than guessing; they go first because they sit above WHAT on
     the page and the rail reads in document order. */
  leadingIndexItems?: IndexItem[];
}) {
  const berth = berthOf(data.slug);
  const items: IndexItem[] = [
        ...(leadingIndexItems ?? []),
        { id: "what", label: "WHAT" },
        { id: "why", label: "WHY" },
        { id: "how", label: "HOW" },
        { id: "proof", label: data.proofLabel ?? "PROOF" },
        // only when the page has any. An index entry pointing at an
        // anchor that was never rendered is a link that does nothing.
        ...(data.proof.limits.length > 0
          ? [{ id: "limits", label: "LIMITS" }]
          : []),
  ];

  return (
    <main className="mx-auto max-w-5xl px-6">
      <BenchArrival slug={data.slug} />
      <header className="sticky top-[3.25rem] z-[3] -mx-6 border-b border-line bg-paper/90 px-6 backdrop-blur-sm flex items-baseline justify-between py-3 font-mono text-xs text-muted">
        <Link
          href={berth >= 0 ? `/?berth=${berth}` : "/"}
          className="transition-colors hover:text-bronze-text"
        >
          ← Index
        </Link>
        <Link href="/" className="transition-colors hover:text-bronze-text">
          Ali Lin
        </Link>
      </header>

      {/* left rail: the Teardown page's own section nav */}
      <CaseIndex items={items} />

      {/* ① MASTHEAD */}
      <section className="pt-14">
        <h1 className="font-serif text-5xl tracking-tight sm:text-6xl">
          {data.name}
        </h1>
        <p className="mt-4 max-w-[52ch] font-serif text-2xl text-muted">
          {data.oneLine}
        </p>
        <p className="mt-6 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted">
          <span>{data.meta.type}</span>
          <span aria-hidden>·</span>
          <span>{data.meta.stack}</span>
          <span aria-hidden>·</span>
          <span>{data.meta.year}</span>
          <span aria-hidden>·</span>
          <span>{data.meta.status}</span>
          {data.meta.live && (
            <>
              <span aria-hidden>·</span>
              <a
                href={data.meta.live}
                target="_blank"
                rel="noreferrer"
                className="border-b border-bronze pb-px transition-colors hover:text-bronze-text"
              >
                open live ↗
              </a>
            </>
          )}
        </p>
      </section>

      {/* ② CLAIM. One sentence, the thesis */}
      <section
        id="claim"
        className="flex min-h-[38svh] scroll-mt-8 items-center border-b border-line"
      >
        <p className="max-w-[38ch] font-serif text-[1.75rem] leading-snug sm:text-[2.15rem]">
          {Array.isArray(data.claim)
            ? data.claim.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))
            : data.claim}
        </p>
      </section>

      {/* TEST, teardown only. This was a 3D close-up of the instrument
          you arrived through, which showed the object but not the
          thing the page is about. The recording shows the instrument
          being used, with the same numbers the page argues from. It
          goes through Fig so it inherits the poster-then-click bargain
          rather than restating it. */}
      {data.slug === "teardown" && (
        <section className="pt-10">
          <Fig
            figure={{
              kind: "video",
              src: "/case-assets/teardown/teardown-demo.mp4",
              poster: "/case-assets/teardown/teardown-demo-poster.webp",
              caption: "the instrument running, 25.2s · click to play",
            }}
          />
        </section>
      )}

      {/* ③ HERO. The strongest single visual */}
      <section className="py-12">
        <Fig figure={data.hero} />
      </section>

      {/* WHAT / WHY / HOW. The new structure. Every phase body is in
          the DOM whether the row is open or not: a details element
          folds, it does not unmount. Find-in-page, crawlers and
          check-claims all need to reach the sentences inside. */}
      <>
          <section id="what" className="scroll-mt-8 border-t border-line py-14">
            <p className={LABEL}>WHAT</p>
            <p className={`${PROSE} mt-8`}>{data.sections.what}</p>
          </section>

          <section id="why" className="scroll-mt-8 border-t border-line py-14">
            <p className={LABEL}>WHY</p>
            <p className={`${PROSE} mt-8`}>{data.sections.why}</p>
          </section>

          <section id="how" className="scroll-mt-8 border-t border-line py-14">
            <p className={LABEL}>HOW</p>
            {data.sections.how.summary.map((para, i) => (
              <p key={para} className={`${PROSE} ${i === 0 ? "mt-8" : "mt-5"}`}>
                {para}
              </p>
            ))}
            <div className="mt-10">
              {data.sections.how.phases.map((ph) => (
                <details
                  key={ph.title}
                  className="group border-t border-line last:border-b"
                  style={{ borderTopWidth: "0.5px" }}
                >
                  <summary className="flex cursor-pointer list-none items-baseline gap-3 py-5 font-mono text-sm uppercase tracking-widest text-ink outline-none [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]">
                    <span aria-hidden className="text-bronze-text">
                      <span className="group-open:hidden">+</span>
                      <span className="hidden group-open:inline">
                        {String.fromCharCode(8211)}
                      </span>
                    </span>
                    {ph.title}
                  </summary>
                  <div className="pb-10">
                    {ph.body.map((para, i) => (
                      <p
                        key={para}
                        className={`${PROSE} ${i === 0 ? "mt-2" : "mt-5"}`}
                      >
                        {para}
                      </p>
                    ))}
                    {ph.data?.map((d) => (
                      <p
                        key={d}
                        className="mt-5 font-mono text-[13px] leading-relaxed tracking-wide text-muted"
                      >
                        {d}
                      </p>
                    ))}
                    {ph.figure && <Fig figure={ph.figure} />}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </>

      {/* ⑥ WHY IT HOLDS: evidence, then limits */}
      <section id="proof" className="scroll-mt-8 border-t border-line py-14">
        <p className={LABEL}>{data.proofLabel ?? "PROOF"}</p>
        {data.proof.intro?.map((para, i) => (
          <p key={para} className={`${PROSE} ${i === 0 ? "mt-8" : "mt-5"}`}>
            {para}
          </p>
        ))}
        <ul className={data.proofSplit ? "mt-8" : "mt-8 max-w-[68ch]"}>
          {data.proof.items.map((p) => (
            <li
              key={p.claim}
              className={`border-b border-line py-6 ${
                data.proofSplit && p.figure
                  ? "grid gap-8 lg:grid-cols-[60fr_40fr] lg:items-start"
                  : ""
              }`}
              style={{ borderBottomWidth: "0.5px" }}
            >
              <div className="max-w-[68ch]">
              {p.label && (
                <p className="mb-2 font-mono text-[13px] uppercase tracking-widest text-ink">
                  {p.label}
                </p>
              )}
              <p className="font-serif text-[21px] leading-relaxed">{p.claim}</p>
              {p.source && (
                <p className="mt-2 font-mono text-[13px] tracking-wide text-bronze-text">
                  {p.source}
                </p>
              )}
              {p.pending && <Pending what={p.pending} ip />}
              </div>
              {p.figure && (
                <div className={data.proofSplit ? "lg:mt-0" : ""}>
                  <Fig figure={p.figure} />
                </div>
              )}
            </li>
          ))}
        </ul>
        {data.proof.limits.length > 0 && (
          <div id="limits" className="mt-10 scroll-mt-8">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              LIMITS
            </p>
            <ul className="mt-4 max-w-[68ch] space-y-3">
              {data.proof.limits.map((l) => (
                <li key={l} className="font-serif text-[19px] leading-relaxed text-muted">
                  {l}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ⑦ CONTEXT. The new structure has no MORE section, so a page
          that opted in does not render one. contextParas stays in the
          data file rather than being deleted: it is the author's copy
          and no decision has been taken about where it goes. */}
      <section id="more" className="scroll-mt-8 border-t border-line py-14">
        {/* the closing note: a rule and a short paragraph, no heading.
            Same shape on all five pages. */}
        {data.coda && (
          <p className="max-w-[68ch] text-[15px] leading-relaxed text-ink/70">
            {data.coda}
          </p>
        )}
        {/* the ending is an action, not a conclusion: on a page whose
            subject is a working tool, the last thing the reader meets is
            the door to it: larger than the byline, ahead of the nav */}
        {data.cta && (
          <p className="mt-10">
            <a
              href={data.cta.href}
              target="_blank"
              rel="noreferrer"
              className="inline-block border border-ink px-5 py-3 font-mono text-sm transition-colors hover:text-bronze-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]"
            >
              {data.cta.label}
            </a>
          </p>
        )}
        {data.byline && (
          <p className="mt-8 font-mono text-xs text-muted">{data.byline}</p>
        )}
        <nav className="mt-10 flex flex-wrap justify-between gap-4 font-mono text-xs text-muted">
          {data.prev ? (
            <Link href={data.prev.href} className="transition-colors hover:text-bronze-text">
              ← {data.prev.label}
            </Link>
          ) : (
            <span />
          )}
          {data.next && (
            <Link href={data.next.href} className="transition-colors hover:text-bronze-text">
              {data.next.label} →
            </Link>
          )}
        </nav>
      </section>
      <div className="pb-24" />
    </main>
  );
}
