export type Playback = { time: number; paused: boolean; muted: boolean; volume: number };
export type VideoOptions = { src: string; poster: string; title: string; objectPosition?: string; playback?: Playback; save: (state: Playback) => void };

export function mount(el: HTMLElement, opts: VideoOptions) {
  const video = document.createElement('video');
  video.controls = false;
  video.muted = opts.playback?.muted ?? true;
  video.volume = opts.playback?.volume ?? 1;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.poster = opts.poster;
  video.setAttribute('aria-label', opts.title);
  video.className = 'gen-video';
  video.style.objectPosition = opts.objectPosition ?? 'center';
  const playbackButton = document.createElement('button');
  playbackButton.type = 'button';
  playbackButton.className = 'gen-playback-toggle';
  const soundButton = document.createElement('button');
  soundButton.type = 'button';
  soundButton.className = 'gen-sound-toggle';
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = true;
  let destroyed = false;
  let wantsPlay = !(opts.playback?.paused ?? false);
  let manualPlay = false;
  const updateControls = () => {
    playbackButton.textContent = video.paused ? 'PLAY' : 'PAUSE';
    playbackButton.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
    soundButton.textContent = video.muted ? 'SOUND OFF' : 'SOUND ON';
    soundButton.setAttribute('aria-label', video.muted ? 'Turn sound on' : 'Turn sound off');
    soundButton.setAttribute('aria-pressed', String(!video.muted));
  };
  const save = () => opts.save({time:video.currentTime, paused:!wantsPlay, muted:video.muted, volume:video.volume});
  const play = () => {
    if (!destroyed && !document.hidden && visible && (!motion.matches || manualPlay) && wantsPlay) {
      void video.play().catch(() => { if (!destroyed) updateControls(); });
    }
  };
  const pause = () => { video.pause(); updateControls(); };
  const sync = () => { if (document.hidden || !visible || (motion.matches && !manualPlay)) pause(); else play(); };
  const changed = () => { updateControls(); save(); };
  const togglePlayback = () => {
    if (video.paused) { wantsPlay = true; manualPlay = true; play(); }
    else { wantsPlay = false; pause(); }
    save();
  };
  const toggleSound = () => { video.muted = !video.muted; changed(); };
  const motionChanged = () => { manualPlay = false; sync(); };
  const loaded = () => {
    if (video.videoWidth && video.videoHeight) {
      el.style.aspectRatio = `${video.videoWidth} / ${video.videoHeight}`;
      el.style.setProperty('--video-ratio', String(video.videoWidth / video.videoHeight));
    }
    if (opts.playback) video.currentTime = Math.min(opts.playback.time, Number.isFinite(video.duration) ? video.duration : opts.playback.time);
    play();
  };
  const observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; sync(); });
  video.addEventListener('loadedmetadata', loaded);
  video.addEventListener('play', changed);
  video.addEventListener('pause', changed);
  video.addEventListener('volumechange', changed);
  video.addEventListener('timeupdate', save);
  playbackButton.addEventListener('click', togglePlayback);
  soundButton.addEventListener('click', toggleSound);
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', motionChanged);
  video.src = opts.src;
  updateControls();
  el.replaceChildren(video, playbackButton, soundButton);
  observer.observe(el);
  return {
    pause, resume: play,
    resize: () => { /* Natural video dimensions and CSS handle responsive resizing. */ },
    destroy() {
      destroyed = true; save(); observer.disconnect();
      document.removeEventListener('visibilitychange', sync); motion.removeEventListener('change', motionChanged);
      video.removeEventListener('loadedmetadata', loaded); video.removeEventListener('play', changed);
      video.removeEventListener('pause', changed); video.removeEventListener('volumechange', changed); video.removeEventListener('timeupdate', save);
      playbackButton.removeEventListener('click', togglePlayback); soundButton.removeEventListener('click', toggleSound);
      video.pause(); video.removeAttribute('src'); video.load(); video.remove(); playbackButton.remove(); soundButton.remove();
    },
  };
}
