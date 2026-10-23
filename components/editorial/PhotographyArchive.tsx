"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import PhotographyColorEdit, { photoCaption } from "@/components/PhotographyColorEdit";
import { colorSections } from "@/content/photography-color-edit";
import styles from "@/app/photography/photography.module.css";

export default function PhotographyArchive() {
  const [sectionIndex, setSectionIndex] = useState(0);
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const origin = useRef<HTMLElement | null>(null);
  const section = colorSections[sectionIndex];
  const photos = section.spreads.flatMap(spread => spread.images);
  const photo = index === null ? null : photos[index];
  const move = (step: number) => setIndex(current => current === null ? null : (current + step + photos.length) % photos.length);
  const isOpen = index !== null;
  useEffect(() => {
    if (!isOpen) { dialog.current?.close(); return; }
    dialog.current?.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [isOpen]);
  return <div className={styles.archive}>
    <header className={styles.header}>
      <div className={styles.utility}><Link href="/">← Index</Link><span>Ali Lin</span></div>
      <h1 className={styles.title}>PHOTOGRAPHY</h1>
    </header>
    <nav aria-label="Photography colors" className={styles.index}>
      {colorSections.map((item, i) => <button key={item.id} aria-pressed={sectionIndex === i} aria-controls="color-collection" onClick={() => setSectionIndex(i)}>{item.title}</button>)}
    </nav>
    <PhotographyColorEdit sectionIndex={sectionIndex} onOpen={item => { origin.current = document.activeElement as HTMLElement; setIndex(photos.indexOf(item)); }} />
    <dialog ref={dialog} className={styles.loupe} aria-label="Photograph viewer" onClose={() => { setIndex(null); origin.current?.focus(); }} onClick={event => { if (event.target === event.currentTarget) setIndex(null); }} onKeyDown={event => {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); }
    }}>
      {photo && <>
        <Image src={photo.roll.frames[photo.frameIndex].src} alt={photo.alt} width={photo.width} height={photo.height} sizes="95vw" className={styles.loupeImage} priority />
        <p className={styles.caption} aria-live="polite">{photoCaption(photo)} · {index! + 1} / {photos.length}</p>
        <div className={styles.viewerControls}>
          <button aria-label="Previous photograph" onClick={() => move(-1)}>←</button>
          <button autoFocus onClick={() => setIndex(null)}>Close / Esc</button>
          <button aria-label="Next photograph" onClick={() => move(1)}>→</button>
        </div>
      </>}
    </dialog>
  </div>;
}
