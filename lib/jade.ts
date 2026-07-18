import * as THREE from "three";

/*
 * White-jade SSS — Aura path (a): the physical-material parameter set
 * (the Aura shader source is not in this repo; when it lands as (b),
 * this module is the single swap point). Shared by B3 cocoon
 * (thickness 0.4) and B5 seal knob (thickness 0.3 — thinner, brighter
 * edge glow: the asset's second use).
 */
export function makeJadeMaterial(overrides?: {
  thickness?: number;
  roughness?: number;
}) {
  return new THREE.MeshPhysicalMaterial({
    color: "#F2EDE3",
    attenuationColor: "#D9C9A8",
    attenuationDistance: 0.8,
    thickness: overrides?.thickness ?? 0.4,
    transmission: 0.55,
    roughness: overrides?.roughness ?? 0.42,
    clearcoat: 0.12,
  });
}
