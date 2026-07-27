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
  teardown: {
    slug: "teardown",
    type: "folio",
    name: "TEARDOWN № 1",
    subtitle: "an instrumented teardown of a generative image API",
    metaLine:
      "measurement harness + interactive report · TypeScript / React / fal API",
    metaLine2: "2026 · shipped · teardown.alilinlab.com",
    claim:
      "An API's documentation tells you what it returns.\nOnly measurement tells you what it withholds.",
    hero: {
      kind: "facade",
      liveUrl: "https://teardown.alilinlab.com",
      embeddable: true,
      posterNote:
        "30s recording or poster — drag the steps slider, hit GENERATE, watch the console",
    },
    // PENDING图注中的 "N" 是否应为具体数值(正文用 N=20 / N=1 per
    // rung)——原文照录,待作者核对
    heroCaption:
      "live calls to fal-ai/flux/dev · every parameter change is a\nside-by-side experiment · N visible in the log",
    // WHAT 不在本稿结构中(①②③BRIEF PROBLEM APPROACH FINDINGS VALUE);
    // 空串 → 该节不渲染、不入 index。
    what: "",
    mech: { placeholder: "" },
    brief: [
      {
        paras: [
          "AI image APIs ship faster than anyone measures them. Latency claims are marketing, parameter documentation is partial, and the numbers that matter to a production integrator — where the milliseconds live, what a knob actually buys, whether the same call returns the same bytes — are published nowhere.",
          "I spent 48 hours instrumenting one model, fal-ai/flux/dev, through its synchronous endpoint: 47 structured calls across five experiments, every measurement logged to disk, every claim traceable to a source file and line. The result is not a benchmark. Benchmarks answer \"which is better.\" A teardown answers \"what is actually happening inside\" — and what the API knows but does not send.",
        ],
      },
    ],
    problem: [
      { paras: ["Three questions an integrator cannot answer from the docs:"] },
      {
        heading: "WHERE DOES THE TIME GO.",
        paras: [
          "The response body returns one timing field, inference. Queue time — the segment between sending a request and the model starting work — is not returned and must be derived client-side.",
        ],
      },
      {
        heading: "WHAT DOES A PARAMETER BUY.",
        paras: [
          "num_inference_steps documents a default of 28 and no range. Nothing states what an additional step changes, or costs.",
        ],
      },
      {
        heading: "IS THE SAME CALL THE SAME IMAGE.",
        paras: [
          "Determinism is assumed, never stated. Caching and reproduction strategies depend on it.",
        ],
      },
    ],
    approach: [
      {
        paras: [
          "A browser-based harness making live calls through a proxy, timing each with performance.now() split into queue / inference / network, logging every call to a structured record. Image comparison by per-channel pixel diff at two declared thresholds — any Δ, and Δ>32 of 255 — because \"how many pixels changed\" and \"how many changed visibly\" are different questions with different answers.",
          "Five experiments: a steps sweep (10 rungs, 1→45), a guidance sweep (8 rungs, 1→20), a seed determinism run (3 identical calls, byte comparison), a latency series (N=20 at fixed parameters), and a friction log of every gap between the documentation and the wire.",
        ],
      },
    ],
    // 五实验可在有实测图后升级为 EXHIBITS(分屏 exhibitFlow)
    findings: [
      "THE VARIANCE LIVES IN THE SEGMENT THE API DOES NOT RETURN. inference_ms is linear in steps at 19.52 ms/step, R² = 0.9978, with std 9.9 ms across N=20. Queue std is 277.0 ms — and queue is the one segment absent from the response body. A client measuring total time cannot attribute its own spread.",
      "THREE IDENTICAL CALLS, IDENTICAL BYTES. Same parameters, three runs, three distinct inference times (545 / 547 / 550 ms — real recomputation, not a cache), one sha256. 0 of 262,144 pixels differ. Output is addressable by parameter tuple.",
      "PAST 28, EIGHT STEPS BUY WHAT ONE STEP ALREADY DELIVERED. S20→S28 and S28→S36 each span 8 steps and 156 ms. The first moves 7.655% of pixels (Δ>32); the second, 1.488%. A single step, S28→S29, already moves 1.291% at the same threshold.",
      "GUIDANCE HAS NO RESTING POINT. Across G1→G20 no adjacent pair falls below 17.167% changed pixels (Δ>32); the last rung still moves 57.591%. The default of 3.5 is a choice, not a convergence point.",
      "THE DOCS AND THE WIRE DISAGREE. The timings field is typed as Timings; the type is not defined. The steps ceiling of 50 is discoverable only by sending 999 and reading the error body. Validation and gateway errors arrive in two different shapes.",
    ],
    fieldNotes: true,
    findingsNote:
      "Each finding closes with a build note on the page — cache on the parameter tuple, budget steps before anything else, size timeouts from the segment you have to time yourself.",
    value: [
      {
        heading: "WHY IT LOOKS THE WAY IT DOES",
        paras: [
          "The report is laid out as an engineering desktop: a ruled notebook ground, opaque paper surfaces, and the API itself rendered as a node graph — inputs wired into the model, the model wired into its results. The teardown convention is literal: every part pulled out, labelled, and measured, with the latency anatomy drawn inside the model node where the call actually happens.",
        ],
      },
      {
        heading: "WHAT THIS DEMONSTRATES",
        paras: [
          "Instrument-building over tool-using: the harness, the pixel-diff tooling, and the verification pipeline are all first-party. Claims survive audit: every number on the site carries its source file, line, sample size, and threshold, and the raw files ship with the report. Limits are stated by the author, not discovered by the reader: N=1 per rung, single region, single day, no residual-to-reference series — so no convergence claim is made.",
          "TEARDOWN № 1 is the first in a series. The method — sweep, diff, time, log, publish with sources — ports to any inference API. The findings do not: they are one model, measured.",
        ],
      },
    ],
    role: "design engineer",
    next: { label: "VESTIGE", href: "/work/vestige" },
  },
  vestige: {
    slug: "vestige",
    type: "specimen",
    name: "VESTIGE",
    // 一句话定位为作者原文(微调大小写);年/role 作者供稿
    metaLine:
      "VESTIGE — turning EU Digital Product Passport compliance into luxury brand value · ZK-SNARKs / NFC / smart contracts · provisional patent filed · 2026 · PENDING — status",
    claim: "Provenance is a verb.",
    hero: {
      kind: "facade",
      liveUrl: "https://vestige.alilinlab.com",
      embeddable: true,
      posterNote: "system diagram or NFC interaction capture",
    },
    heroCaption:
      "ZK-SNARKs · NFC · smart contracts · EU DPP · presented to leads at PwC, JPMorgan and Tapestry",
    // RETRACTED — do not restore. The block below is the superseded v2
    // copy, kept only as a record. It contains two claims that were
    // withdrawn: the plural patent count (there is one merged filed
    // provisional) and the word "validated" for what was a presentation
    // to leads. The shipping copy is content/cases/vestige.ts.
    // 作者原文归位(原标 Problem 实为定义)。v2 旧 WHAT 逐字封存:
    // "A digital product passport for luxury goods, built for brands
    //  facing the EU's ESPR disclosure rules. An NFC tag on the object
    //  anchors a smart contract record; ZK-SNARK proofs verify claims
    //  without exposing the underlying data. Two provisional patents
    //  cover the mechanism; the design was validated with PwC,
    //  JPMorgan, and Tapestry."
    // SPECS/stack 逐字(schema 无 SPECS 槽,封存待位):
    //   ZK-SNARKs — privacy-preserving provenance
    //   NFC (NTAG 424 DNA) — tamper-resistant physical authentication
    //   smart-contract royalty protocols — perpetual secondary-market participation
    // Problem 位:PENDING
    what: "Vestige is a Digital Product Passport infrastructure that gives every item a verifiable, traceable identity while routing smart-contract royalties back to the brand on every resale.",
    mech: { placeholder: "PENDING — provenance system diagram" },
    role: "Design Engineer",
    next: { label: "MATERIAL MEMORY", href: "/work/material-memory" },
  },
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
