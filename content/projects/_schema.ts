/*
 * PROJECT PAGE SCHEMA — the author fills DATA FILES, never components.
 * Two kinds, one chrome: kind 'folio' = lab notebook (split-screen
 * scrollytelling, seven parts) · kind 'specimen' = specimen label
 * (single column, five parts). Upgrade path: change kind, add the
 * folio fields — chrome and components never move.
 * Discipline: hard facts only; empty src renders a labeled evidence
 * placeholder (never a generated image); empty marginNote/documents
 * render NOTHING (absence is curation, not an empty slot).
 */

export type Colophon = {
  /** 项目名(Newsreader 大字)e.g. "Latent" */
  name: string;
  /** 等宽元数据行,只填硬事实(栈/年份/状态/地点)
   *  e.g. ["film physics engine", "WebGL2 / GLSL", "shipped Jul 2026"] */
  meta: string[];
  /** 立场句,独占一屏(folio 必填;specimen 不渲染,可留空串)
   *  e.g. "Filmic can be measured." */
  claim: string;
  /** 落款中文对句 — 全页唯一中文位。留空串则不渲。 */
  signoff_zh: string;
  /** 年份(落款用)e.g. "2026"。(spec 补漏:落款需要它) */
  year: string;
  /** NEXT → 门 e.g. { label: "RESONANCE", href: "/work/resonance" } */
  next: { label: string; href: string };
};

export type ExhibitEntry = {
  /** 'EXHIBIT 01' */
  id: string;
  /** 小标题 e.g. "CineStill 800T · calibration"(spec 补漏:左栏需要) */
  heading: string;
  /** 左栏正文段落,作者手记原文(spec 补漏:左栏文字流的来源) */
  paras: string[];
  /** 图注:写"什么条件下测的",不写"多好看" */
  caption: string;
  /** instrument = 右栏活交互件;src 留空 = 渲 [EVIDENCE: …] 占位框 */
  asset: {
    type: "image" | "svg" | "video" | "instrument";
    src?: string;
    component?: string;
  };
  /** 右缘旁注:真实取舍/失败原话。留空不渲。 */
  marginNote?: string;
};

export type FolioBody = {
  kind: "folio";
  exhibits: ExhibitEntry[];
  /** 2–4 条编号结论 e.g. { n: "01", text: "…" } */
  findings: { n: string; text: string }[];
};

export type SpecimenBody = {
  kind: "specimen";
  /** 物=录屏/图,非实时 WebGL;liveHref 渲 'open live ↗' 外链 */
  piece: {
    type: "video" | "image" | "svg";
    src?: string;
    poster?: string;
    liveHref?: string;
  };
  /** 签文 ≤120 词(是什么/用什么做/看什么)。超长构建警告。 */
  label: string;
  /** 规格行,只列可验证硬项 */
  specs: string[];
  /** Vestige 例外:paper/专利链接。留空不渲。 */
  documents?: { label: string; href: string }[];
};

export type ProjectContent = {
  colophon: Colophon;
  body: FolioBody | SpecimenBody;
};

/** Wrap every data file in this: build-time discipline checks. */
export function defineProject(slug: string, c: ProjectContent): ProjectContent {
  if (c.body.kind === "specimen") {
    const words = c.body.label.trim().split(/\s+/).filter(Boolean).length;
    if (words > 120)
      console.warn(
        `[folio] ${slug}: specimen label is ${words} words (>120) — 没料硬写?`
      );
  }
  return c;
}
