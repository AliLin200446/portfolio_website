"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import PhotographyColorEdit from "./PhotographyColorEdit";
import { orderedPhotos } from "@/content/photography-color-edit";
import styles from "@/app/photography/photography.module.css";

// The full color edit shares one viewer. Plain image links remain usable without JS.
export default function PhotoSheet() {
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const photo = index === null ? null : orderedPhotos[index];
  const move = (step: number) => setIndex((current) => current === null ? null : (current + step + orderedPhotos.length) % orderedPhotos.length);

  useEffect(() => {
    if (index !== null && !dialog.current?.open) dialog.current?.showModal();
    if (index === null && dialog.current?.open) dialog.current.close();
  }, [index]);

  return <>
    <PhotographyColorEdit onOpen={(item) => setIndex(orderedPhotos.indexOf(item))} />
    <dialog ref={dialog} className={styles.loupe} aria-label="Photograph viewer" onClose={() => setIndex(null)}
      onClick={(event) => { if (event.target === event.currentTarget) setIndex(null); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}>
      {photo && <>
        <Image src={photo.roll.frames[photo.frameIndex].src} alt={photo.alt} width={photo.width} height={photo.height}
          sizes="90vw" className={styles.loupeImage} priority />
        <p className={styles.caption}>{photo.roll.format} / {photo.roll.frames[photo.frameIndex].n}</p>
        <div className={styles.viewerControls}>
          <button type="button" aria-label="Previous photograph" onClick={() => move(-1)}>←</button>
          <button type="button" autoFocus onClick={() => setIndex(null)}>ESC</button>
          <button type="button" aria-label="Next photograph" onClick={() => move(1)}>→</button>
        </div>
      </>}
    </dialog>
  </>;
}
