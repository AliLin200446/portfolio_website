"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Case-page hero video. Desktop (fine pointer, ≥768px): muted autoplay loop.
 * Mobile: no autoplay — poster with an explicit play button, to spare data.
 */
export default function HeroVideo({
  src,
  poster,
}: {
  src: string;
  poster: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [needsTap, setNeedsTap] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const desktop = window.matchMedia(
      "(pointer: fine) and (min-width: 768px)",
    ).matches;
    if (desktop) {
      video.play().catch(() => setNeedsTap(true));
    } else {
      setNeedsTap(true);
    }
  }, []);

  const onPlay = () => {
    videoRef.current?.play().catch(() => {});
    setNeedsTap(false);
  };

  return (
    <div
      className="relative"
      style={{ width: "min(100%, calc(52svh * 16 / 9))" }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        className="aspect-video w-full border border-line object-cover"
      />
      {needsTap && (
        <button
          type="button"
          onClick={onPlay}
          aria-label="Play demo video"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="bg-oxblood px-5 py-3 font-mono text-sm text-paper transition-opacity hover:opacity-85">
            ▶ Play demo
          </span>
        </button>
      )}
    </div>
  );
}
