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
    href: "https://iching.alilinlab.com/",
    featured: true,
    credit: "featured by Three.js", // DRAFT: 确证是本项目才留
  },
  {
    name: "Aura API",
    line: "DRAFT: generative visual API", // ← 猜测非事实,上线前必须换
    year: "2025", // DRAFT
    tags: ["web", "generative"], // DRAFT
    // 子域拼写实测:arua-api 200 在线,aura-api 无 DNS: 保留 arua
    href: "https://arua-api.alilinlab.com/",
  },
  {
    name: "Project Lethe",
    line: "two ritual paths, water or fire, for letting a memory go",
    year: "2025", // DRAFT
    tags: ["web3", "emotion"],
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
    href: "https://resonance.alilinlab.com/",
  },
  {
    name: "Consensus Couture",
    // the mechanism, not the pitch: what actually happens, in order
    line: "the market votes on a design first: only voted-for units get produced",
    year: "2026", // DRAFT: 年份待你核
    tags: ["web3", "3d"],
    href: "https://consensus-couture.alilinlab.com/",
  },
  // 填字模板(照抄,一条一分钟):
  // { name: 'Cyber I Ching', line: 'Ethereum block hash → I Ching hexagram', year: '2025',
  //   tags: ['web3','generative'], href: '〔live URL〕', featured: true,
  //   credit: 'featured by Three.js' },
  // { name: '〔名称〕', line: '〔做了什么〕', year: '〔年份〕', tags: ['web'], href: '〔URL〕' },
  // { name: '〔名称〕', line: '〔做了什么〕', year: '〔年份〕', tags: ['3d'], repo: '〔repo URL〕' },
];
