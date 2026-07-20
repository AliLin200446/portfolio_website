import { defineProject } from "./_schema";

/* LATENT — the FILLED folio example (照抄参照). Every sentence is the
 * author's own copy; the margin note is the author's supplied quote. */
export default defineProject("latent", {
  colophon: {
    name: "Latent",
    meta: ["film physics engine", "WebGL2 / GLSL", "shipped Jul 2026", "latentfilm.com"],
    claim: "Filmic can be measured.",
    signoff_zh: "", // 对句待作者
    year: "2026",
    next: { label: "RESONANCE", href: "/work/resonance" },
  },
  body: {
    kind: "folio",
    exhibits: [
      {
        id: "EXHIBIT 01",
        heading: "CineStill 800T · calibration",
        paras: [
          "Every parameter comes from measurement: I shot CineStill 800T at night, developed it, scanned it, and pulled the numbers off my own negatives.",
          "Channel bias. Halation radius in pixels. Grain σ per luminance zone.",
        ],
        caption: "shot at night on CineStill 800T · developed · scanned · numbers pulled off the negatives",
        asset: { type: "image" }, // src 留空 → [EVIDENCE] 占位框
      },
      {
        id: "EXHIBIT 02",
        heading: "the spectral analyzer",
        paras: [
          "A spectral analyzer fits the radial power spectrum of any frame against natural-image statistics — the same math forensics researchers use to detect AI images, turned around and used as a repair target.",
          "The engine moves a frame's spectral falloff from −3.2 toward the −2 of the natural world. Measured, not vibes.",
        ],
        caption: "radial power spectrum fit against natural-image statistics · repair target −2",
        asset: { type: "image" },
        marginNote: "第三轮推翻前两轮,因为探针位置错了。",
      },
      {
        id: "EXHIBIT 03",
        heading: "the instrument",
        paras: [
          "Halation, grain, highlight roll-off, dye crosstalk — simulated as physics, not filters.",
          "Drag the radius, or just keep reading — the comparator follows the scroll.",
        ],
        caption: "demonstration comparator · procedural test pattern, radius exaggerated for reading — not a measurement",
        asset: { type: "instrument", component: "halation" },
      },
    ],
    findings: [
      { n: "01", text: "A frame's spectral falloff can be moved from −3.2 toward the −2 of the natural world." },
      { n: "02", text: "Every engine parameter traces to a measured negative — channel bias, halation radius in pixels, grain σ per luminance zone." },
      { n: "03", text: "The forensics math that detects AI images works, turned around, as a repair target." },
    ],
  },
});
