"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { TAGS, experiments, type Tag } from "@/content/experiments";

/*
 * EXPERIMENTS-INDEX. Filterable, data-driven, two presentations of one
 * list. Filtering is an ENHANCEMENT: no-JS renders every entry (SSR
 * emits the full list); ?tag= deep-links; active tag in copper, never
 * cinnabar. Entries without href AND repo never render.
 *
 * From 1024px up: a grid of cards that turn on hover or focus, name on
 * the front, capture on the back. Below 1024px: the line-per-piece list
 * exactly as it was. The breakpoint is the same one the 3D cabinet used
 * before it was deleted, so the phone sees no change at all.
 *
 * The turn is CSS only, no JS anywhere near the animation: a rotateY on
 * a preserve-3d parent, both faces backface-hidden. Under reduced
 * motion the card is simply already turned, because the capture is the
 * only path to it and switching animation off must not switch content
 * off. The name is repeated on the back for the same reason: whoever
 * never sees the front still has to be told what they are looking at.
 */

/** Card back, when no capture has been taken yet. A rule and a label,
 *  so it reads as a slot waiting to be filled and not as an image that
 *  failed to load. */
function EmptySlot() {
  // top of the card, not the bottom: the name and the stack live along
  // the bottom edge of every back face, and a slot marker down there
  // lands on top of them
  return (
    <div className="p-5">
      <div className="border-t border-line" />
      <span className="mt-2 block font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-widest text-muted">
        no capture yet
      </span>
    </div>
  );
}

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

  const Row = ({ e, big }: { e: (typeof visible)[number]; big?: boolean }) => {
    const to = e.href ?? e.repo ?? "";
    // Resonance points at its own case page. Sending an internal route
    // to a new tab would strand the visitor outside their own history.
    const away = !to.startsWith("/");
    return (
    <a
      href={to}
      target={away ? "_blank" : undefined}
      rel={away ? "noreferrer" : undefined}
      className="group flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line py-4 transition-colors hover:text-bronze"
      style={{ borderBottomWidth: "0.5px" }}
    >
      <span className={big ? "font-serif text-[length:var(--text-title)]" : "font-serif text-[length:var(--text-lead)]"}>
        {e.name}
      </span>
      <span className="text-[length:var(--text-body)] text-muted">
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
      <span className="font-mono font-medium text-[length:var(--text-meta)] text-muted">{e.year}</span>
      <span className="font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-widest text-muted">
        {e.tags.join(" · ")}
      </span>
      {e.credit && (
        <span className="font-mono font-medium text-[length:var(--text-meta)] tracking-wide text-wood">
          {e.credit}
        </span>
      )}
      <span aria-hidden className="ml-auto font-mono font-medium text-[length:var(--text-meta)]">
        {away ? String.fromCharCode(8599) : String.fromCharCode(8594)}
      </span>
    </a>
    );
  };

  const Card = ({ e }: { e: (typeof visible)[number] }) => {
    const to = e.href ?? e.repo ?? "";
    const away = !to.startsWith("/");
    return (
      <a
        href={to}
        target={away ? "_blank" : undefined}
        rel={away ? "noreferrer" : undefined}
        aria-label={e.name}
        className="group relative flex aspect-[4/5] flex-col items-center justify-center border-b border-r border-line p-8 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#FFB46B]"
        style={{ borderWidth: "0.5px" }}
      >
        {/* The capture, sitting IN the cell rather than filling it.
            object-contain and a max height leave paper around every
            piece, which is what lets seven captures of seven different
            shapes read as one set: a poster and a wide screenshot are
            the same object here, both floating in the same margin.
            bg-cover would have cropped each to the cell and made the
            set look like a contact sheet of accidents.

            Still a CSS background rather than an img. The grid is
            display:none below lg, and an img inside a hidden container
            is fetched anyway: they all decode at naturalWidth 1600 on a
            390px screen, loading="lazy" and all. A background-image in
            a display:none subtree is never requested, which is what
            "the phone is left alone" has to mean. */}
        {e.shot ? (
          <span
            aria-hidden
            className="block h-full w-full bg-contain bg-center bg-no-repeat transition-transform duration-500 ease-out group-hover:scale-[1.04] group-focus-visible:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            style={{ backgroundImage: `url(${e.shot})` }}
          />
        ) : (
          <EmptySlot />
        )}

        {/* The name arrives on hover, under the piece. Off by default
            because the reference this follows is a wall of work, not a
            list with pictures: the images carry the page and the label
            answers the one you stopped on. Reserved height, so nothing
            below it moves when it appears. */}
        <span className="pointer-events-none absolute inset-x-0 bottom-4 px-4 text-center font-mono font-medium text-[length:var(--text-meta)] uppercase tracking-[0.14em] text-muted opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
          {e.name}
        </span>
      </a>
    );
  };

  if (visible.length === 0)
    return (
      <p className="border-t border-line py-14 font-mono text-[length:var(--text-body)] text-muted">
        PENDING: experiments list: content/experiments.ts (name · one
        line · year · tags · link)
      </p>
    );

  return (
    <>
      {/* tag 筛选行: counts are the only ornament */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 border-t border-line py-4 font-mono font-medium text-[length:var(--text-meta)]" style={{ borderTopWidth: "0.5px" }}>
        <button
          type="button"
          onClick={() => pick(null)}
          className={
            active === null
              ? "text-bronze-text"
              : "text-muted opacity-40 transition-opacity hover:text-ink hover:opacity-100"
          }
        >
          ALL <span className="text-[length:var(--text-meta)]">{visible.length}</span>
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
            {t} <span className="text-[length:var(--text-meta)]">{counts[t]}</span>
          </button>
        ))}
      </div>
      {/* 1024 and up: the grid. Featured first, then the rest, which is
          the order the list has always used. There is no overlap with
          the home rail, so nothing here has a second opinion about
          priority to disagree with. */}
      <div className="hidden border-l border-t border-line pt-0 lg:grid lg:grid-cols-4" style={{ borderWidth: "0.5px", borderRightWidth: 0, borderBottomWidth: 0 }}>
        {[...featured, ...rest].map((e) => (
          <Card key={e.name} e={e} />
        ))}
      </div>

      {/* below 1024: untouched */}
      <div className="lg:hidden">
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
      </div>
    </>
  );
}
