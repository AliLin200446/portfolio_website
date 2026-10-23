'use client';
/**
 * FilmCover — WebGL2 "emulsion" visual for the photobook cover (left page).
 *
 * A slow, domain-warped emulsion in wine tones, a warm light leak that drifts
 * toward the pointer, animated film grain, vignette and a gutter shadow on the
 * spine side. Decorative only (aria-hidden).
 *
 * - No dependencies. WebGL2, one fullscreen triangle, one fragment shader.
 * - Falls back to the flat wine background if WebGL2 is unavailable.
 * - Renders only while on screen and while the tab is visible.
 * - prefers-reduced-motion: renders a single still frame, no loop, no pointer.
 * - DPR capped (default 1.75) to keep the fill-rate cost low.
 *
 * Usage (parent must have a size):
 *   <div style={{ position: 'relative', aspectRatio: '3 / 4' }}>
 *     <FilmCover gutter="right" />
 *   </div>
 */

import { useEffect, useRef } from 'react';

type Props = {
  /** Which edge is the book's spine. Left page of a spread → 'right'. */
  gutter?: 'left' | 'right' | 'none';
  /** Changes the emulsion pattern. Same seed → same picture. */
  seed?: number;
  /** Max device pixel ratio for the canvas. */
  maxDpr?: number;
  className?: string;
};

const VERT = `#version 300 es
void main() {
  // fullscreen triangle, no buffers
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2  uRes;
uniform float uTime;
uniform vec2  uPointer;   // 0..1, y up, smoothed
uniform float uSeed;
uniform float uGutter;    // 1 = right edge, -1 = left edge, 0 = none
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i), b = hash(i + vec2(1, 0)), c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = r * p * 2.02 + 17.1; a *= 0.5; }
  return v;
}
vec3 screen(vec3 a, vec3 b) { return 1.0 - (1.0 - a) * (1.0 - b); }

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * 1.35 + uSeed;
  float t = uTime;

  // domain-warped emulsion
  vec2 q = vec2(fbm(p + vec2(0.0, t * 0.030)), fbm(p + vec2(5.2, 1.3) - t * 0.024));
  vec2 r = vec2(fbm(p + 2.2 * q + vec2(1.7, 9.2) + t * 0.018), fbm(p + 2.2 * q + vec2(8.3, 2.8) - t * 0.015));
  float f = fbm(p + 2.6 * r);

  vec3 deep  = vec3(0.170, 0.060, 0.080);   // #261014
  vec3 wine  = vec3(0.380, 0.150, 0.180);   // #5B2A30
  vec3 rust  = vec3(0.663, 0.290, 0.180);   // #A94A2E
  vec3 leakC = vec3(0.960, 0.640, 0.420);   // warm light leak

  vec3 col = mix(deep, wine, smoothstep(0.18, 0.78, f));
  col = mix(col, rust, smoothstep(0.66, 1.05, f + 0.35 * r.x) * 0.38);

  // light leak drifting toward the pointer
  vec2 lp = vec2(uPointer.x * aspect, uPointer.y);
  vec2 pp = vec2(uv.x * aspect, uv.y);
  float d = length(pp - lp);
  float leak = exp(-d * d * 3.2) * (0.55 + 0.45 * fbm(pp * 3.0 + t * 0.05));
  col = screen(col, leakC * leak * 0.30);

  // halation-like lift on the brightest emulsion
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col += rust * smoothstep(0.32, 0.55, lum) * 0.12;

  // vignette
  float vig = smoothstep(1.25, 0.25, length((uv - 0.5) * vec2(1.0, 1.15)) * 1.5);
  col *= 0.72 + 0.28 * vig;

  // gutter shadow on the spine edge
  if (uGutter != 0.0) {
    float e = uGutter > 0.0 ? 1.0 - uv.x : uv.x;
    col *= mix(0.70, 1.0, smoothstep(0.0, 0.09, e));
  }

  // animated grain, stronger in mid-tones
  float g = hash(gl_FragCoord.xy + fract(t * 7.3) * 431.0) - 0.5;
  col += g * 0.075 * (0.4 + 0.6 * (1.0 - abs(lum - 0.35) * 2.0));

  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type);
  if (!s) return null;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn('[FilmCover] shader error:', gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export function FilmCover({ gutter = 'right', seed = 3.7, maxDpr = 1.75, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl || gl.isContextLost()) {
      console.warn('[FilmCover] WebGL2 unavailable. Showing flat fallback.');
      return; // CSS background stays as fallback
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('[FilmCover] link error:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const u = {
      res: gl.getUniformLocation(prog, 'uRes'),
      time: gl.getUniformLocation(prog, 'uTime'),
      pointer: gl.getUniformLocation(prog, 'uPointer'),
      seed: gl.getUniformLocation(prog, 'uSeed'),
      gutter: gl.getUniformLocation(prog, 'uGutter'),
    };
    gl.uniform1f(u.seed, seed);
    gl.uniform1f(u.gutter, gutter === 'right' ? 1 : gutter === 'left' ? -1 : 0);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rest = { x: 0.22, y: 0.82 }; // light leak rests near the top-left
    const target = { ...rest };
    const pos = { ...rest };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(u.res, w, h);
    };

    const draw = (tSec: number) => {
      gl.uniform1f(u.time, tSec);
      gl.uniform2f(u.pointer, pos.x, pos.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    let raf = 0;
    let visible = true;
    let running = false;
    const t0 = performance.now();

    const loop = (now: number) => {
      pos.x += (target.x - pos.x) * 0.045;
      pos.y += (target.y - pos.y) * 0.045;
      draw((now - t0) / 1000);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || reduce || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (!running) draw(reduce ? 12 : (performance.now() - t0) / 1000);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);

    const onVis = () => (document.hidden ? stop() : start());
    const onLost = (e: Event) => {
      e.preventDefault();
      stop();
    };
    canvas.addEventListener('webglcontextlost', onLost);
    document.addEventListener('visibilitychange', onVis);

    // pointer is tracked on the page element so the leak reacts across the whole page
    const host = canvas.parentElement ?? canvas;
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      target.x = Math.min(1.1, Math.max(-0.1, (e.clientX - r.left) / r.width));
      target.y = Math.min(1.1, Math.max(-0.1, 1 - (e.clientY - r.top) / r.height));
    };
    const onLeave = () => {
      target.x = rest.x;
      target.y = rest.y;
    };
    if (!reduce) {
      host.addEventListener('pointermove', onMove);
      host.addEventListener('pointerleave', onLeave);
    }

    resize();
    draw(reduce ? 12 : 0);
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      canvas.removeEventListener('webglcontextlost', onLost);
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerleave', onLeave);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      // Do NOT call WEBGL_lose_context here: React StrictMode (Next.js dev) runs
      // effects twice on the same canvas, and a lost context can't be reused.
      // The browser frees the context when the canvas is garbage-collected.
    };
  }, [gutter, seed, maxDpr]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', background: '#5B2A30' }}
    />
  );
}