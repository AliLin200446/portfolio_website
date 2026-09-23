"use client";

import { useEffect, useRef, useState } from "react";
import editorial from "./generative.module.css";
import styles from "./uma-wang.module.css";

const scenes = [
  { id: "01", label: "UMA WANG motion study 01", width: 1088, height: 800, duration: "10.04 S" },
  { id: "02", label: "UMA WANG motion study 02", width: 1280, height: 854, duration: "03.93 S" },
];

export default function UmaWang() {
  const media = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

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
    <section className={styles.section} aria-labelledby="uma-wang-title">
      <div className={editorial.heading}>
        <div>
          <p className={editorial.meta}>GENERATIVE MOTION STUDIES</p>
          <h2 id="uma-wang-title" className={editorial.title}>UMA WANG</h2>
        </div>
        <button type="button" className={editorial.playback} onClick={() => setPaused((value) => !value)} aria-label={paused ? "Play UMA WANG videos" : "Pause UMA WANG videos"}>
          {paused ? "PLAY" : "PAUSE"} ↗
        </button>
      </div>
      <div ref={media} className={styles.pair}>
        {scenes.map((scene) => (
          <figure key={scene.id}>
            <video width={scene.width} height={scene.height} muted loop playsInline preload="metadata"
              poster={`/generative/uma-wang/${scene.id}.jpg`} aria-label={scene.label} className={editorial.video}>
              <source src={`/generative/uma-wang/${scene.id}.mp4`} type="video/mp4" />
              <a href={`/generative/uma-wang/${scene.id}.mp4`}>Watch scene {scene.id}</a>
            </video>
            <figcaption className={editorial.caption}><span>{scene.id}</span><span>{scene.duration}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
