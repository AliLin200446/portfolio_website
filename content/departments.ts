import { experiments } from "./experiments";
import { orderedPhotos, colorSections } from "./photography-color-edit";
export { orderedPhotos, colorSections };

export type LabEntry = { id: string; name: string; description: string; image: string; tags: string[]; technology: string; interaction: string; live?: string; href?: string; embed?: boolean };
export const laboratory: LabEntry[] = [
  { id: "material-memory", name: "Material Memory", description: "A real-time fabric simulator that lets a buyer feel a garment before they buy it.", image: "/case-assets/material-memory/hero-front.webp", tags: ["Physics", "3D"], technology: "Three.js / GLSL", interaction: "Push, drop and drag the fabric in the live simulator.", live: "https://material-memory.alilinlab.com", href: "/work/material-memory", embed: true },
  { id: "skeletal-silk", name: "Skeletal Silk", description: "A vision model reads a fabric photo into four numbers that drive a material shader.", image: "/case-assets/skeletal-silk/hero-front.webp", tags: ["Shader", "AI", "3D"], technology: "Claude Vision / GLSL / Three.js", interaction: "Upload a fabric photograph in the live tool to drive its material shader and export the result.", live: "https://skeletal-silk.alilinlab.com", href: "/work/skeletal-silk" },
  { id: "resonance", name: "Resonance", description: "A physical feedback interface for world model outputs.", image: "/experiments/resonance.webp", tags: ["AI", "3D"], technology: "Three.js / WebGL", interaction: "Steer the render, generate video, then re-ingest it as the next input.", live: "https://resonance.alilinlab.com", href: "/work/resonance" },
  { id: "tailors-time", name: "Tailor’s Time", description: "A visual study preserved in the experiment archive.", image: "/experiments/tailors-time/preview.png", tags: ["Study"], technology: "Not documented", interaction: "Image preview only. A live interaction has not been documented." },
  ...experiments.filter(item => !["Material Memory", "Resonance"].includes(item.name)).map(item => ({
    id: item.name.toLowerCase().replaceAll(" ", "-"), name: item.name, description: item.line,
    image: item.shot!, tags: item.tags.map(tag => tag === "3d" ? "3D" : tag === "generative" ? "Generative" : tag === "web3" ? "Web3" : "Web"),
    technology: item.stack ?? "Not documented", interaction: "Static preview. Open the original project to explore its interaction.",
    ...(item.href?.startsWith("/") ? { href: item.href } : { live: item.href }),
  })),
];

export { films } from "@/lib/generative/pieces";
export type { FilmClip, Film } from "@/lib/generative/pieces";
