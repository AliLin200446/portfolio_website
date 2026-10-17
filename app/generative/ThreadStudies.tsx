"use client";

import { useEffect, useRef, useState } from "react";
import editorial from "./generative.module.css";
import styles from "./the-score-cried-first.module.css";

export default function ThreadStudies() {
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
      // Start all six studies together once their media is ready.
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
    <section className={styles.section} aria-labelledby="thread-studies-title">
      <div className={editorial.heading}>
        <h2 id="thread-studies-title" className={editorial.title} style={{ scrollMarginTop: 112 }}>THREAD STUDIES</h2>
        <button type="button" className={editorial.playback} onClick={() => setPaused((value) => !value)} aria-label={paused ? "Play Thread Studies videos" : "Pause Thread Studies videos"}>
          {paused ? "PLAY" : "PAUSE"} ↗
        </button>
      </div>
      <div ref={grid} className={styles.grid}>
        {[1, 2, 3, 4, 5, 6].map((id) => (
          <video key={id} width={768} height={1344} muted loop playsInline preload="auto"
            poster={`/generative/thread-studies/${id}.jpg`} aria-label={`Thread Studies, study ${id}`} className={editorial.video}>
            <source src={`/generative/thread-studies/${id}.mp4`} type="video/mp4" />
          </video>
        ))}
      </div>
    </section>
  );
}
