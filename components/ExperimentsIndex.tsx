"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/experiments/experiments.module.css";

const studies = [
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
    <section className={styles.study} aria-labelledby={`study-${index}`}>
      <div className={styles.copy}>
        <p className={styles.category}>{String(index + 1).padStart(2, "0")} / {study.category}</p>
        <h2 id={`study-${index}`} className={styles.name}>{study.name}</h2>
        <p className={styles.description}>{study.description}</p>
        <p className={styles.hint}>{study.hint}</p>
      </div>
      <div className={styles.frame} ref={frame}>
        <div className={styles.toolbar}>
          <span className={styles.frameLabel}>{study.name} / LIVE</span>
          <div className={styles.actions}>
            <a href={study.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${study.name} in a new tab`}>OPEN SITE ↗</a>
            <button type="button" onClick={toggleFullScreen} aria-label={`${fullScreen ? "Exit" : "Enter"} fullscreen for ${study.name}`}>{fullScreen ? "EXIT FULLSCREEN ↙" : "FULLSCREEN ↗"}</button>
          </div>
        </div>
        <iframe src={study.url} title={`${study.name}: ${study.category} interactive demo`} className={styles.embed} loading={index === 0 ? "eager" : "lazy"} allow="fullscreen" allowFullScreen />
        {message && <p className={styles.notice} role="status">{message}</p>}
      </div>
    </section>
  );
}

export default function ExperimentsIndex() {
  return <div className={styles.studies}>{studies.map((study, index) => <Study key={study.name} study={study} index={index} />)}</div>;
}
