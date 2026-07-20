"use client";

import { useEffect, useRef, useState } from "react";

/*
 * THE PIECE (§2②) — the specimen label's single exhibit: one large
 * looping screen recording, never a live iframe (the §6 second-WebGL
 * red line). Muted always. Playback is viewport-driven, not idle-driven
 * — it plays when the visitor walks up to it and pauses when they walk
 * away ("一切可动无一自动": entering the viewport IS the visitor's act).
 * Budget: the real video lazy-loads (preload=none, poster carries the
 * first paint), so the first screen stays text-first and under weight.
 * reduced-motion: no autoplay ever — poster + an explicit play button.
 * No src yet (author supplies the recording): poster + placeholder tag,
 * the prop is already wired.
 */

export default function SpecimenPiece({
  src,
  poster,
  placeholder,
  live,
}: {
  /** Screen-recording URL (webm/mp4). null = author hasn't supplied it. */
  src?: string | null;
  poster?: string;
  /** Mono line shown while src is absent. Never AI-filled imagery. */
  placeholder?: string;
  /** Optional live site — hard navigation, never an embedded engine. */
  live?: { url: string };
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setReduced(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  // viewport-driven playback (skipped entirely under reduced-motion)
  useEffect(() => {
    const el = video.current;
    if (!el || reduced || !src) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
          setPlaying(true);
        } else {
          el.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, src]);

  return (
    // one exhibit in its own room: about a screen of air above and below
    <section className="flex min-h-svh flex-col items-center justify-center py-24">
      <div className="w-full max-w-4xl">
        {src ? (
          <video
            ref={video}
            src={src}
            poster={poster}
            muted
            loop
            playsInline
            preload="none"
            className="w-full"
            aria-label="project screen recording"
          />
        ) : (
          <div className="relative">
            {/* poster stands in until the author's recording arrives */}
            {poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={poster} alt="" className="w-full" />
            ) : (
              <div className="aspect-video w-full bg-[#EDE9E0]" />
            )}
            <span className="absolute bottom-3 left-3 font-mono text-[10px] tracking-wide text-muted">
              {placeholder ?? "[占位:大画幅录屏]"}
            </span>
          </div>
        )}
        {/* reduced-motion: explicit play, no auto anything */}
        {src && reduced && !playing && (
          <button
            type="button"
            onClick={() => {
              video.current?.play();
              setPlaying(true);
            }}
            className="mt-4 border-b border-bronze pb-px font-mono text-xs transition-colors hover:text-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]"
          >
            play recording
          </button>
        )}
        {live && (
          <p className="mt-6 text-center">
            <a
              href={live.url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs transition-colors hover:text-bronze focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB46B]"
            >
              open live ↗
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
