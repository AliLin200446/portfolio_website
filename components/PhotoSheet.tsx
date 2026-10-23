"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { orderedPhotos, colorSections } from "@/content/departments";
import styles from "@/app/photography/photography.module.css";

const collections = [["all", "All photographs"], ["135film", "35mm film"], ["120film", "120 film"], ["polaroid", "Instant"], ["digital", "Digital"], ["medium-format-digital", "Medium-format digital"]];
export default function PhotoSheet() {
  const [collection, setCollection] = useState("all");
  const [palette, setPalette] = useState("all");
  const [contactSheet, setContactSheet] = useState(false);
  const [limit, setLimit] = useState(18);
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const origin = useRef<HTMLButtonElement | null>(null);
  const base = palette === "all" ? orderedPhotos : colorSections.find(item => item.id === palette)!.spreads.flatMap(item => item.images);
  const photos = base.filter(item => collection === "all" || item.roll.id === collection);
  const photo = index === null ? null : photos[index];
  const move = (step: number) => setIndex(current => current === null ? null : (current + step + photos.length) % photos.length);
  useEffect(() => {
    if (index !== null && !dialog.current?.open) dialog.current?.showModal();
    if (index === null && dialog.current?.open) dialog.current.close();
  }, [index]);
  useEffect(() => {
    if (index === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [index]);
  return <div className="photo-department">
    <aside className="photo-sidebar"><div className="photo-intro"><span className="tab-meta">04 / Photography</span><h1>Ali Lin<br />{" "}<em>Photography</em></h1><p>Film, digital, and the visual judgment behind the systems.</p></div><div className="panel-label">Collections</div><nav aria-label="Photography collections">{collections.map(([id, name]) => <button key={id} aria-pressed={collection === id} onClick={() => { setCollection(id); setLimit(18); setIndex(null); }}><span>{name}</span><span className="tab-meta">{orderedPhotos.filter(item => id === "all" || item.roll.id === id).length}</span></button>)}</nav><div className="photo-options"><label htmlFor="photo-color">Color edit</label><select id="photo-color" value={palette} onChange={event => { setPalette(event.target.value); setLimit(18); setIndex(null); }}><option value="all">All colors</option>{colorSections.map(section => <option key={section.id} value={section.id}>{section.title}</option>)}</select><div className="filter-chips" role="group" aria-label="Photography layout"><button aria-pressed={!contactSheet} onClick={() => setContactSheet(false)}>Editorial</button><button aria-pressed={contactSheet} onClick={() => setContactSheet(true)}>Contact sheet</button></div><p className="tab-meta">Original proportions.<br />Select a frame to view.</p></div></aside>
    <section className="photo-gallery" aria-label="Photographs"><div className="panel-label"><span>{collections.find(([id]) => id === collection)?.[1]}</span><span aria-live="polite">{photos.length} frames</span></div><div className={`photo-editorial-grid ${contactSheet ? "photo-contact-grid" : ""}`}>{photos.slice(0, limit).map((item, i) => {
      const frame = item.roll.frames[item.frameIndex];
      return <figure key={frame.src} className={!contactSheet && item.width > item.height * 1.2 ? "photo-landscape" : undefined}><button aria-label={`View ${item.alt}`} onClick={event => { origin.current = event.currentTarget; setIndex(i); }}><Image src={frame.src} alt={item.alt} width={item.width} height={item.height} sizes={contactSheet ? "(max-width: 767px) 40vw, 200px" : "(max-width: 767px) 90vw, (max-width: 1023px) 40vw, 500px"} priority={i === 0} /></button><figcaption><span>{collections.find(([id]) => id === item.roll.id)?.[1]}</span><span>{frame.n}</span></figcaption></figure>;
    })}</div>{photos.length === 0 && <p className="photo-empty">No photographs in this collection and color edit.</p>}{limit < photos.length && <button className="load-photos" onClick={() => setLimit(value => value + 24)}>Show more / {photos.length - limit} remaining ↓</button>}</section>
    <dialog ref={dialog} className={`${styles.loupe} tab-loupe`} aria-label="Photograph viewer" onClose={() => { setIndex(null); origin.current?.focus(); }} onClick={event => { if (event.target === event.currentTarget) setIndex(null); }} onKeyDown={event => { if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1); } }}>
      {photo && <><Image src={photo.roll.frames[photo.frameIndex].src} alt={photo.alt} width={photo.width} height={photo.height} sizes="90vw" className={styles.loupeImage} priority /><p className={styles.caption} aria-live="polite">{photo.roll.format} / {photo.roll.frames[photo.frameIndex].n} · {index! + 1} of {photos.length}</p><div className={styles.viewerControls}><button type="button" aria-label="Previous photograph" onClick={() => move(-1)}>←</button><button type="button" autoFocus onClick={() => setIndex(null)}>Close / Esc</button><button type="button" aria-label="Next photograph" onClick={() => move(1)}>→</button></div></>}
    </dialog>
  </div>;
}
