"use client";
import { TickUp } from "@/interaction/components/TickUp";
import Image from 'next/image';
import { FilmCover } from '@/components/FilmCover';
import { createContext, useContext, useEffect, useRef, useState, type CSSProperties } from 'react';
import { chapters, photographs, photoById, spreads, type Placement, type Spread } from '@/content/photobook';

const Preview = createContext(false);
function EditorialImage({ placement, mobile = false }: { placement: Placement; mobile?: boolean }) {
  const preview = useContext(Preview);
  const photo = photoById[placement.photoId];
  const style = mobile ? undefined : { left:`${placement.x}%`,top:`${placement.y}%`,width:`${placement.width * placement.scale}%`,height:`${placement.height * placement.scale}%` };
  return <figure className={`book-art-image caption-${placement.captionPosition}${mobile ? ' book-art-mobile-image' : ''}`} style={style} data-photo-id={photo.id}>
    <div className="book-art-photo"><Image src={preview ? photo.thumb : photo.src} alt={preview ? '' : photo.alt} fill sizes={preview ? '48px' : placement.page === 'both' ? '90vw' : '(max-width:760px) 85vw, 50vw'} loading={preview ? 'lazy' : 'eager'} style={{ objectFit: mobile ? 'contain' : placement.crop, objectPosition:placement.objectPosition }} /></div>
    {placement.captionPosition !== 'none' && <figcaption>{placement.caption}</figcaption>}
  </figure>;
}
function CrossGutter({ spread }: { spread: Spread }) {
  const placement = spread.placements.find(p => p.page === 'both');
  return placement ? <div className="book-art-cross"><EditorialImage placement={placement} /><span className="book-art-gutter" /></div> : null;
}
function BookPage({ spread, side, number, active }: { spread: Spread; side: number; number: number; active: boolean }) {
  const preview = useContext(Preview);
  const chapter = chapters.find(c => c.id === spread.chapter)!;
  const cross = spread.placements.find(p => p.page === 'both');
  let content;
  if (spread.layout === 'cover') content = side === 0 ? (preview ? null : <FilmCover gutter="right" />) : <div className="book-cover-copy"><div><span>Vol. 01 / 2026</span><div className="book-cover-title">{preview ? <span>Ali Lin<br /><em>Photography</em></span> : <h1>Ali Lin<br /><em>Photography</em></h1>}</div></div><p>Film, digital, and the visual judgment behind the systems.</p></div>;
  else if (spread.layout === 'colophon') content = side === 1 ? null : <div className="book-colophon"><h2>Colophon</h2><p>Photographs by Ali Lin.</p><p>35mm and 120 film, instant, digital and medium-format digital.</p><p>Digital edition · 2026.<br />Photograph dates are not documented.</p><p>Set in Geist, Geist Mono and Spectral.</p>{preview ? <span>Print inquiries ↗</span> : <a href="mailto:alilin406@outlook.com">Print inquiries ↗</a>}<small>Contact to discuss prints and availability.</small></div>;
  else content = <>
    {spread.layout === 'typographic-interlude' && side === 0 && <div className="book-art-interlude"><span>{chapter.label.split(' ')[0]} / {photographs.filter(p => p.category === chapter.id).length} photographs</span><h2><em>{chapter.title}</em></h2><span className="book-art-rule" /></div>}
    {spread.placements.filter(p => p.page === side).map(p => <EditorialImage key={p.photoId} placement={p} />)}
    {spread.layout === 'image-silence' && side === 1 && <p className="book-art-silence">{spread.placements[0].caption}</p>}
    {cross && <div className="book-art-mobile-cross">{side === 0 ? <EditorialImage placement={cross} mobile /> : <p className="book-art-silence">{cross.caption}<br />{photoById[cross.photoId].alt}</p>}</div>}
  </>;
  const solid = (spread.layout === 'cover' && side === 0) || (spread.layout === 'colophon' && side === 1);
  const style = ['cover','colophon'].includes(spread.layout) ? undefined : { backgroundColor:spread.background[side], '--book-caption-ink': spread.layout === 'dark-editorial' ? '#d4d1ca' : '#6b6b66' } as CSSProperties;
  return <div className={`book-page book-page-${side}${solid ? ' book-solid' : ''}`} style={style} data-visible={active} aria-hidden={!active || undefined}>{!['cover','colophon'].includes(spread.layout) && <span className="book-running">{side === 0 ? 'photography' : 'Ali Lin'}</span>}{content}{!solid && spread.layout !== 'cover' && <span className="book-folio">{number}</span>}</div>;
}
export default function Photobook() {
  // Cursor tracks individual pages. Cover opens on its title page in mobile mode.
  const [cursor, setCursor] = useState(1);
  const [mobile, setMobile] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const chapterNav = useRef<HTMLElement>(null);
  const thumbnails = useRef<HTMLElement>(null);
  const index = Math.floor(cursor / 2), spread = spreads[index], lastPage = (spreads.length - 1) * 2;
  const pick = (i: number) => setCursor(i === 0 ? 1 : i * 2);
  const move = (delta: number) => setCursor(current => mobile ? Math.max(1, Math.min(lastPage, current + delta)) : Math.max(1, Math.min(lastPage, (Math.floor(current / 2) + delta) * 2)));
  useEffect(() => { const query = matchMedia('(max-width: 760px)'); const sync = () => setMobile(query.matches); sync(); query.addEventListener('change', sync); return () => query.removeEventListener('change', sync); }, []);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.target as HTMLElement).closest('input,textarea,select,[contenteditable],dialog[open]') || event.altKey || event.metaKey || event.ctrlKey) return;
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      setCursor(current => event.key === 'Home' ? 1 : event.key === 'End' ? lastPage : mobile ? Math.max(1, Math.min(lastPage, current + (event.key === 'ArrowRight' ? 1 : -1))) : Math.max(1, Math.min(lastPage, (Math.floor(current / 2) + (event.key === 'ArrowRight' ? 1 : -1)) * 2)));
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [mobile, lastPage]);
  useEffect(() => {
    for (const nav of [chapterNav.current, thumbnails.current]) { const active = nav?.querySelector<HTMLElement>('[aria-current]'); if (nav && active) nav.scrollLeft = active.offsetLeft - nav.offsetLeft - nav.clientWidth / 2 + active.clientWidth / 2; }
  }, [index, mobile]);
  const chapter = chapters.find(c => c.id === spread.chapter)!;
  const adjacent = [spreads[index - 1], spreads[index + 1]].filter(Boolean).flatMap(s => s.photographIds);
  return <>
    {index !== 0 && <h1 className="book-sr-only">Ali Lin Photography</h1>}
    <div className="book-chapter-bar"><span>Contents</span><nav ref={chapterNav} aria-label="Chapters">{chapters.map(c => <button key={c.id} aria-current={spread.chapter === c.id ? 'location' : undefined} onClick={() => pick(spreads.findIndex(s => s.chapter === c.id))}>{c.label}</button>)}</nav><span><TickUp value={photographs.length} /> frames</span></div>
    <section className="book-stage" aria-label="Photobook" onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={event => { if (!touch.current || !mobile) return; const dx = event.changedTouches[0].clientX - touch.current.x, dy = event.changedTouches[0].clientY - touch.current.y; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1); touch.current = null; }}>
      <div className={`book-spread book-layout-${spread.layout}`} data-spread-id={spread.id} data-layout={spread.layout} key={cursor} data-selected-side={cursor % 2}>
        {[0,1].map(side => <BookPage key={side} spread={spread} side={side} number={spread.pageNumbers[side]} active={!mobile || cursor % 2 === side} />)}
        <CrossGutter spread={spread} />
      </div>
    </section>
    <div className="book-controls"><button aria-label={mobile ? 'Previous page' : 'Previous spread'} disabled={mobile ? cursor === 1 : index === 0} onClick={() => move(-1)}>← Prev</button><p aria-live="polite" aria-atomic="true"><span>{mobile ? `Page ${String(cursor).padStart(2,'0')} / ${lastPage}` : `Spread ${String(index + 1).padStart(2,'0')} / ${spreads.length}`}</span><span>{chapter.title}</span></p><button aria-label={mobile ? 'Next page' : 'Next spread'} disabled={mobile ? cursor === lastPage : index === spreads.length - 1} onClick={() => move(1)}>Next →</button></div>
    <nav className="book-thumbnails" aria-label="Spreads" ref={thumbnails}>{spreads.map((s, i) => <button key={s.id} onClick={() => pick(i)} aria-label={`Spread ${i + 1}, ${chapters.find(c => c.id === s.chapter)!.title}`} aria-current={index === i ? 'location' : undefined}><span className={`book-thumbnail book-thumbnail-${s.layout}`} aria-hidden="true"><Preview.Provider value={true}><span className={`book-spread book-layout-${s.layout}`}>
        {[0,1].map(side => <BookPage key={side} spread={s} side={side} number={s.pageNumbers[side]} active />)}
        <CrossGutter spread={s} />
      </span></Preview.Provider></span><span>{String(i + 1).padStart(2,'0')}</span></button>)}</nav>
    <div className="book-preload" aria-hidden="true">{adjacent.map(id => <Image key={id} src={photoById[id].src} alt="" width={photoById[id].width} height={photoById[id].height} sizes="(max-width: 760px) 85vw, (max-width: 1200px) 40vw, 520px" loading="eager" fetchPriority="low" />)}</div>
  </>;
}
