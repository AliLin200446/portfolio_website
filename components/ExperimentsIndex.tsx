"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import styles from "@/app/experiments/experiments.module.css";

type Experiment = {
  name: string; category: string; description: string; url: string;
  hint?: string; tags?: string[];
  preview?: { image: string; video?: string; alt: string };
};

const studies: Experiment[] = [
  { name: "TAILOR’S TIME", category: "Creative Coding", description: "A tailor’s clock built from thread, chalk, sound, and time.", tags: ["WEBGL", "INTERACTION", "SOUND"], url: "https://tailorstime.alilinlab.com/", preview: { image: "/experiments/tailors-time/preview.png", alt: "A tailoring clock with scissor hands, a pinned measuring tape and loose thread on a warm red clock face." } },
  { name: "RUNS", category: "Motion Design", description: "An interactive motion study of portrait comparisons and composition.", hint: "Play the sequence or select a portrait to compare.", url: "https://runs.alilinlab.com/" },
  { name: "Material Memory", category: "Material Simulation", description: "A real-time fabric study exploring drape, weight, and response to touch.", hint: "Explore the material controls and interact with the fabric.", url: "https://material-memory.alilinlab.com/" },
  { name: "Cyber I Ching", category: "Generative Interaction", description: "Ethereum block hashes translated into I Ching hexagrams.", hint: "Explore the live system inside the window.", url: "https://iching.alilinlab.com/" },
];

function Study({ study, index }: { study: typeof studies[number]; index: number }) {
  const frame = useRef<HTMLDivElement>(null);
  const [fullScreen, setFullScreen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const update = () => setFullScreen(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  async function toggleFullScreen() {
    try {
      if (document.fullscreenElement === frame.current) await document.exitFullscreen();
      else if (frame.current?.requestFullscreen) await frame.current.requestFullscreen();
      else setMessage("Fullscreen is unavailable in this browser. Use Open Site to interact in a full tab.");
    } catch {
      setMessage("Fullscreen is unavailable in this browser. Use Open Site to interact in a full tab.");
    }
  }

  return (
    <section className={`${styles.study} ${study.preview ? styles.previewStudy : ""}`} aria-labelledby={`study-${index}`}>
      <div className={styles.copy}>
        <p className={styles.category}>{String(index + 1).padStart(2, "0")} / {study.category}</p>
        <h2 id={`study-${index}`} className={styles.name}>{study.name}</h2>
        <p className={styles.description}>{study.description}</p>
        {study.hint && <p className={styles.hint}>{study.hint}</p>}
        {study.tags && <p className={styles.tags}>{study.tags.join(" · ")}</p>}
        {study.preview && <a className={styles.openExperiment} href={study.url} target="_blank" rel="noopener noreferrer">OPEN EXPERIMENT ↗<span className="sr-only"> (opens in a new tab)</span></a>}
      </div>
      <div className={styles.frame} ref={frame}>
        {study.preview ? (
          <a className={styles.previewLink} href={study.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${study.name} in a new tab`}>
            {study.preview.video ? (
              <video className={styles.previewMedia} poster={study.preview.image} autoPlay muted loop playsInline preload="metadata" aria-label={study.preview.alt}>
                <source src={study.preview.video} type="video/mp4" />
              </video>
            ) : <Image className={styles.previewMedia} src={study.preview.image} alt={study.preview.alt} width={1280} height={720} sizes="(max-width: 899px) calc(100vw - 48px), 880px" priority={index === 0} />}
          </a>
        ) : <>
        <div className={styles.toolbar}>
          <span className={styles.frameLabel}>{study.name} / LIVE</span>
          <div className={styles.actions}>
            <a href={study.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${study.name} in a new tab`}>OPEN SITE ↗</a>
            <button type="button" onClick={toggleFullScreen} aria-label={`${fullScreen ? "Exit" : "Enter"} fullscreen for ${study.name}`}>{fullScreen ? "EXIT FULLSCREEN ↙" : "FULLSCREEN ↗"}</button>
          </div>
        </div>
        <iframe src={study.name === "Material Memory" ? `${process.env.NEXT_PUBLIC_MATERIAL_MEMORY_EMBED_URL ?? study.url}?embed=1` : study.url} title={`${study.name}: ${study.category} interactive demo`} className={styles.embed} loading={index === 0 ? "eager" : "lazy"} allow="fullscreen" allowFullScreen />
        {message && <p className={styles.notice} role="status">{message}</p>}
        </>}
      </div>
    </section>
  );
}

export default function ExperimentsIndex() {
  return <div className={styles.studies}>{studies.map((study, index) => <Study key={study.name} study={study} index={index} />)}</div>;
}
