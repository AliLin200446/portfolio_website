"use client";

import { useEffect, useRef, useState } from "react";
import editorial from "./generative.module.css";
import styles from "./the-score-cried-first.module.css";

export default function LoeweFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { if (preference.matches) setPaused(true); };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;
    const videos = [element];
    let visible = false;
    let playing = false;
    let disposed = false;
    const sync = () => {
      if (paused || document.hidden || !visible) {
        videos.forEach((video) => video.pause());
        playing = false;
        return;
      }
      if (playing || videos.some((video) => video.readyState < 3)) return;
      element.muted = true;
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
    <section className={styles.section} aria-labelledby="loewe-title">
      <div className={editorial.heading}>
        <h2 id="loewe-title" className={editorial.title} style={{ scrollMarginTop: 112 }}>LOEWE PERFUME</h2>
        <button type="button" className={editorial.playback} onClick={() => setPaused((value) => !value)} aria-label={paused ? "Play Loewe Perfume video" : "Pause Loewe Perfume video"}>
          {paused ? "PLAY" : "PAUSE"} ↗
        </button>
      </div>
      <video ref={videoRef} width={1080} height={1920} muted loop playsInline preload="auto"
        poster="/generative/loewe/film.jpg" aria-label="Loewe Perfume, integrated film" className={editorial.video} style={{ maxWidth: 480, marginInline: "auto" }}>
        <source src="/generative/loewe/film.mp4" type="video/mp4" />
      </video>
    </section>
  );
}
