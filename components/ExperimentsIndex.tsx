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
      <span className="mt-2 block font-mono text-[10px] uppercase tracking-widest text-muted">
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
      <span className={big ? "font-serif text-3xl" : "font-serif text-xl"}>
        {e.name}
      </span>
      <span className="text-base text-muted">
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
      <span aria-hidden className="ml-auto font-mono text-xs">
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
        className="group block aspect-[16/10] outline-none [perspective:1100px]"
      >
        <div
          className="relative h-full w-full transition-transform duration-[400ms] ease-out [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)] group-focus-visible:[transform:rotateY(180deg)] motion-reduce:transition-none motion-reduce:[transform:rotateY(180deg)]"
        >
          {/* front: the name and nothing else, inside a bronze
              hairline. Bronze rather than the usual line grey because
              the front of a card is an invitation and the grey reads as
              a container; it is held to 0.5px and 55 percent so five of
              them together stay a texture rather than five frames
              competing for the same attention. Cinnabar is still spoken
              for: it belongs to the one card being turned. */}
          <div
            className="absolute inset-0 flex flex-col justify-end p-5 [backface-visibility:hidden]"
            style={{ border: "0.5px solid color-mix(in srgb, var(--bronze) 55%, transparent)" }}
          >
            <span className="font-serif text-2xl leading-tight">{e.name}</span>
          </div>

          {/* back: the capture, or the slot where it will go */}
          <div
            className="absolute inset-0 overflow-hidden border border-line [backface-visibility:hidden] [transform:rotateY(180deg)] group-hover:border-oxblood group-focus-visible:border-oxblood"
            style={{ borderWidth: "0.5px" }}
          >
            {e.shot ? (
              <>
                {/* A CSS background, not an img.
                    The grid is display:none below 1024, and an img
                    inside a hidden container is fetched anyway: all
                    four decoded at naturalWidth 1600 on a 390px screen,
                    loading="lazy" and all. A background-image in a
                    display:none subtree is never requested, which is
                    what "the phone is left alone" has to mean. alt was
                    empty regardless: the name sits next to it in text. */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${e.shot})` }}
                />
                {/* Weighted to the bottom, not flat. These captures
                    are not one family: Lethe is near black and Aura is
                    near white, and a flat scrim dark enough to carry
                    paper-coloured type over the white one buries the
                    black one. A gradient puts the density where the
                    type is and leaves the rest of the frame legible. */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(26,23,20,0.12) 0%, rgba(26,23,20,0.30) 45%, rgba(26,23,20,0.82) 100%)",
                  }}
                />
              </>
            ) : (
              <EmptySlot />
            )}
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5">
              <span
                className={`font-serif text-2xl leading-tight ${
                  e.shot ? "text-paper" : "text-ink"
                }`}
              >
                {e.name}
              </span>
              {e.stack && (
                <span
                  className={`font-mono text-[10px] uppercase tracking-widest ${
                    e.shot ? "text-paper/75" : "text-muted"
                  }`}
                >
                  {e.stack}
                </span>
              )}
            </div>
          </div>
        </div>
      </a>
    );
  };

  if (visible.length === 0)
    return (
      <p className="border-t border-line py-14 font-mono text-sm text-muted">
        PENDING: experiments list: content/experiments.ts (name · one
        line · year · tags · link)
      </p>
    );

  return (
    <>
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
      {/* 1024 and up: the grid. Featured first, then the rest, which is
          the order the list has always used. There is no overlap with
          the home rail, so nothing here has a second opinion about
          priority to disagree with. */}
      <div className="hidden gap-5 pt-2 lg:grid lg:grid-cols-3">
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
