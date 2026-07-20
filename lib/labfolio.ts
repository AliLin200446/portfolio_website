/*
 * LAB-FOLIO v2 data (Latent sample). Discipline: every exhibit body
 * sentence is the author's own copy (lib/projects.ts, verbatim or
 * near-verbatim); the margin note is the author's supplied quote; the
 * findings restate measured claims already in the copy. Nothing here
 * is generated narrative. Evidence images await the author's evidence
 * pack — placeholders are labeled, never AI-filled.
 */

export type Exhibit = {
  no: string;
  heading: string;
  paras: string[];
  /** author's real aside, right-edge margin note — never invented */
  note?: string;
  /** caption states the CONDITIONS of measurement, not how it looks */
  caption: string;
  /** placeholder = labeled empty frame; instrument = the live halation
   *  comparator (SVG, §6-safe) */
  visual: "placeholder" | "instrument";
  placeholderLabel?: string;
};

export type LabFolioData = {
  slug: string;
  title: string;
  meta: string;
  claim: string;
  exhibits: Exhibit[];
  findings: string[];
  couplet?: string;
  year: string;
  next?: { label: string; href: string };
  backHref: string;
};

export const labFolios: Record<string, LabFolioData> = {
  latent: {
    slug: "latent",
    title: "Latent",
    meta: "LATENT · film physics engine · WebGL2 / GLSL · shipped Jul 2026 · latentfilm.com",
    claim: "Filmic can be measured.",
    exhibits: [
      {
        no: "01",
        heading: "CineStill 800T · calibration",
        paras: [
          "Every parameter comes from measurement: I shot CineStill 800T at night, developed it, scanned it, and pulled the numbers off my own negatives.",
          "Channel bias. Halation radius in pixels. Grain σ per luminance zone.",
        ],
        caption:
          "shot at night on CineStill 800T · developed · scanned · numbers pulled off the negatives",
        visual: "placeholder",
        placeholderLabel: "[占位:首轮 halation 校准证物图 — evidence 包]",
      },
      {
        no: "02",
        heading: "the spectral analyzer",
        paras: [
          "A spectral analyzer fits the radial power spectrum of any frame against natural-image statistics — the same math forensics researchers use to detect AI images, turned around and used as a repair target.",
          "The engine moves a frame's spectral falloff from −3.2 toward the −2 of the natural world. Measured, not vibes.",
        ],
        note: "第三轮推翻前两轮,因为探针位置错了。",
        caption:
          "radial power spectrum fit against natural-image statistics · repair target −2",
        visual: "placeholder",
        placeholderLabel: "[占位:第三轮对比证物图 — evidence 包]",
      },
      {
        no: "03",
        heading: "the instrument",
        paras: [
          "Halation, grain, highlight roll-off, dye crosstalk — simulated as physics, not filters.",
          "Drag the radius, or just keep reading — the comparator follows the scroll.",
        ],
        caption:
          "demonstration comparator · procedural test pattern, radius exaggerated for reading — not a measurement",
        visual: "instrument",
      },
    ],
    findings: [
      "A frame's spectral falloff can be moved from −3.2 toward the −2 of the natural world.",
      "Every engine parameter traces to a measured negative — channel bias, halation radius in pixels, grain σ per luminance zone.",
      "The forensics math that detects AI images works, turned around, as a repair target.",
    ],
    // couplet: 落款对句待作者 — absent until supplied
    year: "2026",
    next: { label: "RESONANCE", href: "/work/resonance" },
    backHref: "/?berth=2",
  },
};
