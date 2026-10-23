"use client";
import Image from 'next/image';
import { useState } from 'react';

const ticks = Array.from({ length: 120 }, (_, i) => {
  const angle = i / 120 * Math.PI * 2;
  const inner = i % 10 === 0 ? 91 : i % 5 === 0 ? 93 : 95;
  return `M${(100 + Math.sin(angle) * 97.5).toFixed(2)} ${(100 - Math.cos(angle) * 97.5).toFixed(2)}L${(100 + Math.sin(angle) * inner).toFixed(2)} ${(100 - Math.cos(angle) * inner).toFixed(2)}`;
}).join('');

export default function AboutAvatar() {
  const [shots, setShots] = useState(0);
  return <figure className="about-avatar-figure">
    <button type="button" className="about-avatar" aria-label="Portrait of Ali Lin. Press to advance the film" onClick={() => setShots(n => n + 1)}>
      <svg className="avatar-ring" aria-hidden="true" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="98.5" fill="none" stroke="currentColor" strokeWidth=".5" />
        <path d={ticks} stroke="currentColor" strokeWidth=".6" fill="none" />
        <g fontFamily="var(--font-geist-mono), monospace" fontSize="5.2" fill="currentColor" textAnchor="middle">
          {['∞','10','5','3','2','1.5','1','0.7'].map((label,i) => <text key={label} transform={`rotate(${i * 20 - 60} 100 100)`} x="100" y="11">{label}</text>)}
        </g>
      </svg>
      <span className="avatar-index" aria-hidden="true" />
      <span key={shots} className={`avatar-lens${shots ? ' avatar-shot' : ''}`}>
        <Image src="/about/avatar.jpg" alt="" fill sizes="(max-width:760px) 80vw, 460px" priority />
      </span>
    </button>
    <figcaption><span>Ali Lin, New York</span><span aria-live="polite" aria-atomic="true">FRAME {String(shots % 36 + 1).padStart(2,'0')} / 36</span></figcaption>
  </figure>;
}
