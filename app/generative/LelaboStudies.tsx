"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./generative.module.css";

const films = [
  { id: "03", width: 862, height: 1074, duration: "05.04 S", label: "A monochrome detail of the LYS 41 label, glass and layered petals." },
  { id: "02", width: 860, height: 1078, duration: "05.04 S", label: "A close view of pale petals moving across the LYS 41 bottle." },
  { id: "01", width: 1176, height: 1764, duration: "04.13 S", label: "A black-and-white LYS 41 bottle framed by translucent petals." },
];

export default function LelaboStudies() {
  const spread = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { if (preference.matches) setPaused(true); };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const videos = Array.from(spread.current?.querySelectorAll("video") ?? []);
    const visible = new Set<HTMLVideoElement>();
    const sync = () => videos.forEach((video) => {
      if (!paused && !document.hidden && visible.has(video)) {
        video.muted = true;
        void video.play().catch(() => { video.controls = true; });
      } else video.pause();
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) visible.add(target as HTMLVideoElement);
        else visible.delete(target as HTMLVideoElement);
      });
      sync();
    }, { threshold: 0.05 });
    videos.forEach((video) => observer.observe(video));
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      videos.forEach((video) => video.pause());
    };
  }, [paused]);

  return (
    <section aria-labelledby="lelabo-title">
      <div className={styles.heading}>
        <div>
          <p className={styles.meta}>LYS 41 / GENERATIVE MOTION STUDIES</p>
          <h2 id="lelabo-title" className={styles.title}>LE LABO</h2>
        </div>
        <button type="button" className={styles.playback} onClick={() => setPaused((value) => !value)} aria-label={paused ? "Play videos" : "Pause videos"}>
          {paused ? "PLAY" : "PAUSE"} ↗
        </button>
      </div>
      <div ref={spread} className={styles.spread}>
        {films.map((film) => (
          <figure key={film.id}>
            <video width={film.width} height={film.height} autoPlay muted loop playsInline preload="metadata"
              poster={`/generative/lelabo/${film.id}.jpg`} aria-label={film.label} className={styles.video}>
              <source src={`/generative/lelabo/${film.id}.mp4`} type="video/mp4" />
              <a href={`/generative/lelabo/${film.id}.mp4`}>Watch film {film.id}</a>
            </video>
            <figcaption className={styles.caption}><span>{film.id}</span><span>{film.duration}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
