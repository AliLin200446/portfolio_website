import Image from "next/image";
import Link from "next/link";
import BenchArrival from "@/components/bench/BenchArrival";
import CaseIndex from "@/components/folio/CaseIndex";
import HalationHero from "@/components/folio/HalationHero";
import LiveFacade from "@/components/folio/LiveFacade";
import { berthOf } from "@/lib/bench";
import type { CaseData, Figure } from "@/content/cases/_schema";

/*
 * CASE TEMPLATE — one component, six pages. Sections run in one fixed
 * order and never move: MASTHEAD · CLAIM · HERO · WHAT · BUILD ·
 * PROOF · MORE. Six cases sharing one rigorous structure read as one
 * methodical person; six bespoke layouts read as six.
 *
 * Type is fixed here so no page can drift: Geist Mono for nav, section
 * labels, metadata, captions and data; Spectral (roman, no axis
 * loaded) for prose; single column capped at 68ch. Figures alternate
 * with prose — no more than two paragraphs without a visual break —
 * and every figure carries a mono caption.
 *
 * Reused rather than rebuilt: the left rail is the same CaseIndex the
 * Teardown page uses, the live embed is the same click-to-run
 * LiveFacade (no iframe exists before the click), and the halation
 * comparator is the same SVG instrument.
 */

const LABEL = "font-mono text-xs uppercase tracking-widest text-bronze-text";
const PROSE = "max-w-[68ch] font-serif text-[17px] leading-relaxed";
const CAPTION =
  "mt-3 font-mono text-[11px] leading-relaxed tracking-wide text-muted";

/** A value that has not arrived yet. Loud on purpose: mono, boxed,
 *  annotation-red — it exists so an unfinished page cannot be mistaken
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
            posterNote="high-res still pending — the live engine runs on click"
          />
        );
      case "instrument":
        return <HalationHero />;
      case "video":
        return (
          <video
            src={figure.src}
            poster={figure.poster}
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
        {figure.kind === "image" && figure.selfCaptioned ? figure.attribution : figure.caption}
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

export default function CaseTemplate({ data }: { data: CaseData }) {
  const berth = berthOf(data.slug);
  const items = [
    { id: "claim", label: "CLAIM" },
    { id: "what", label: "WHAT" },
    { id: "build", label: "BUILD" },
    { id: "proof", label: "PROOF" },
    { id: "more", label: "MORE" },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6">
      <BenchArrival slug={data.slug} />
      <header className="flex items-baseline justify-between py-6 font-mono text-xs text-muted">
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
        <p className="mt-4 max-w-[52ch] font-serif text-xl text-muted">
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

      {/* ② CLAIM — one sentence, the thesis */}
      <section
        id="claim"
        className="flex min-h-[38svh] scroll-mt-8 items-center border-b border-line"
      >
        <p className="max-w-[24ch] font-serif text-4xl leading-tight sm:text-5xl">
          {data.claim}
        </p>
      </section>

      {/* ③ HERO — the strongest single visual */}
      <section className="py-12">
        <Fig figure={data.hero} />
      </section>

      {/* ④ WHAT IT IS */}
      <section id="what" className="scroll-mt-8 border-t border-line py-14">
        <p className={LABEL}>WHAT</p>
        <div className="mt-8">
          {data.what.map((para) => (
            <p key={para} className={`${PROSE} mb-5`}>
              {para}
            </p>
          ))}
          {data.whatFigure && <Fig figure={data.whatFigure} />}
        </div>
      </section>

      {/* ⑤ HOW I BUILT IT — one decision per subsection */}
      <section id="build" className="scroll-mt-8 border-t border-line py-14">
        <p className={LABEL}>BUILD</p>
        <div className="mt-8 space-y-14">
          {data.build.map((d) => (
            <div key={d.heading}>
              <h2 className="font-mono text-xs uppercase tracking-widest text-ink">
                {d.heading}
              </h2>
              <p className={`${PROSE} mt-4`}>{d.body}</p>
              {d.body2 && <p className={`${PROSE} mt-4`}>{d.body2}</p>}
              {d.data && (
                <p className="mt-5 max-w-[68ch] font-mono text-[11px] leading-relaxed text-ink">
                  {d.data}
                  {d.dataPending && <Pending what={d.dataPending} ip />}
                  {d.dataTail}
                </p>
              )}
              {d.note && (
                <p className="mt-3 max-w-[68ch] font-mono text-[10px] leading-relaxed text-muted">
                  {d.note}
                </p>
              )}
              {d.figure && <Fig figure={d.figure} />}
            </div>
          ))}
        </div>
      </section>

      {/* ⑥ WHY IT HOLDS — evidence, then limits */}
      <section id="proof" className="scroll-mt-8 border-t border-line py-14">
        <p className={LABEL}>{data.proofLabel ?? "PROOF"}</p>
        <ul className="mt-8 max-w-[68ch]">
          {data.proof.items.map((p) => (
            <li
              key={p.claim}
              className="border-b border-line py-4"
              style={{ borderBottomWidth: "0.5px" }}
            >
              <p className="font-serif text-[17px] leading-relaxed">{p.claim}</p>
              {p.source && (
                <p className="mt-2 font-mono text-[11px] tracking-wide text-bronze-text">
                  {p.source}
                </p>
              )}
              {p.pending && <Pending what={p.pending} ip />}
              {p.figure && <Fig figure={p.figure} />}
            </li>
          ))}
        </ul>
        {data.proof.limits.length > 0 && (
          <div className="mt-10">
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              LIMITS
            </p>
            <ul className="mt-4 max-w-[68ch] space-y-3">
              {data.proof.limits.map((l) => (
                <li key={l} className="font-serif text-[15px] leading-relaxed text-muted">
                  {l}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ⑦ CONTEXT */}
      <section id="more" className="scroll-mt-8 border-t border-line py-14">
        <p className={LABEL}>MORE</p>
        <p className={`${PROSE} mt-8`}>{data.context}</p>
        {/* the ending is an action, not a conclusion: on a page whose
            subject is a working tool, the last thing the reader meets is
            the door to it — larger than the byline, ahead of the nav */}
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
