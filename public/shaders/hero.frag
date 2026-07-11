// Fragment stage. hero.common.glsl is prepended by ShaderBackground.tsx.
// Ink color, halftone develop, relief lighting.

// Halftone screen: rotated regular dot grid anchored to the paper, dot
// area follows the ink density so tone is preserved on average.
float halftone(vec2 p, float tone) {
  float a = radians(HALFTONE_ANGLE);
  mat2 rot = mat2(cos(a), -sin(a), sin(a), cos(a));
  vec2 cell = fract(rot * p * HALFTONE_SCALE) - 0.5;
  // sqrt keeps dot AREA proportional to tone
  float r = HALFTONE_DOTMAX * sqrt(tone);
  float aa = 1.2 * HALFTONE_SCALE / uResolution.y; // ~1px edge smoothing
  return 1.0 - smoothstep(r - aa, r + aa, length(cell));
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2(vUv.x * aspect, vUv.y);

  // Layered ink saturates softly. Fiber modulates absorption, so the
  // wash reads as paper drinking the ink, not a flat gradient.
  float fiber = fiberAt(p);
  float density = (1.0 - exp(-inkSum(p, fiber))) * (0.8 + 0.4 * fiber);
  float tone = clamp(density, 0.0, 1.0);

  // Develop through the halftone screen. Dense cores stay continuous
  // ink; the fringe breaks into dots that shrink away as ink fades.
  if (HALFTONE_ON) {
    float dots = halftone(p, tone);
    float breakup = HALFTONE_MIX * (1.0 - smoothstep(HALFTONE_SOLID, 1.0, tone));
    tone = mix(tone, dots, breakup);
  }

  vec3 col = PAPER + (noise(p * 90.0) - 0.5) * 2.0 * PAPER_GRAIN;
  col = mix(col, INK, tone * INK_MAX);

  // Vermilion, only where the ink pools densest. Gated by the developed
  // tone so in dot regions it only shows inside solid dots.
  float ox = smoothstep(OX_START, 1.0, density) * OX_AMOUNT * (0.4 + 0.6 * fiber);
  col = mix(col, OXBLOOD, ox * tone);

  // Relief lighting, normalized so flat paper keeps its exact color.
  if (RELIEF_ON) {
    vec3 n = normalize(vNormal);
    vec3 l = normalize(LIGHT_DIR);
    float diff = max(dot(n, l), 0.0);
    float flatDiff = max(l.z, 0.0);
    float shade = (LIGHT_AMBIENT + (1.0 - LIGHT_AMBIENT) * diff)
                / (LIGHT_AMBIENT + (1.0 - LIGHT_AMBIENT) * flatDiff);
    col *= 1.0 + (shade - 1.0) * LIGHT_STRENGTH;
  }

  gl_FragColor = vec4(col, 1.0);
}
