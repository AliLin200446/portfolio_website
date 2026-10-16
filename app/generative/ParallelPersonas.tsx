"use client";

import { useEffect, useRef, useState } from "react";
import editorial from "./generative.module.css";
import styles from "./the-score-cried-first.module.css";

export default function ParallelPersonas() {
  const grid = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { if (preference.matches) setPaused(true); };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const element = grid.current;
    if (!element) return;
    const videos = Array.from(element.querySelectorAll("video"));
    let visible = false;
    let playing = false;
    let disposed = false;
    const sync = () => {
      if (paused || document.hidden || !visible) {
        videos.forEach((video) => video.pause());
        playing = false;
        return;
      }
      // Start the triptych as one group, never as three independent autoplay loads.
      if (playing || videos.some((video) => video.readyState < 3)) return;
      const time = videos[0].currentTime;
      videos.forEach((video) => { video.muted = true; video.currentTime = time; });
      playing = true;
      void Promise.all(videos.map((video) => video.play())).catch(() => {
        if (!disposed && playing) {
          videos.forEach((video) => video.pause());
          playing = false;
          setPaused(true);
        }
      });
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: 0.05 });
    observer.observe(element);
    videos.forEach((video) => video.addEventListener("canplay", sync));
    document.addEventListener("visibilitychange", sync);
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      videos.forEach((video) => {
        video.removeEventListener("canplay", sync);
        video.pause();
      });
    };
  }, [paused]);

  return (
    <section className={styles.section} aria-labelledby="parallel-personas-title">
      <div className={editorial.heading}>
        <h2 id="parallel-personas-title" className={editorial.title} style={{ scrollMarginTop: 112 }}>PARALLEL PERSONAS</h2>
        <button type="button" className={editorial.playback} onClick={() => setPaused((value) => !value)} aria-label={paused ? "Play Parallel Personas videos" : "Pause Parallel Personas videos"}>
          {paused ? "PLAY" : "PAUSE"} ↗
        </button>
      </div>
      <div ref={grid} className={styles.grid}>
        {[1, 2, 3].map((id) => (
          <video key={id} width={720} height={1280} muted loop playsInline preload="auto"
            poster={`/generative/parallel-personas/${id}.jpg`} aria-label={`Parallel Personas, study ${id}`} className={editorial.video}>
            <source src={`/generative/parallel-personas/${id}.mp4`} type="video/mp4" />
          </video>
        ))}
      </div>
    </section>
  );
}
