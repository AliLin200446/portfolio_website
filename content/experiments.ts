/*
 * EXPERIMENTS 索引数据: 作者只填这个文件,组件零改动。
 * 声部三条:一句话写做了什么 · 无形容词 · 年份必填。
 * 纪律闸:①href/repo 皆空的条目不上屏 ②credit 仅确证者可填
 * ③ACUBOT 及任何未公开/涉 NDA 作品不得出现在此文件。
 * 3D 标本屉(SPECIMEN-DRAWER)为后续增强层,前置:站上线+索引填满。
 */

export type Tag = "web3" | "3d" | "web" | "ios" | "generative" | "emotion";

export type Experiment = {
  name: string; // 作品名
  line: string; // 一句话: 写做了什么,不写形容词
  year: string; // '2025'
  tags: Tag[];
  href?: string; // live demo 优先;无则 repo;两者皆无不上屏
  repo?: string;
  /** Card back, Geist Mono. What it is built with, not what it is
   *  about: `line` says the second thing and the front of the card
   *  already carries the name. Absent means the label is absent, never
   *  a guess. */
  stack?: string;
  /** Card back, /experiments/<id>.webp, 16:10. Absent renders a
   *  labelled empty slot rather than a broken frame. */
  shot?: string;
  featured?: boolean; // 置顶区
  credit?: string; // 可验证背书: 仅确证者可填
};

export const TAGS: Tag[] = ["web3", "3d", "web", "ios", "generative", "emotion"];

export const experiments: Experiment[] = [
  {
    name: "Cyber I Ching",
    line: "Ethereum block hash → I Ching hexagram",
    year: "2025", // DRAFT: 年份待你核
    tags: ["web3", "generative"],
    shot: "/experiments/cyber-i-ching.webp",
    href: "https://iching.alilinlab.com/",
    featured: true,
    credit: "featured by Three.js", // DRAFT: 确证是本项目才留
  },
  {
    name: "Aura API",
    line: "DRAFT: generative visual API", // ← 猜测非事实,上线前必须换
    year: "2025", // DRAFT
    tags: ["web", "generative"], // DRAFT
    shot: "/experiments/aura-api.webp",
    // 子域拼写实测:arua-api 200 在线,aura-api 无 DNS: 保留 arua
    href: "https://arua-api.alilinlab.com/",
  },
  {
    name: "Project Lethe",
    line: "two ritual paths, water or fire, for letting a memory go",
    year: "2025", // DRAFT
    tags: ["web3", "emotion"],
    shot: "/experiments/project-lethe.webp",
    href: "https://lethe-river.alilinlab.com/",
  },
  {
    name: "Resonance",
    // the mechanism only. The earlier page claimed a physics engine, a
    // spectral frequency map and generation health; none of that is
    // restated here.
    line: "a physical feedback interface for world model outputs",
    year: "2026", // DRAFT: 年份待你核
    tags: ["3d", "web"],
    // Cropped from the top left, not centred like the other four. The
    // full capture prints "RESONANCE - AI VIDEO PHYSICS ENGINE" along
    // the bottom and carries a "GENERATION HEALTH" panel down the left
    // column: two of the three claims this project retracted, and two
    // of the three patterns scripts/check-claims.mjs exists to stop.
    // That guard reads source text and cannot read an image, so it
    // would have shipped them silently. The cut at 1300 of 1658px
    // clears both and keeps the four sliders, which are the thing this
    // entry actually describes.
    shot: "/experiments/resonance.webp",
    // the one entry with a case page of its own: the card goes there,
    // and the case page carries the live link
    href: "/work/resonance",
  },
  {
    name: "Consensus Couture",
    // the mechanism, not the pitch: what actually happens, in order
    line: "the market votes on a design first: only voted-for units get produced",
    year: "2026", // DRAFT: 年份待你核
    tags: ["web3", "3d"],
    shot: "/experiments/consensus-couture.webp",
    href: "https://consensus-couture.alilinlab.com/",
  },
  /* MATERIAL MEMORY and VESTIGE moved here from the home rail. They
   * keep their full case pages; `href` points at those rather than at
   * the live site, the same way RESONANCE does, so the case page stays
   * the one place that carries the live link.
   *
   * Neither has a `shot`. The card back renders a labelled empty slot
   * for a missing one, which is the honest state: /experiments/*.webp
   * are 16:10 captures and the only images these two have are case
   * heroes at 2.26 and 1.67, one of them 3800px wide. Pointing the
   * card at those would ship a hero-sized file into a thumbnail and
   * crop it wrong. Two proper captures is the fix, not a reused path.
   */
  {
    name: "Material Memory",
    // the case page's own oneLine, unchanged
    line: "a real-time fabric simulator that lets a buyer feel a garment before they buy it",
    year: "2026",
    tags: ["3d", "web"],
    href: "/work/material-memory",
  },
  {
    name: "Vestige",
    // `line`, not `credit`: the card front renders the name alone, and
    // `line` is what reaches the list row. `credit` is reserved for a
    // third party confirming the work; a provisional you filed
    // yourself is a status, not an endorsement.
    line: "a filed provisional · EU digital product passport",
    year: "2026",
    tags: ["web3", "3d"],
    href: "/work/vestige",
  },
  // 填字模板(照抄,一条一分钟):
  // { name: 'Cyber I Ching', line: 'Ethereum block hash → I Ching hexagram', year: '2025',
  //   tags: ['web3','generative'], href: '〔live URL〕', featured: true,
  //   credit: 'featured by Three.js' },
  // { name: '〔名称〕', line: '〔做了什么〕', year: '〔年份〕', tags: ['web'], href: '〔URL〕' },
  // { name: '〔名称〕', line: '〔做了什么〕', year: '〔年份〕', tags: ['3d'], repo: '〔repo URL〕' },
];
