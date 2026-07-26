"use client";

import { useEffect, useState } from "react";
import HalationHero from "./HalationHero";

/*
 * LIVE-FACADE (§1) — the HERO becomes a facade: poster/recording (or
 * the latent comparator, or a gate frame while assets are missing) by
 * default, with `▶ run live` mounting the real site in an iframe ONLY
 * on click. The iframe does not exist in the DOM before that click —
 * auto-loading a second app is unconstitutional and a budget breach;
 * LCP and first-screen weight are untouched. `open live ↗` (new tab)
 * is always present top-right. Mobile <768px never offers the iframe
 * (poster + external link only). Leaving the page unmounts everything.
 * Non-embeddable sites (frame-ancestors probe, see content/case/
 * README.md) degrade the button to the external link.
 */

export default function LiveFacade({
  liveUrl,
  embeddable,
  poster,
  posterNote,
  motion,
  motionStill,
  base,
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
}) {
  const [running, setRunning] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const canEmbed = embeddable && wide;

  return (
    <div className="relative">
      <div className="absolute right-0 -top-8 z-10">
        <a
          href={liveUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] transition-colors hover:text-bronze"
        >
          open live ↗
        </a>
      </div>

      {running && canEmbed ? (
        <div className="relative h-[70svh] w-full border border-line">
          {!loaded && (
            <span className="absolute left-3 top-3 font-mono text-[11px] text-muted">
              loading live …
            </span>
          )}
          <iframe
            src={liveUrl}
            title="live site"
            className="h-full w-full"
            onLoad={() => setLoaded(true)}
          />
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
              <span className="font-mono text-xs text-oxblood">
                loads on click — the real engine
              </span>
              {posterNote && (
                <span className="font-mono text-[11px] text-muted">
                  {posterNote}
                </span>
              )}
            </div>
          )}
          {canEmbed && (
            <button
              type="button"
              onClick={() => setRunning(true)}
              className="absolute bottom-3 right-3 border border-ink bg-paper px-3 py-1.5 font-mono text-[11px] transition-colors hover:text-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]"
            >
              ▶ run live
            </button>
          )}
        </div>
      )}
    </div>
  );
}
