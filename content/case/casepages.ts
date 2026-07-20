/*
 * CASE PAGES v2 — data transcribed VERBATIM from
 * ~/Downloads/PROJECT_PAGES_filled_v2.md. Rules: copy only from the
 * spec; 〔TODO〕/〔回填〕 fields render as visible placeholders, never
 * fabricated. Mechanism diagrams draw ONLY node labels the spec
 * specifies; unspecified diagrams render a labeled placeholder.
 */

/* iframe kind REMOVED (CASE-v2-MERGE §1): embedding the live site
 * depended on the target being unprotected (no frame-ancestors), and
 * broke the single-exhibit stance. Red line beats a single round's
 * spec. When the recording arrives, TEARDOWN ships 录屏 + open live ↗
 * external link — never an iframe. */
export type CaseHero =
  | { kind: "latent-comparator" } // live before/after 拉杆 (existing SVG instrument)
  | { kind: "gate"; priority: string }; // asset missing: page not shippable

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
  process?: { n: string; title: string; caption: string; observation: string }[];
  findings?: string[];
  role: string; // ⑦ 〔回填:角色〕 until supplied
  next: { label: string; href: string };
  zh?: string; // optional single Chinese line (absent = not rendered)
};

export const casePages: Record<string, CasePageData> = {
  latent: {
    slug: "latent",
    type: "folio",
    name: "LATENT",
    metaLine:
      "LATENT — film physics engine · WebGL2/GLSL · 2026 · shipped · latentfilm.com",
    claim: "“Filmic” can be measured.",
    hero: { kind: "latent-comparator" },
    heroCaption:
      "CineStill 800T emulation · WebGL2 30fps · calibrated vs own scans · Jul 2026",
    what: "A WebGL2 engine that puts film physics onto AI-generated frames, for creators whose footage never passed through a camera. Each frame runs a GLSL pipeline of spectral response, then halation, then grain, calibrated against my own CineStill 800T scans. Halation radius follows a power law fit to those scans; grain σ is set per luminance zone.",
    mech: {
      nodes: ["input", "spectral response", "halation", "grain", "output"],
    },
    process: [
      { n: "01", title: "四轮校准对比", caption: "〔回填:条件〕", observation: "〔TODO〕" },
      { n: "02", title: "自有底片 vs 引擎输出并置", caption: "〔回填:条件〕", observation: "〔TODO〕" },
      { n: "03", title: "SPECTRUM 诊断截图", caption: "〔回填:条件〕", observation: "〔TODO〕" },
    ],
    findings: [
      "Halation radius follows a power law; fit at α=〔回填:α值〕 against my own scans.",
      "〔TODO〕",
      "〔TODO,可选〕",
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
    what: "A live measurement bench for a hosted image-generation API, for engineers deciding whether to build on it. Seeded runs replay against the live endpoint; step time regresses linearly at 19.52 ms per step, R² 0.9978. Fourteen documented behaviors did not match measurement, while identical seeds returned byte-identical outputs.",
    mech: { placeholder: "机制图〔回填: S8|S28 对比 或 架构简图〕" },
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
      "RESONANCE — real-time AI video physics · Three.js/R3F · 〔回填:年〕 · 〔回填:状态〕",
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
      "SKELETAL SILK — Vision-to-shader pipeline · Claude Vision/GLSL · 〔回填:年〕 · 〔回填:状态〕",
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
      "VESTIGE — digital product passport · ZK-SNARKs/NFC/smart contracts · 〔回填:年〕 · 〔回填:状态〕",
    claim: "Provenance is a verb.",
    hero: { kind: "gate", priority: "系统图 或 NFC 交互实拍" },
    heroCaption:
      "ZK-SNARKs · NFC · smart contracts · EU DPP · PwC/JPM/Tapestry validated",
    what: "A digital product passport for luxury goods, built for brands facing the EU's ESPR disclosure rules. An NFC tag on the object anchors a smart contract record; ZK-SNARK proofs verify claims without exposing the underlying data. Two provisional patents cover the mechanism; the design was validated with PwC, JPMorgan, and Tapestry.",
    mech: { placeholder: "机制图〔回填: 溯源系统架构〕" },
    role: "〔回填:角色〕",
    next: { label: "ACUBOT", href: "/work/acubot" },
  },
  acubot: {
    slug: "acubot",
    type: "specimen",
    name: "ACUBOT",
    metaLine:
      "ACUBOT — structured acupuncture lineage · Expo/React Native · 〔回填:年〕 · 〔回填:状态〕",
    claim: "A lineage, structured.",
    hero: { kind: "gate", priority: "app 实机录屏" },
    heroCaption: "136 points · 4,138 cases · bilingual dataset · Expo/RN",
    what: "A mobile app that structures my father's Tung acupuncture archive, for students who now learn it from scattered notes. The archive becomes a bilingual dataset of 136 points and 4,138 cases, organized as group, then region, then case. Every entry is transcribed from his first-hand records and ships only after he reviews it.",
    mech: { nodes: ["群组", "区域", "案例"] },
    role: "〔回填:角色〕",
    next: { label: "LATENT", href: "/work/latent" },
  },
};
