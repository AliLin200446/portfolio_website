'use client';
import { useEffect, useRef } from 'react';
import type { GenerativePiece, FilmClip } from '@/lib/generative/pieces';
import dimensions from '@/lib/generative/video-dimensions.json';
import type { CSSProperties } from 'react';
import type { Playback } from '@/lib/generative/video-adapter';

const positions = new Map<string, Playback>();
export default function GenerativeVideo({ piece, clip }: { piece: GenerativePiece; clip: FilmClip }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    let player: { destroy(): void } | undefined;
    void piece.renderer().then(adapter => {
      if (cancelled || !host.current) return;
      player = adapter.mount(host.current, { ...clip, objectPosition: piece.objectPosition, title: `${piece.title}, ${clip.label}`, playback: positions.get(clip.src), save: state => positions.set(clip.src, state) });
    });
    return () => { cancelled = true; player?.destroy(); };
  }, [piece, clip]);
  const size = (dimensions as Record<string, { width: number; height: number }>)[clip.src];
  return <div ref={host} className="gen-video-host" style={size ? { aspectRatio: `${size.width} / ${size.height}`, '--video-ratio': size.width / size.height } as CSSProperties : undefined} />;
}
