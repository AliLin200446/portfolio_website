import { defineProject } from "./_schema";

/* RESONANCE — specimen. 上轮已验收的草稿数据保留(签文/规格全部取自
 * 作者 repo 原文,待你改;要按 spec 清空照 teardown.ts 的样式注释掉)。 */
export default defineProject("resonance", {
  colophon: {
    name: "Resonance",
    meta: ["real-time physics for AI video", "Three.js / GLSL", "2026", "New York"],
    claim: "",
    signoff_zh: "",
    year: "2026",
    next: { label: "SKELETAL SILK", href: "/work/skeletal-silk" },
  },
  body: {
    kind: "specimen",
    piece: {
      type: "video",
      // src: "/work/resonance-demo.webm", // 录屏待作者;留空渲占位
      poster: "/work/resonance-poster.jpg",
      liveHref: "https://resonance.alilinlab.com/",
    },
    label:
      "A physical feedback interface for world model outputs. Every frame of an AI-generated video becomes sculptable material in real time: brightness sculpts geometry, motion energy drives surface frequency. Built with Three.js and GLSL — a VideoTexture-to-GPU pipeline at 60fps, a pingpong framebuffer that lets the mesh remember previous frames, a 4×4 frequency map that shapes where the surface answers. Watch the form as the video plays: when something is wrong, you feel it in the mesh before you can say it in words.",
    specs: [
      "60fps VideoTexture → GPU",
      "Three.js / GLSL",
      "pingpong framebuffer · MEMORY",
      "4×4 DataTexture · RESONANCE",
      "Claude API · fal.ai",
      "live",
    ],
  },
});
