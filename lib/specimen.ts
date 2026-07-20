import type { SpecimenData } from "@/components/folio/SpecimenLabel";
import { berthOf } from "@/lib/bench";

/*
 * Specimen-label data (§2, 决策B: Resonance is the sample page).
 * Rules of this file: every line is a hard fact already present in the
 * repo's author-written copy (lib/projects.ts) or confirmed live. No
 * invented numbers, no unverified badges — the spec's example items
 * (Verlet integration, featured by Three.js) are NOT claimed here
 * because the author hasn't confirmed them. TODO-author: review the
 * label text (≤120 words, drafted from your own copy), confirm/extend
 * the specs row, and supply the couplet + the recording file.
 */

export const specimens: Record<string, SpecimenData> = {
  resonance: {
    slug: "resonance",
    title: "Resonance",
    meta: "RESONANCE · real-time physics for AI video · Three.js / GLSL · 2026 · New York",
    piece: {
      // author-supplied recording goes here (webm/mp4); poster is real
      src: null,
      poster: "/work/resonance-poster.jpg",
      placeholder: "[占位:Resonance 大画幅录屏 webm — SpecimenPiece src]",
      live: { url: "https://resonance.alilinlab.com/" },
    },
    // drafted ONLY from the author's own project copy — 待你改
    labelText:
      "A physical feedback interface for world model outputs. Every frame of an AI-generated video becomes sculptable material in real time: brightness sculpts geometry, motion energy drives surface frequency. Built with Three.js and GLSL — a VideoTexture-to-GPU pipeline at 60fps, a pingpong framebuffer that lets the mesh remember previous frames, a 4×4 frequency map that shapes where the surface answers. Watch the form as the video plays: when something is wrong, you feel it in the mesh before you can say it in words.",
    specs: [
      "60fps VideoTexture → GPU",
      "Three.js / GLSL",
      "pingpong framebuffer · MEMORY",
      "4×4 DataTexture · RESONANCE",
      "Claude API · fal.ai",
      "live",
    ],
    // couplet: 落款对句待作者供稿 — absent until given, never invented
    year: "2026",
    next: { label: "SKELETAL SILK", href: "/work/skeletal-silk" },
    backHref: `/?berth=${berthOf("resonance")}`,
  },
};
