import Link from "next/link";

/*
 * FOLIO CHROME — the shared layer both case-page templates inherit
 * (§1 SPECIMEN-LABEL). Two narrative postures, one bloodline:
 *   · the lab notebook (手记) — "watch me measure"
 *   · the specimen label (陈列签) — "the object speaks, I step back"
 * They share: the top bar, the colophon head (name + one hard-fact
 * line), the colophon tail (Chinese couplet signature + year + NEXT),
 * and the typographic law — paper/ink, no cards/shadows/radius,
 * uppercase mono section numbers, three typefaces on three duties
 * (Newsreader: names/label text · Geist Mono: data · Geist Sans: UI).
 * The upgrade path lives here: a specimen page becomes a notebook page
 * by swapping the middle body only — head and tail never move.
 */

/** Top bar: the walk back to the bench + signature. Both templates. */
export function FolioBar({ backHref }: { backHref: string }) {
  return (
    <header className="flex items-baseline justify-between py-6 font-mono font-medium text-[length:var(--text-meta)] text-muted">
      <Link href={backHref} className="transition-colors hover:text-bronze">
        ← Index
      </Link>
      {/* CASE-NAV §3: the signature is also a way home, berth-aware */}
      <Link href={backHref} className="transition-colors hover:text-bronze">
        Ali Lin
      </Link>
    </header>
  );
}

/** Colophon head: project name in Newsreader + ONE line of exhibit-tag
 *  metadata (material / period / provenance syntax). Hard facts only —
 *  stack, year, status, place. Absent facts are absent, never invented. */
export function ColophonHead({
  title,
  meta,
}: {
  title: string;
  meta: string;
}) {
  return (
    <section className="pt-16 pb-4">
      <h1 className="font-serif text-[length:var(--text-display)] tracking-tight sm:text-[length:var(--text-display)]">
        {title}
      </h1>
      <p className="mt-4 font-mono font-medium text-[length:var(--text-meta)] tracking-wide text-muted">
        {meta}
      </p>
    </section>
  );
}

/** Colophon tail: the one place Chinese appears — a signature, not a
 *  decoration. Couplet is optional until the author supplies it (zero
 *  fabrication); year + NEXT always close the page. */
export function ColophonTail({
  couplet,
  year,
  next,
}: {
  /** Author-supplied pair, e.g. 「…，…。」 Absent = not rendered. */
  couplet?: string;
  year: string;
  next?: { label: string; href: string };
}) {
  return (
    <footer className="mt-24 border-t border-line py-10">
      {couplet && (
        <p className="mb-6 font-serif text-[length:var(--text-lead)] text-ink">{couplet}</p>
      )}
      <div className="flex flex-wrap items-baseline justify-between gap-4 font-mono font-medium text-[length:var(--text-meta)] text-muted">
        <span>{year}</span>
        {next && (
          <Link
            href={next.href}
            className="transition-colors hover:text-bronze"
          >
            NEXT → {next.label}
          </Link>
        )}
      </div>
    </footer>
  );
}

/** Uppercase mono section number — `01 / PIECE` — the shared caption
 *  voice of both templates. */
export function SectionNo({
  n,
  label,
}: {
  n: string;
  label?: string;
}) {
  return (
    <p className="font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-widest text-bronze">
      {n}
      {label ? ` / ${label}` : ""}
    </p>
  );
}

/** Narrow reading measure (~68ch), left-leaning. Shared body width. */
export function Measure({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[68ch]">{children}</div>;
}
