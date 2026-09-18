"use client";

import { useEffect, useState } from "react";
import HalationHero from "./HalationHero";

/*
 * LIVE-FACADE (§1). The HERO becomes a facade: poster/recording (or
 * the latent comparator, or a gate frame while assets are missing) by
 * default, with `▶ run live` mounting the real site in an iframe ONLY
 * on click. The iframe does not exist in the DOM before that click
 * auto-loading a second app is unconstitutional and a budget breach;
 * LCP and first-screen weight are untouched. `open live ↗` (new tab)
 * is always present top-right. Mobile <768px never offers the iframe
 * (poster + external link only). Leaving the page unmounts everything.
 * Non-embeddable sites (frame-ancestors probe, see content/case/
 * README.md) degrade the button to the external link.
 *
 * ── `auto`, WHICH RELAXES THE RULE ABOVE ──────────────────────────
 *
 * One figure may now opt out of the click and mount on load. The rule
 * above is kept as the default rather than rewritten, because it is
 * still right for every figure that has not opted in.
 *
 * The paragraph above calls auto-loading "a budget breach" without
 * saying how large, so it was measured before being relaxed: the one
 * site this is turned on for is 3 requests, 316 kB transferred, loaded
 * in 385ms. That is about 2.6x the case route's own 119 kB of JS,
 * charged to every reader on arrival whether or not they use it.
 * Worth it for a tool whose whole pitch is that you can drive it, and
 * not worth it by default.
 *
 * "LCP untouched" also turns out to be the wrong half of the claim to
 * worry about: a cross-origin iframe's content cannot be the parent's
 * LCP element, so what is actually spent is bandwidth and CPU, not the
 * metric the original note named.
 *
 * The width gate is NOT relaxed. Below 768px `auto` is ignored.
 */

export default function LiveFacade({
  liveUrl,
  embeddable,
  poster,
  posterNote,
  motion,
  motionStill,
  base,
  auto,
}: {
  liveUrl: string;
  embeddable: boolean;
  poster?: string;
  posterNote?: string;
  /** looping resting state: the pitch is the movement, so it plays
   *  unprompted and `▶ run live` still mounts the real engine over it.
   *  Reduced motion swaps to a single frame at the source, not by
   *  hiding an animation that already downloaded. */
  motion?: string;
  motionStill?: string;
  /** "comparator" = the latent SVG instrument as the resting layer */
  base?: "comparator";
  /** mount on load rather than on click. See the note at the top. */
  auto?: boolean;
}) {
  const [clicked, setClicked] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [wide, setWide] = useState(false);
  /* Whether the width question has been answered yet. `wide` starts
   * false because the server has no viewport to measure, so on a desktop
   * the truthful answer arrives one render late. Without this flag an
   * auto figure would paint the click gate for a frame and then replace
   * it with a taller iframe box, which is a visible jump on arrival. */
  const [measured, setMeasured] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(mq.matches);
    update();
    setMeasured(true);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const canEmbed = embeddable && wide;
  const running = (clicked || auto === true) && canEmbed;
  /* The first paint of an auto figure, before the width is known. Holds
   * the iframe's own height so the swap changes content, not layout. */
  const reserving = auto === true && embeddable && !measured;

  return (
    <div className="relative">
      <div className="absolute right-0 -top-8 z-10">
        <a
          href={liveUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono font-medium text-[length:var(--text-meta)] transition-colors hover:text-bronze"
        >
          open live ↗
        </a>
      </div>

      {running || reserving ? (
        <div className="relative h-[70svh] w-full border border-line">
          {!loaded && (
            <span className="absolute left-3 top-3 font-mono font-medium text-[length:var(--text-meta)] text-muted">
              loading live …
            </span>
          )}
          {/* `reserving` renders the frame without the iframe for exactly
              one paint. The label above is already the right thing to say
              during it, so nothing else is needed to fill the box. */}
          {running && (
            <iframe
              src={liveUrl}
              title="live site"
              className="h-full w-full"
              onLoad={() => setLoaded(true)}
            />
          )}
        </div>
      ) : (
        <div className="relative">
          {base === "comparator" ? (
            <HalationHero />
          ) : motion ? (
            <picture>
              <source
                srcSet={motionStill}
                media="(prefers-reduced-motion: reduce)"
                type="image/webp"
              />
              <img
                src={motion}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full border border-line"
              />
            </picture>
          ) : poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={poster}
              alt=""
              loading="lazy"
              decoding="async"
              className="w-full border border-line"
            />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 border border-line bg-[#EDE9E0]">
              {/* Two readers reach this box and they need different
                  sentences. Without `auto` it is the desktop reader who
                  has not pressed the button yet, and "loads on click" is
                  an instruction. With `auto` the desktop reader never
                  sees this box at all, so the only one here is on a
                  screen narrower than 768 where the embed is refused on
                  purpose: telling them to click would point at a button
                  that is deliberately not rendered. They get the reason
                  and the link above instead. */}
              <span className="font-mono font-medium text-[length:var(--text-meta)] text-oxblood">
                {auto
                  ? "too narrow to run here. The real engine"
                  : "loads on click. The real engine"}
              </span>
              {auto && (
                <span className="font-mono font-medium text-[length:var(--text-meta)] text-muted">
                  open live ↗ runs it in a new tab
                </span>
              )}
              {posterNote && (
                <span className="font-mono font-medium text-[length:var(--text-meta)] text-muted">
                  {posterNote}
                </span>
              )}
            </div>
          )}
          {canEmbed && (
            <button
              type="button"
              onClick={() => setClicked(true)}
              className="absolute bottom-3 right-3 border border-ink bg-paper px-3 py-1.5 font-mono font-medium text-[length:var(--text-meta)] transition-colors hover:text-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]"
            >
              ▶ run live
            </button>
          )}
        </div>
      )}
    </div>
  );
}
