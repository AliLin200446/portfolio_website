"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import editorial from "./generative.module.css";
import styles from "./fashion-film.module.css";

export type FashionFilmAssets = { video: boolean; poster: boolean; stills: boolean[] };
const base = "/generative/fashion-film";
const frames = ["gs1", "gs2", "gs3", "gs4"];

export default function FashionFilm({ assets }: { assets: FashionFilmAssets }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [duration, setDuration] = useState(14.27);
  const userPaused = useRef(false);
  const [ratio, setRatio] = useState("3234 / 2160");

  useEffect(() => {
    const film = video.current;
    if (!film) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => {
      if (!visible || document.hidden || preference.matches || userPaused.current) film.pause();
      else void film.play().catch(() => setPlaying(false));
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.intersectionRatio >= 0.35;
      sync();
    }, { threshold: [0, 0.35] });
    observer.observe(film);
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      film.pause();
    };
  }, []);

  const toggle = () => {
    const film = video.current;
    if (!film) return;
    userPaused.current = !film.paused;
    if (film.paused) void film.play().catch(() => setPlaying(false));
    else film.pause();
  };

  return (
    <section className={styles.section} aria-labelledby="fashion-film-title">
      <div className={`${editorial.heading} ${styles.header}`}>
        <div>
          <p className={editorial.meta}>AI FASHION FILM / GENERATIVE MOTION STUDY</p>
          <h2 id="fashion-film-title" className={editorial.title}>DIESEL FASHION FILM</h2>
        </div>
        <p className={`${editorial.meta} ${styles.details}`}>FILM / {duration.toFixed(2)} S<br />2026</p>
      </div>
      <figure className={styles.hero}>
        <div className={styles.screen} style={{ aspectRatio: ratio }}>
          {assets.poster && <Image fill sizes="(max-width: 1024px) 100vw, 976px" className={styles.poster} src={`${base}/poster.jpg`} alt="Fashion film opening frame" />}
          {assets.video ? <>
            <video ref={video} muted loop playsInline preload="metadata" poster={assets.poster ? `${base}/poster.jpg` : undefined}
              className={`${styles.video} ${ready ? styles.ready : ""}`} aria-label="Fashion campaign film"
              onPlaying={() => { setPlaying(true); setReady(true); }} onPause={() => setPlaying(false)}
              onLoadedData={() => setReady(true)} onLoadedMetadata={(event) => {
                const film = event.currentTarget;
                if (film.videoWidth && film.videoHeight) setRatio(`${film.videoWidth} / ${film.videoHeight}`);
                if (Number.isFinite(film.duration)) setDuration(film.duration);
              }}>
              <source src={`${base}/film.mp4`} type="video/mp4" />
            </video>
            <button type="button" className={styles.toggle} onClick={toggle} aria-label={playing ? "Pause fashion film" : "Play fashion film"}>
              <span>{playing ? "PAUSE" : "PLAY"} ↗</span>
            </button>
          </> : !assets.poster && <span className={editorial.meta}>FILM / AWAITING FINAL CUT</span>}
        </div>
        <figcaption className={editorial.caption}><span>01</span><span>00.00 S – {duration.toFixed(2)} S</span></figcaption>
      </figure>
      <div className={styles.strip}>
        {frames.map((frame, index) => <figure key={frame}>
          {assets.stills[index] ? <Image width={3520} height={2352} sizes="(max-width: 1024px) 50vw, 476px" className={styles.still} src={`${base}/${frame}.jpg`} alt={`Diesel fashion campaign, gas station study ${index + 1}`} loading="lazy" /> :
            <div className={styles.placeholder}><span className={editorial.meta}>SELECTED FRAME / PENDING</span></div>}
          <figcaption className={editorial.caption}><span>0{index + 2}</span><span>{frame.toUpperCase()}</span></figcaption>
        </figure>)}
      </div>
      <div className={styles.process}>
        <h3 className={editorial.meta}>PROCESS</h3>
        <div>
          <p>An AI-generated fashion film exploring continuous camera movement, material reflection, and cinematic image sequencing.</p>
          <p className={`${editorial.meta} ${styles.technical}`}>GENERATIVE VIDEO / LATENT FILM PROCESSING / 2026</p>
        </div>
      </div>
    </section>
  );
}
