'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { GenerativePiece, FilmClip } from '@/lib/generative/pieces';
import dimensions from '@/lib/generative/video-dimensions.json';
import editorial from '@/app/generative/generative.module.css';
import fashion from '@/app/generative/fashion-film.module.css';
import triptych from '@/app/generative/the-score-cried-first.module.css';
import scenes from '@/app/generative/still-scenes.module.css';
import uma from '@/app/generative/uma-wang.module.css';

// Orders and structures recovered from the original app/generative components.
export function compositionClips(piece: GenerativePiece): FilmClip[] {
  const clips = [piece.primary, ...piece.supporting];
  if (piece.id === 'lelabo') return [clips[2], clips[1], clips[0]];
  if (piece.id === 'thread-studies') return clips.slice(0, 1);
  if (piece.id === 'the-score-cried-first') return clips.slice(0, 3);
  return clips;
}
const savedTimes = new Map<string, number>();
export default function GenerativeComposition({ piece }: { piece: GenerativePiece }) {
  const host = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [failed, setFailed] = useState(false);
  const clips = compositionClips(piece);
  useEffect(() => {
    const root = host.current;
    if (!root) return;
    const videos = Array.from(root.querySelectorAll('video'));
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    let disposed = false;
    let starting = false;
    const sync = () => {
      if (paused || failed || document.hidden || !visible || motion.matches) {
        videos.forEach(video => video.pause());
        return;
      }
      if (starting || videos.some(video => video.readyState < 3) || videos.every(video => !video.paused)) return;
      if (piece.id === 'parallel-personas') {
        const time = videos[0].currentTime;
        videos.forEach(video => { video.currentTime = time; });
      }
      starting = true;
      void Promise.all(videos.map(video => video.play())).catch(() => {
        if (!disposed) { videos.forEach(video => video.pause()); setFailed(true); }
      }).finally(() => {
        starting = false;
        if (disposed || paused || document.hidden || !visible || motion.matches) videos.forEach(video => video.pause());
      });
    };
    const restore = (event: Event) => {
      const video = event.currentTarget as HTMLVideoElement;
      const time = savedTimes.get(video.getAttribute('src')!);
      if (time !== undefined) video.currentTime = Math.min(time, video.duration || time);
    };
    videos.forEach(video => { video.addEventListener('canplay', sync); video.addEventListener('loadedmetadata', restore); });
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    observer.observe(root);
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    return () => {
      disposed = true; observer.disconnect();
      document.removeEventListener('visibilitychange', sync); motion.removeEventListener('change', sync);
      videos.forEach(video => {
        savedTimes.set(video.getAttribute('src')!, video.currentTime);
        video.pause(); video.removeEventListener('canplay', sync); video.removeEventListener('loadedmetadata', restore);
      });
    };
  }, [piece, paused, failed]);
  useEffect(() => {
    const videos = Array.from(host.current?.querySelectorAll('video') ?? []);
    const media = compositionClips(piece);
    videos.forEach((video, index) => { if (!video.getAttribute('src')) video.src = media[index].src; });
    return () => videos.forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
  }, [piece]);
  const grid = piece.id === 'lelabo' ? editorial.spread
    : ['parallel-personas', 'the-score-cried-first'].includes(piece.id) ? triptych.grid
    : piece.id === 'uma-wang' ? uma.pair : piece.id === 'still-scenes' ? scenes.pair : '';
  const placements = [uma.opening, uma.portrait, uma.detail, uma.closing];
  return <div className={`gen-composition gen-composition-${piece.id}`}>
    <div ref={host} className={grid}>
      {clips.map((clip, index) => {
        const size = (dimensions as Record<string, {width:number;height:number}>)[clip.src];
        return <figure key={clip.src} className={piece.id === 'uma-wang' ? placements[index] : undefined}>
          <video src={clip.src} poster={clip.poster} width={size?.width} height={size?.height} muted={muted} loop playsInline preload="auto" className={editorial.video} aria-label={`${piece.title}, ${clip.label}`} />
        </figure>;
      })}
    </div>
    {piece.id === 'fashion-film' && <div className={`${fashion.strip} diesel-stills`}>{[1,2,3,4].map(n => <figure key={n}><Image src={`/generative/fashion-film/gs${n}.jpg`} width={3520} height={2352} sizes="(max-width:760px) 45vw, 25vw" className={fashion.still} alt={`Diesel fashion campaign, gas station study ${n}`} /></figure>)}</div>}
    <div className="gen-composition-actions">
      <button onClick={() => { if(failed) { setFailed(false); setPaused(false); } else setPaused(value=>!value); }} aria-label={paused || failed ? 'Play project videos' : 'Pause project videos'}>{paused || failed ? 'Play' : 'Pause'}</button>
      <button onClick={() => setMuted(value=>!value)} aria-pressed={!muted}>{muted ? 'Sound off' : 'Sound on'}</button>
    </div>
  </div>;
}
