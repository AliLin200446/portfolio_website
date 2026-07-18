import * as THREE from "three";

/*
 * Shared bench reflection world: tiny procedural equirect (256×128),
 * paper-warm sky, warm grey ground, one bright window band, a dark
 * bench mass — no blue anywhere. Gives polished metal (B2 fork arms,
 * B4 steel work) something honest to reflect. One instance per app.
 */
let cached: THREE.CanvasTexture | null = null;

export function makeBenchEnvMap() {
  if (cached) return cached;
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 128;
  const g = c.getContext("2d")!;
  const grad = g.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, "#fdf8ee");
  grad.addColorStop(0.55, "#e6dfd0");
  grad.addColorStop(1, "#a89f8e");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 128);
  g.fillStyle = "rgba(255,251,242,0.95)";
  g.fillRect(24, 14, 52, 46); // the window
  g.fillStyle = "rgba(120,110,95,0.5)";
  g.fillRect(150, 80, 106, 48); // dark bench mass
  const t = new THREE.CanvasTexture(c);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  cached = t;
  return t;
}
