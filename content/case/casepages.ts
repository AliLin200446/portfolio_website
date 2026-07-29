/*
 * CASE PAGES v2 — data transcribed VERBATIM from
 * ~/Downloads/PROJECT_PAGES_filled_v2.md. Rules: copy only from the
 * spec; PENDING/PENDING fields render as visible placeholders, never
 * fabricated. Mechanism diagrams draw ONLY node labels the spec
 * specifies; unspecified diagrams render a labeled placeholder.
 *
 * 声部七条(改字前过一遍 · from CASE COPY FRAMEWORK):
 * 1 claim=立场,现在时 ≤6词,可被反驳  2 数据无形容词,数字自己扛
 * 3 图注写条件不写好看  4 动词测量系(instrument/calibrate/measure/
 * trace/verify/gate)  5 第一人称最小化  6 短句·无堆叠形容词·中文仅落款
 * 7 状态词全站小写:shipped · in progress · filed · submitted · live
 */

/* iframe kind REMOVED (CASE-v2-MERGE §1): embedding the live site
 * depended on the target being unprotected (no frame-ancestors), and
 * broke the single-exhibit stance. Red line beats a single round's
 * spec. When the recording arrives, TEARDOWN ships 录屏 + open live ↗
 * external link — never an iframe. */
export type CaseHero =
  | { kind: "latent-comparator" } // live before/after 拉杆 (existing SVG instrument)
  | { kind: "gate"; priority: string } // asset missing: page not shippable
  /* LIVE-FACADE (§1): poster/recording resting layer + click-mounted
   * iframe. The iframe NEVER exists before the click; embeddable comes
   * from the per-site frame-ancestors probe (content/case/README.md,
   * probed 2026-07-22: all six sites 200, no framing headers = embeds
   * allowed; hardening snippet for the author in the README). */
  | {
      kind: "facade";
      liveUrl: string;
      embeddable: boolean;
      poster?: string;
      posterNote?: string;
      base?: "comparator";
    };

import type { Exhibit } from "@/lib/labfolio";

/** A passage: optional run-in heading (mono caps) + its paragraphs. */
export type Passage = { heading?: string; paras: string[] };

export type CasePageData = {
  slug: string;
  type: "folio" | "specimen"; // 手记 | 陈列签 — toggles ⑤⑥
  name: string;
  metaLine: string; // ① monospace, not a sentence; PENDING kept visible
  /** ① optional second colophon line (TEARDOWN: 年份 · 状态 · 域名) */
  metaLine2?: string;
  /** ① optional run-in subtitle beside the name */
  subtitle?: string;
  claim: string; // ② one italic sentence (\n renders as a line break)
  hero: CaseHero;
  heroCaption: string; // ③ mono: content · condition · date
  what: string; // ④ verbatim 2-3 sentences
  mech: { nodes?: string[]; placeholder?: string }; // ④ half-width diagram
  /** 手记分屏证物流 (CASE-v2-MERGE Step 1): when present, ⑤ mounts
   *  ExhibitFlow (split scrollytelling + IntersectionObserver +
   *  js-scrolly enhancement + full degradation) instead of the static
   *  grid. v2 的 ≤1句观察 lives in caption/marginNote — not dropped. */
  exhibitFlow?: Exhibit[];
  process?: { n: string; title: string; caption: string; observation: string }[];
  findings?: string[];
  /** trailing note under FINDINGS (TEARDOWN build-note line) */
  findingsNote?: string;
  /* TEARDOWN-FILL §1 决策 (a): three sections of the author's copy have
   * no home in the v2 shape — BRIEF, PROBLEM→APPROACH, VALUE. They get
   * their own optional fields rather than being folded into WHAT: the
   * in-page index is generated from what a page actually renders, and
   * only distinct fields keep it data-driven (folding them into WHAT
   * would make CLAIM/HERO/BRIEF/PROBLEM/APPROACH/FINDINGS/VALUE
   * indistinguishable). A Passage carries an optional run-in heading
   * plus its paragraphs; PROBLEM and VALUE use headings, BRIEF and
   * APPROACH do not. */
  /** FIELDNOTES-CARDS: mount the six-card set (data lives in
   *  content/case/fieldnotes.ts, transcribed from the author's report) */
  fieldNotes?: boolean;
  brief?: Passage[];
  problem?: Passage[];
  approach?: Passage[];
  value?: Passage[];
  role: string; // ⑦ PENDING — role until supplied
  next: { label: string; href: string };
  zh?: string; // optional single Chinese line (absent = not rendered)
};

/** Build-time discipline (ported from content/projects defineProject):
 *  warn on any WHAT sentence over 25 words (v2 hard rule). Empty src →
 *  [EVIDENCE] frame and empty marginNote/zh → not rendered are renderer
 *  behaviors (ExhibitFlow / CasePage), inherited automatically. */
function defineCase(c: CasePageData): CasePageData {
  for (const sent of c.what.split(/(?<=[.!?])\s+/)) {
    const words = sent.trim().split(/\s+/).filter(Boolean).length;
    if (words > 25)
      console.warn(`[case] ${c.slug}: WHAT sentence ${words} words (>25)`);
  }
  return c;
}

/* RESONANCE was removed here: it moved from /work to the experiments
 * cabinet (content/experiments.ts). Its copy is recoverable from git
 * history rather than kept as dead weight in the registry. */
export const casePages: Record<string, CasePageData> = {
  /* latent has moved to the case template (content/cases/latent.ts);
   * its legacy entry — and the build notes that had leaked into it —
   * are removed rather than left to rot beside the live copy. */
  "material-memory": {
    slug: "material-memory",
    type: "specimen",
    name: "MATERIAL MEMORY",
    metaLine:
      "MATERIAL MEMORY — hand-written cloth physics · Verlet integration · live · material-memory.alilinlab.com · 2026 · PENDING — status",
    claim: "PENDING — claim not yet chosen",
    hero: {
      kind: "facade",
      liveUrl: "https://material-memory.alilinlab.com",
      embeddable: true,
      // MATCH-CUT: poster 应为布面特写(揭帛 cut 从经纬间显现才真正落地)
      posterNote: "cloth close-up or recording (poster slot; the live button already works)",
    },
    heroCaption: "PENDING — content · condition · date",
    // MM-FILL:Problem+Solution+统计句(归因待回填)。润色稿上屏,原文逐字:
    // AUTHOR VERBATIM (Problem): "Luxury e-commerce has high return rate
    //   since it only shows you what fabric looks like, never what it
    //   feels like."
    // AUTHOR VERBATIM (Stack): "Three.js + GLSL shaders / Verlet cloth
    //   physics / WebGL"
    // Solution 原文与 "By closing the tactile gap…" 全句未随 prompt 附上
    //   ——到手即补封此处。
    // NAMING: pending author decision (Material Memory vs Material
    //   Simulator)——裁定前铭牌/hover/case 三处统一站 title。
    // SPECS 无 schema 槽(不发明区块),规范化后封存待位:
    //   Three.js · GLSL · Verlet cloth physics · WebGL
    //   (WebGL 按站内探测保留:bundle 含 "webgl" 无 "webgl2",
    //    2026-07-22;PENDING)
    // patent 仍不写(filed 未确认)。claim 草案供作者选(不上屏):
    //   Feel before you buy. / Fabric, felt. / The tactile gap, closed.
    what: "Luxury e-commerce shows you what a fabric looks like — never what it feels like. The return rate follows. Material Memory is a WebGL engine that simulates fabric behavior in real time — drape, weight, sheen, friction — so a buyer can feel a garment before they buy it. Industry studies report that 3D material previews cut return rates by 20–36% and lift conversion by up to 40%. PENDING — source: study, publisher, year",
    mech: { placeholder: "PENDING — mechanism diagram" },
    role: "Design Engineer",
    next: { label: "LATENT", href: "/work/latent" }, // closing berth → loop
  },
/* ARCHIVED (B6-SWAP) · RETURNING: pending App Store — ACUBOT 陈列签
 * 双闸占位原样封存;App Store 上架后解封回位。
  //   acubot: {
  //     slug: "acubot",
  //     type: "specimen",
  //     name: "ACUBOT",
  //     metaLine:
  //       "ACUBOT — Dong-style acupuncture reference · Expo / React Native · iOS · PENDING — status",
  //     claim: "A lineage, structured.",
  //     hero: { kind: "gate", priority: "app 实机录屏" },
  //     heroCaption: "136 points · 4,138 cases · bilingual dataset · Expo/RN",
  //     what: "A mobile app that structures my father's Tung acupuncture archive, for students who now learn it from scattered notes. The archive becomes a bilingual dataset of 136 points and 4,138 cases, organized as group, then region, then case. Every entry is transcribed from his first-hand records and ships only after he reviews it.",
  //     mech: { nodes: ["群组", "区域", "案例"] },
  //     role: "design engineer",
  //     next: { label: "LATENT", href: "/work/latent" },
  //   },
 */

};

for (const k of Object.keys(casePages)) defineCase(casePages[k]);

/* ---- PRESERVED CONTENT (闸①: nothing lost with content/projects/) ----
 * RESONANCE specimen extras from content/projects/resonance.ts — the v2
 * 陈列签 structure has no label/specs sections; kept here verbatim for
 * the day they return:
 * label (~94 words, drafted from author repo copy, 待改):
 *   "A physical feedback interface for world model outputs. Every frame
 *   of an AI-generated video becomes sculptable material in real time:
 *   brightness sculpts geometry, motion energy drives surface
 *   frequency. Built with Three.js and GLSL — a VideoTexture-to-GPU
 *   pipeline at 60fps, a pingpong framebuffer that lets the mesh
 *   remember previous frames, a 4×4 frequency map that shapes where the
 *   surface answers. Watch the form as the video plays: when something
 *   is wrong, you feel it in the mesh before you can say it in words."
 * specs: 60fps VideoTexture → GPU · Three.js / GLSL · pingpong
 *   framebuffer · MEMORY · 4×4 DataTexture · RESONANCE · Claude API ·
 *   fal.ai · live
 * piece.poster: /work/resonance-poster.jpg (real file, future 录屏 poster)
 * piece.liveHref: https://resonance.alilinlab.com/
 * LATENT projects finding not carried into ⑥ (already inside EXHIBIT 02
 * paras): "A frame's spectral falloff can be moved from −3.2 toward the
 * −2 of the natural world."
 * -------------------------------------------------------------------- */
