'use client';
import { useState } from 'react';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { pinnedExperiments } from '@/content/experiment-board';

const colors = ['#5B2A30','#7A3A40','#A94A2E','#C66A3E','#D9A05B','#E8C77E','#8A6A3A','#A88A55','#C4AA80','#D8C6A3','#E9DEC8','#F3EDE1','#2E3A4A','#3F5466','#5C7486','#8399A6','#ADBDC4','#D3DCDF','#2F3B2E','#4A5A42','#6F7E5E','#96A283','#BCC4AA','#DCE0D0','#111111','#3A3A37','#66665F','#9A9A94','#C9C8C3','#ECEBE7'];
function Pin() { return <span className="notice-pin" aria-hidden="true" />; }
export default function ExperimentsPanel() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const active = hovered ?? focused;
  const interactions = (id:string) => ({ onPointerEnter: () => setHovered(id), onPointerLeave: () => setHovered(null), onFocus: () => setFocused(id), onBlur: () => setFocused(null) });
  return <>
    <div className="notice-strip"><span>02 / Experiments</span><span>{String(pinnedExperiments.length).padStart(2,'0')} pinned</span><span>Hover a poster · open a live experiment ↗</span></div>
    <section className="notice-board" aria-label="Experiments notice board">
      <div className="notice-note notice-title"><h1>Experiments</h1><p>Things I build to find out.</p></div>
      {pinnedExperiments.map((item,index)=>{
        const style = {left:`${item.left}%`,top:`${item.top}%`,width:`${item.width}%`,'--rotation':`${item.rotation}deg`} as CSSProperties;
        return <a key={item.id} className={`notice-poster ${item.frame ? 'notice-framed' : 'notice-print'} ${item.fixing}`} data-active={active===item.id} data-piece={item.id} data-nav-item href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`${item.name}, open live site in a new tab`} style={style} {...interactions(item.id)}>
          {item.fixing.startsWith('pin') && <Pin />}{item.fixing==='tape' && <span className="notice-tape" aria-hidden="true" />}
          <div className={`notice-art ${item.id}`} style={{aspectRatio:item.ratio,background:item.background}}>{item.image ? <Image src={item.image} alt="" fill sizes="(max-width:760px) 90vw, 26vw" style={{objectPosition:item.objectPosition}} /> : <><span>coodie.ai</span><strong>coodie</strong></>}</div>
          <span className="notice-caption">E.{String(index+1).padStart(2,'0')} {item.name} ↗</span>
        </a>;
      })}
      <div className="notice-swatches notice-deco" aria-hidden="true">{['#A94A2E','#C4AA80','#33332E'].map(color=><span key={color} style={{background:color}} />)}</div>
      <div className="notice-note notice-chart notice-deco" aria-hidden="true"><div>{colors.map(color=><span key={color} style={{background:color}} />)}</div></div>
      <nav className="notice-note notice-index" aria-label="Experiment index"><div>INDEX · {String(pinnedExperiments.length).padStart(2,'0')} experiments</div>{pinnedExperiments.map((item,index)=><a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer" data-active={active===item.id} data-index-piece={item.id} {...interactions(item.id)}><span>{String(index+1).padStart(2,'0')}</span>{item.name}<span aria-hidden="true">↗</span></a>)}</nav>
    </section>
    <footer className="notice-footer"><span>Linked posters open in a new tab</span><span>© 2026 Ali Lin Lab LLC</span></footer>
  </>;
}
