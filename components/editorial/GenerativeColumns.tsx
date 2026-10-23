'use client';

import { useEffect, useRef, useState } from 'react';
import { pieces } from '@/lib/generative/pieces';
import GenerativeComposition, { compositionClips } from './GenerativeComposition';
import Image from 'next/image';

const PAGE_SIZE = 5;

export default function GenerativeColumns() {
  const [page, setPage] = useState(0);
  const definitions = pieces;
  const pageCount = Math.ceil(definitions.length / PAGE_SIZE);
  const [active, setActive] = useState<number | null>(0);
  const [full, setFull] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const focusOpened = useRef(false);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  const cancel = () => { if (timer.current) clearTimeout(timer.current); };
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => {
    if (full !== null && !dialog.current?.open) dialog.current?.showModal();
  }, [full]);
  useEffect(() => {
    if (focusOpened.current && active !== null) { triggers.current[active]?.focus(); focusOpened.current = false; }
  }, [active]);
  useEffect(() => {
    if (full === null) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [full]);
  const open = (i: number, focus = false) => { cancel(); focusOpened.current = focus; setActive(i); };
  const expand = (i: number) => { open(i); setFull(i); };
  const number = (i: number) => String(definitions[i].order).padStart(2, '0');
  const formatCount = (n: number) => String(n).padStart(2, '0');
  const count = (i: number) => definitions[i].mediaType;
  const clips = (i: number) => compositionClips(definitions[i]);
  const drawing = (i: number, thumbnail = false) => thumbnail
    ? <Image src={definitions[i].primary.poster} alt={`${definitions[i].title} preview`} fill sizes="(max-width:760px) 90vw, 20vw" className="gen-poster" />
    : <GenerativeComposition key={definitions[i].id} piece={definitions[i]} />;
  const details = (i: number) => <div className="gen-film-details"><p>{definitions[i].description}</p></div>;
  const changePage = (next: number) => { cancel(); setActive(null); setPage(next); };
  return <>
    <h1 className="sr-only">Generative works</h1>
    <section className="gen-stage" aria-label="Generative works" onPointerLeave={e => {
      if (e.pointerType !== 'mouse') return;
      cancel();
      timer.current = setTimeout(() => { if (!document.querySelector('.gen-stage :focus') && !dialog.current?.open) setActive(null); }, 250);
    }} onKeyDown={e => { if (e.key === 'Escape') { cancel(); setActive(null); } }}>
      {definitions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((d, localIndex) => { const i = page * PAGE_SIZE + localIndex; return <article key={d.title} className="gen-column" data-state={active === null ? 'normal' : active === i ? 'open' : 'collapsed'} onPointerEnter={e => {
        if (e.pointerType !== 'mouse') return;
        cancel(); timer.current = setTimeout(() => open(i), 110);
      }}>
        <div className="gen-normal" aria-hidden={active !== null}>
          <span className="gen-label">{localIndex === 0 ? `Generative · ${formatCount(definitions.length)} works` : '\u00a0'}</span>
          <span className="gen-number">{number(i)}</span>
          <button className="gen-title" tabIndex={active === null ? 0 : -1} onClick={() => expand(i)} aria-label={`${d.title}, open full screen`}><strong>{d.title}</strong><span>{count(i)}</span></button>
          <button className="gen-thumb" style={{background:d.background}} tabIndex={active === null ? 0 : -1} aria-label={`Explore ${d.title}`} onClick={() => open(i, true)}>{drawing(i, true)}</button>
          <span className="gen-date">{clips(i).length} {clips(i).length === 1 ? 'film' : 'clips'}</span>
        </div>
        <button className="gen-strip" aria-label={`Explore ${d.title}`} hidden={active === null || active === i} onClick={() => open(i, true)}><span className="gen-number">{number(i)}</span><span>{d.title}</span></button>
        {active === i && <div className="gen-open" style={{background:d.background,color:d.foreground}}>
          <div className="gen-open-title"><span className="gen-number" >{number(i)}</span><button ref={el => {triggers.current[i] = el;}} onClick={() => expand(i)}>{d.title}</button><span>{count(i)}</span></div>
          {full === null && drawing(i)}<div className="gen-controls">{details(i)}<button onClick={() => expand(i)}>Full screen ⤢</button><button aria-label="Show all works" onClick={() => {cancel(); setActive(null);}}>×</button></div>
        </div>}
      </article>; })}
    </section>
    <footer className="gen-footer"><span>Hover to preview · click a title for full screen</span><nav aria-label="Gallery pages"><button disabled={page === 0} onClick={() => changePage(page - 1)}>Previous</button><span aria-live="polite">{formatCount(page + 1)} / {formatCount(pageCount)}</span><button disabled={page === pageCount - 1} onClick={() => changePage(page + 1)}>Next</button></nav></footer>
    <dialog ref={dialog} className="gen-dialog" aria-label={full === null ? 'Generative artwork' : `${definitions[full].title} full screen`} onClose={() => {const previous=full; setFull(null); if(previous !== null) triggers.current[previous]?.focus();}}>
      {full !== null && <div className="gen-full" style={{background:definitions[full].background,color:definitions[full].foreground}}><div className="gen-open-title"><span className="gen-number">{number(full)}</span><strong>{definitions[full].title}</strong><span>{count(full)}</span></div>{drawing(full)}<div className="gen-controls">{details(full)}<button autoFocus aria-label="Close full screen" onClick={() => dialog.current?.close()}>Close ×</button></div></div>}
    </dialog>
  </>;
}
