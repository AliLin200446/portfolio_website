import BenchArrival from "@/components/bench/BenchArrival";
import {
  ColophonHead,
  ColophonTail,
  FolioBar,
  SectionNo,
} from "./FolioChrome";
import SpecimenPiece from "./SpecimenPiece";

/*
 * THE SPECIMEN LABEL (陈列签) — the second case-page template, for
 * projects without notebook material. Posture: the object speaks, the
 * author steps back. Same bloodline as the lab notebook (FolioChrome),
 * different density: thin and wide — more air, fewer words, a bigger
 * object. Five parts: colophon head · the piece · the label text ·
 * specifications · colophon tail.
 * Structural exceptions the template must carry (§3):
 *   documents — optional link list after the specs (Vestige: papers /
 *   patent numbers; facts are documents, zero fabrication)
 *   labelPending — the label-text slot can hold a review-pending state
 *   (ACUBOT: 「待审:父亲过目」— medical copy is verbatim-only, never
 *   generated into place)
 */

export type SpecimenData = {
  slug: string;
  title: string;
  /** One exhibit-tag line: hard facts only (stack/year/status/place). */
  meta: string;
  piece: {
    src?: string | null;
    poster?: string;
    placeholder?: string;
    live?: { url: string };
  };
  /** ≤120 words, exhibit-label voice. Mutually exclusive with pending. */
  labelText?: string;
  /** §3 ACUBOT: render the pending marker instead of label text. */
  labelPending?: string;
  /** Verifiable hard items only; unconfirmed items stay out. */
  specs: string[];
  /** §3 Vestige: papers / patents — links, after the specs row. */
  documents?: { label: string; href: string }[];
  /** Author-supplied Chinese couplet; absent until given. */
  couplet?: string;
  year: string;
  next?: { label: string; href: string };
  backHref: string;
};

export default function SpecimenLabel({ data }: { data: SpecimenData }) {
  return (
    <main className="mx-auto max-w-5xl px-6">
      <BenchArrival slug={data.slug} />
      <FolioBar backHref={data.backHref} />

      {/* 01 · colophon head */}
      <ColophonHead title={data.title} meta={data.meta} />

      {/* 02 · the piece — one object, one room */}
      <SpecimenPiece {...data.piece} />

      {/* 03 · the label text: what it is · what it's made of · what to
          watch. ≤120 words is discipline, not a suggestion. */}
      <section className="mx-auto max-w-[52ch] py-16">
        <SectionNo n="03" label="LABEL" />
        {data.labelPending ? (
          <p className="mt-6 font-mono text-sm text-muted">
            {data.labelPending}
          </p>
        ) : (
          <p className="mt-6 font-serif text-xl leading-relaxed">
            {data.labelText}
          </p>
        )}
      </section>

      {/* 04 · specifications: the accession-number zone — everything
          here is verifiable or it isn't here */}
      <section className="border-y border-line py-6">
        <SectionNo n="04" label="SPECIFICATIONS" />
        <p className="mt-4 flex flex-wrap gap-x-3 gap-y-2 font-mono text-xs text-ink">
          {data.specs.map((item, i) => (
            <span key={item}>
              {item}
              {i < data.specs.length - 1 && (
                <span className="text-muted"> · </span>
              )}
            </span>
          ))}
        </p>
        {data.documents && data.documents.length > 0 && (
          <ul className="mt-6 space-y-1 font-mono text-xs">
            {data.documents.map((d) => (
              <li key={d.href}>
                <a
                  href={d.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-bronze"
                >
                  {d.label} ↗
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 05 · colophon tail */}
      <ColophonTail
        couplet={data.couplet}
        year={data.year}
        next={data.next}
      />
      <div className="pb-12" />
    </main>
  );
}
