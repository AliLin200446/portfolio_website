"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { films } from "@/content/departments";

export default function FilmPlayer() {
  const [filmIndex, setFilmIndex] = useState(0);
  const [clipIndex, setClipIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const video = useRef<HTMLVideoElement>(null);
  const film = films[filmIndex];
  const clip = film.clips[clipIndex];
  const select = (index: number, cut = 0) => { video.current?.pause(); setPlaying(false); setError(""); setFilmIndex(index); setClipIndex(cut); };
  const toggle = async () => {
    if (!video.current) return;
    if (video.current.paused) { try { await video.current.play(); setError(""); } catch { setError("Playback could not start. Use the player controls or open the film directly."); } }
    else video.current.pause();
  };
  return <>
    <section className="film-layout">
      <div className="film-main"><div className="panel-label"><h1>03 / Generative</h1><span>G.{String(filmIndex + 1).padStart(2, "0")} / 09</span></div><div className="film-screen"><video key={clip.src} ref={video} src={clip.src} poster={clip.poster} controls playsInline preload="none" aria-label={`${film.name}, ${clip.label}`} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onError={() => setError("This film could not load. Open the source film directly.")} /></div><div className="film-controls"><button onClick={toggle} aria-label={playing ? "Pause film" : "Play film"}>{playing ? "Pause" : "Play"} <span aria-hidden="true">{playing ? "Ⅱ" : "▷"}</span></button><span>{film.type}</span><a href={clip.src}>Open film ↗</a></div>{error && <p className="player-error" role="status">{error}</p>}<div className="film-cuts" role="group" aria-label="Film cuts">{film.clips.map((cut, i) => <button key={cut.src} aria-pressed={clipIndex === i} onClick={() => select(filmIndex, i)}>{cut.label}</button>)}</div></div>
      <aside className="film-index"><div className="panel-label"><span>Films & visual studies</span><span>{films.length}</span></div>{films.map((item, i) => <button data-nav-item key={item.id} aria-pressed={filmIndex === i} onClick={() => select(i)}><span className="tab-meta">G.{String(i + 1).padStart(2, "0")}</span><span>{item.name}</span><span>↗</span></button>)}<div className="film-notes"><h2>{film.name}</h2><p>{film.description}</p><dl><dt>Tools</dt><dd>{film.tools}</dd><dt>Production / process</dt><dd>{film.pipeline}</dd></dl></div></aside>
    </section>
    {film.stills && <section className="film-artworks"><div className="panel-label"><h2>Source artworks</h2><span>04 / Fashion study</span></div><div>{film.stills.map((src, i) => <Image key={src} src={src} alt={`Fashion film source artwork ${i + 1}`} width={3520} height={2352} sizes="(max-width: 767px) 45vw, 300px" />)}</div></section>}
  </>;
}
