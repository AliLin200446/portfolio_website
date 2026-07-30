"use client";

import { useRouter, useSearchParams } from "next/navigation";
import SpecimenDrawer from "@/components/SpecimenDrawer";
import { TAGS, experiments, type Tag } from "@/content/experiments";

/*
 * EXPERIMENTS-INDEX — one line per piece, filterable, data-driven.
 * Filtering is an ENHANCEMENT: no-JS renders every entry (SSR emits
 * the full list); ?tag= deep-links; active tag in copper, never
 * cinnabar. Entries without href AND repo never render. Pure text —
 * nothing here may touch LCP.
 */

export default function ExperimentsIndex() {
  const router = useRouter();
  const params = useSearchParams();
  const active = (params.get("tag") as Tag | null) ?? null;

  const visible = experiments.filter((e) => e.href || e.repo);
  const counts = Object.fromEntries(
    TAGS.map((t) => [t, visible.filter((e) => e.tags.includes(t)).length])
  );
  const shown = active ? visible.filter((e) => e.tags.includes(active)) : visible;
  const featured = shown.filter((e) => e.featured);
  const rest = shown.filter((e) => !e.featured);

  const pick = (t: Tag | null) =>
    router.replace(t ? `/experiments?tag=${t}` : "/experiments", {
      scroll: false,
    });

  const Row = ({ e, big }: { e: (typeof visible)[number]; big?: boolean }) => (
    <a
      href={e.href ?? e.repo}
      target="_blank"
      rel="noreferrer"
      className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line py-4 transition-colors hover:text-bronze"
      style={{ borderBottomWidth: "0.5px" }}
    >
      <span className={big ? "font-serif text-2xl" : "font-serif text-lg"}>
        {e.name}
      </span>
      <span className="text-sm text-muted">
        {e.line.replace(/^DRAFT:\s*/, "")}
      </span>
      {/* half-filled ring: the entry exists but its line is still a
          draft. Drawn, not an emoji, so it inherits currentColor and
          the page keeps one type system. */}
      {/^DRAFT:/.test(e.line) && (
        <svg
          viewBox="0 0 12 12"
          width="9"
          height="9"
          aria-label="draft"
          className="shrink-0 self-center text-muted"
        >
          <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M6 1.5 A4.5 4.5 0 0 1 6 10.5 Z" fill="currentColor" />
        </svg>
      )}
      <span className="font-mono text-xs text-muted">{e.year}</span>
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">
        {e.tags.join(" · ")}
      </span>
      {e.credit && (
        <span className="font-mono text-[10px] tracking-wide text-wood">
          {e.credit}
        </span>
      )}
      <span aria-hidden className="ml-auto font-mono text-xs">↗</span>
    </a>
  );

  if (visible.length === 0)
    return (
      <p className="border-t border-line py-14 font-mono text-sm text-muted">
        PENDING — experiments list: content/experiments.ts (name · one
        line · year · tags · link)
      </p>
    );

  return (
    <>
      {/* 3D 标本屉: enhancement layer, same ?tag= state as the text */}
      <SpecimenDrawer active={active} />
      {/* tag 筛选行: counts are the only ornament */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-line py-4 font-mono text-xs" style={{ borderTopWidth: "0.5px" }}>
        <button
          type="button"
          onClick={() => pick(null)}
          className={
            active === null
              ? "text-bronze-text"
              : "text-muted opacity-40 transition-opacity hover:text-ink hover:opacity-100"
          }
        >
          ALL <span className="text-[10px]">{visible.length}</span>
        </button>
        {TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => pick(t)}
            className={`uppercase ${
              active === t
                ? "text-bronze-text"
                : "text-muted opacity-40 transition-opacity hover:text-ink hover:opacity-100"
            }`}
          >
            {t} <span className="text-[10px]">{counts[t]}</span>
          </button>
        ))}
      </div>
      {featured.length > 0 && (
        <section aria-label="featured">
          {featured.map((e) => (
            <Row key={e.name} e={e} big />
          ))}
        </section>
      )}
      <section>
        {rest.map((e) => (
          <Row key={e.name} e={e} />
        ))}
      </section>
    </>
  );
}
