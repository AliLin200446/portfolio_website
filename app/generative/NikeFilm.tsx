"use client";

import { useEffect, useRef, useState } from "react";
import editorial from "./generative.module.css";
import styles from "./still-scenes.module.css";
import filmStyles from "./fashion-film.module.css";

const scenes = [{ id: "01", label: "Nike generative film." }];

export default function NikeFilm() {
  const media = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);

  function toggleSound() {
    const video = media.current?.querySelector("video");
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (!video.muted) {
      setPaused(false);
      void video.play().catch(() => { video.controls = true; });
    }
  }

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => { if (preference.matches) setPaused(true); };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const videos = Array.from(media.current?.querySelectorAll("video") ?? []);
    const visible = new Set<HTMLVideoElement>();
    const sync = () => videos.forEach((video) => {
      if (!paused && !document.hidden && visible.has(video)) {
        void video.play().catch(() => { video.controls = true; });
      } else video.pause();
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(({ target, intersectionRatio }) => {
        if (intersectionRatio >= 0.35) visible.add(target as HTMLVideoElement);
        else visible.delete(target as HTMLVideoElement);
      });
      sync();
    }, { threshold: [0, 0.35] });
    videos.forEach((video) => observer.observe(video));
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      videos.forEach((video) => video.pause());
    };
  }, [paused]);

  return (
    <section className={styles.section} aria-labelledby="nike-title">
      <div className={editorial.heading}>
        <div>
          <p className={editorial.meta}>GENERATIVE FILM</p>
          <h2 id="nike-title" className={editorial.title}>NIKE</h2>
        </div>
        <button type="button" className={editorial.playback} onClick={() => setPaused((value) => !value)} aria-label={paused ? "Play Nike film" : "Pause Nike film"}>
          {paused ? "PLAY" : "PAUSE"} ↗
        </button>
      </div>
      <div ref={media}>
        {scenes.map((scene) => (
          <figure key={scene.id}>
            <div className={filmStyles.screen}>
            <video width={1920} height={1080} muted={muted} loop playsInline preload="metadata"
              poster="/generative/nike/poster.jpg" aria-label={scene.label} className={editorial.video}>
              <source src={"/generative/nike/film.mp4"} type="video/mp4" />
              <a href={"/generative/nike/film.mp4"}>Watch scene {scene.id}</a>
            </video>
            <button type="button" className={filmStyles.sound} onClick={toggleSound} aria-label={muted ? "Unmute Nike film" : "Mute Nike film"} aria-pressed={!muted}>
              SOUND {muted ? "OFF" : "ON"} ↗
            </button>
            </div>
            <figcaption className={editorial.caption}><span>{scene.id}</span><span>10.00 S</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
