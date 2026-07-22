/*
 * CASE PAGES v2 — data transcribed VERBATIM from
 * ~/Downloads/PROJECT_PAGES_filled_v2.md. Rules: copy only from the
 * spec; 〔TODO〕/〔回填〕 fields render as visible placeholders, never
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
  | { kind: "gate"; priority: string }; // asset missing: page not shippable

import type { Exhibit } from "@/lib/labfolio";

export type CasePageData = {
  slug: string;
  type: "folio" | "specimen"; // 手记 | 陈列签 — toggles ⑤⑥
  name: string;
  metaLine: string; // ① monospace, not a sentence; 〔回填〕 kept visible
  claim: string; // ② one italic sentence
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
  role: string; // ⑦ 〔回填:角色〕 until supplied
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

export const casePages: Record<string, CasePageData> = {
  latent: {
    slug: "latent",
    type: "folio",
    name: "LATENT",
    metaLine:
      "LATENT — film physics engine · WebGL2 / GLSL · shipped July 2026 · latentfilm.com",
    claim: "“Filmic” can be measured.",
    hero: { kind: "latent-comparator" },
    heroCaption:
      "CineStill 800T emulation · WebGL2 30fps · calibrated vs own scans · Jul 2026",
    what: "A WebGL2 engine that puts film physics onto AI-generated frames, for creators whose footage never passed through a camera. Each frame runs a GLSL pipeline of spectral response, then halation, then grain, calibrated against my own CineStill 800T scans. Halation radius follows a power law fit to those scans; grain σ is set per luminance zone.",
    mech: {
      nodes: ["input", "spectral response", "halation", "grain", "output"],
    },
    // 分屏证物流 (migrated verbatim from content/projects/latent.ts);
    // v2 三条 EXHIBIT(四轮校准/底片并置/SPECTRUM 诊断)的图注条件与
    // 观察仍〔回填〕— 挂在 caption 尾部,evidence 图到位时填 src
    exhibitFlow: [
      {
        no: "01",
        heading: "CineStill 800T · calibration(四轮校准对比)",
        paras: [
          "Every parameter comes from measurement: I shot CineStill 800T at night, developed it, scanned it, and pulled the numbers off my own negatives.",
          "Channel bias. Halation radius in pixels. Grain σ per luminance zone.",
        ],
        caption:
          "shot at night on CineStill 800T · developed · scanned · numbers pulled off the negatives · 观察:〔TODO〕",
        visual: "placeholder",
        placeholderLabel: "[EVIDENCE: EXHIBIT 01 · 四轮校准对比]",
      },
      {
        no: "02",
        heading: "the spectral analyzer(底片 vs 引擎输出并置)",
        paras: [
          "A spectral analyzer fits the radial power spectrum of any frame against natural-image statistics — the same math forensics researchers use to detect AI images, turned around and used as a repair target.",
          "The engine moves a frame's spectral falloff from −3.2 toward the −2 of the natural world. Measured, not vibes.",
        ],
        note: "第三轮推翻前两轮,因为探针位置错了。",
        caption:
          "radial power spectrum fit against natural-image statistics · repair target −2 · 观察:〔TODO〕",
        visual: "placeholder",
        placeholderLabel: "[EVIDENCE: EXHIBIT 02 · 底片 vs 引擎输出并置]",
      },
      {
        no: "03",
        heading: "the instrument(SPECTRUM 诊断)",
        paras: [
          "Halation, grain, highlight roll-off, dye crosstalk — simulated as physics, not filters.",
          "Drag the radius, or just keep reading — the comparator follows the scroll.",
        ],
        caption:
          "demonstration comparator · procedural test pattern, radius exaggerated for reading — not a measurement · 观察:〔TODO〕",
        visual: "instrument",
      },
    ],
    findings: [
      "Halation radius follows a power law; fit at α=〔回填:α值〕 against my own scans.",
      "Every engine parameter traces to a measured negative — channel bias, halation radius in pixels, grain σ per luminance zone.",
      "The forensics math that detects AI images works, turned around, as a repair target.",
    ],
    role: "〔回填:角色〕",
    next: { label: "TEARDOWN №1", href: "/work/teardown" },
  },
  teardown: {
    slug: "teardown",
    type: "folio",
    name: "TEARDOWN №1",
    metaLine:
      "TEARDOWN №1 — 〔回填:类型〕 · 〔回填:技术栈〕 · 2026 · live · teardown.alilinlab.com",
    claim: "Docs describe. Instruments verify.",
    hero: { kind: "gate", priority: "仪表带全开录屏(到手后:录屏 + open live ↗ 外链,不用 iframe)" },
    heroCaption:
      "19.52ms/step · R²=0.9978 · seed → byte-identical · 48h sprint",
    what: "A live measurement bench for a hosted image-generation API, for engineers deciding whether to build on it. Seeded runs replay against the live endpoint; step time regresses linearly at 19.52 ms per step, R² 0.9978. Fourteen documented behaviors did not match measurement, while identical seeds returned byte-identical outputs. FIDELITY-LOCK — an evidence framework locating the AI-to-human boundary for fashion/beauty production imaging. 〔回填:benchmark 范围表述,发布前完成 NDA 自查〕",
    mech: { placeholder: "机制图〔回填: S8|S28 对比 或 架构简图〕" },
    // NDA: 素材涉 Vision On 工作流(SKIMS/e.l.f.),匿名化或换自有素材
    // 后方可接 src。headings 确知(COPY FRAMEWORK 候选A/B/C),条件全回填。
    exhibitFlow: [
      {
        no: "01",
        heading: "cumulative degradation",
        paras: [],
        caption: "〔回填:工具、轮数、判据、日期〕",
        visual: "placeholder",
        placeholderLabel: "[EVIDENCE: EXHIBIT 01 · cumulative degradation]",
      },
      {
        no: "02",
        heading: "same-hue mask failure",
        paras: [],
        caption: "〔回填〕",
        visual: "placeholder",
        placeholderLabel: "[EVIDENCE: EXHIBIT 02 · same-hue mask failure]",
      },
      {
        no: "03",
        heading: "AI/PS division",
        paras: [],
        caption: "〔回填〕",
        visual: "placeholder",
        placeholderLabel: "[EVIDENCE: EXHIBIT 03 · AI/PS division]",
      },
    ],
    // v2 static exhibit list kept below (superseded visually by
    // exhibitFlow, preserved verbatim — 铁律2)
    process: [
      { n: "01", title: "S8|S28 对比", caption: "〔回填:条件〕", observation: "〔TODO〕" },
      { n: "02", title: "瀑布图", caption: "〔回填:条件〕", observation: "〔TODO〕" },
      { n: "03", title: "骷髅图(卡02字面插图)", caption: "〔回填:条件〕", observation: "〔TODO〕" },
    ],
    findings: [
      "Fourteen documented behaviors did not match measurement.",
      "Step time regresses linearly: 19.52 ms/step, R² 0.9978.",
      "Identical seeds returned byte-identical outputs.",
    ],
    role: "〔回填:角色〕",
    next: { label: "RESONANCE", href: "/work/resonance" },
  },
  resonance: {
    slug: "resonance",
    type: "specimen",
    name: "RESONANCE",
    metaLine:
      "RESONANCE — real-time AI video physics · Three.js / R3F · 〔回填:年〕 · 〔回填:状态〕",
    claim: "AI video, given physical consequences.",
    hero: { kind: "gate", priority: "交互录屏" },
    heroCaption:
      "video-luminance-driven sim · 60fps · fal pipeline, strength verified in payload",
    what: "An interface that turns AI-generated video into a live physical simulation, for creators who judge output by feel, not by frame. A VideoTexture streams each frame to the GPU, where shaders read it as input fields for the simulation. Luminance maps to vertex displacement: pixels above a set threshold push the mesh outward, scaled by amplitude; pixels below it exert nothing.",
    mech: { nodes: ["亮度", "模拟参数"] },
    role: "〔回填:角色〕",
    next: { label: "SKELETAL SILK", href: "/work/skeletal-silk" },
  },
  "skeletal-silk": {
    slug: "skeletal-silk",
    type: "specimen",
    name: "SKELETAL SILK",
    metaLine:
      "SKELETAL SILK — vision-to-shader pipeline · Claude Vision → GLSL · 〔回填:年〕 · 〔回填:状态〕",
    claim: "The model outputs a coordinate, not an image.",
    hero: { kind: "gate", priority: "swatch 点击 → JSON → 起骨 的 20s 录屏" },
    heroCaption:
      "Claude Vision → 4 params → GLSL uniforms · temp 0 · schema/clamp/fallback",
    what: "A pipeline that lets a vision model drive a material shader, for interfaces where AI must change rendering, not generate pictures. Claude Vision reads a fabric swatch and returns four constrained parameters as JSON, which bind directly to GLSL uniforms. Calls run at temperature 0 behind a schema; out-of-range values clamp, and a failed parse falls back to defaults.",
    mech: { nodes: ["Vision", "4参数", "uniforms"] },
    role: "〔回填:角色〕",
    next: { label: "VESTIGE", href: "/work/vestige" },
  },
  vestige: {
    slug: "vestige",
    type: "specimen",
    name: "VESTIGE",
    metaLine:
      "VESTIGE — digital product passport · ZK-SNARKs / NFC / smart contracts · provisional patent filed · 〔回填:年〕 · 〔回填:状态〕",
    claim: "Provenance is a verb.",
    hero: { kind: "gate", priority: "系统图 或 NFC 交互实拍" },
    heroCaption:
      "ZK-SNARKs · NFC · smart contracts · EU DPP · PwC/JPM/Tapestry validated",
    what: "A digital product passport for luxury goods, built for brands facing the EU's ESPR disclosure rules. An NFC tag on the object anchors a smart contract record; ZK-SNARK proofs verify claims without exposing the underlying data. Two provisional patents cover the mechanism; the design was validated with PwC, JPMorgan, and Tapestry.",
    mech: { placeholder: "机制图〔回填: 溯源系统架构〕" },
    role: "〔回填:角色〕",
    next: { label: "LATENT", href: "/work/latent" }, // acubot archived: loop closes here
  },
/* ARCHIVED (B6-SWAP) · RETURNING: pending App Store — ACUBOT 陈列签
 * 双闸占位原样封存;App Store 上架后解封回位。
  //   acubot: {
  //     slug: "acubot",
  //     type: "specimen",
  //     name: "ACUBOT",
  //     metaLine:
  //       "ACUBOT — Dong-style acupuncture reference · Expo / React Native · iOS · 〔回填:status〕",
  //     claim: "A lineage, structured.",
  //     hero: { kind: "gate", priority: "app 实机录屏" },
  //     heroCaption: "136 points · 4,138 cases · bilingual dataset · Expo/RN",
  //     what: "A mobile app that structures my father's Tung acupuncture archive, for students who now learn it from scattered notes. The archive becomes a bilingual dataset of 136 points and 4,138 cases, organized as group, then region, then case. Every entry is transcribed from his first-hand records and ships only after he reviews it.",
  //     mech: { nodes: ["群组", "区域", "案例"] },
  //     role: "〔回填:角色〕",
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
