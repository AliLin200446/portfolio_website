// Vertex stage. hero.common.glsl is prepended by ShaderBackground.tsx.
// Displaces the subdivided paper plane by the ink height field and
// derives normals by finite differences over the same field.

void main() {
  // Remap plane uv so vUv matches viewport uv (the plane is overscanned).
  vUv = (uv - 0.5) * OVERSCAN + 0.5;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2(vUv.x * aspect, vUv.y);

  float lift = RELIEF_ON ? RELIEF_HEIGHT : 0.0;
  float h = inkHeight(p);
  float hx = inkHeight(p + vec2(RELIEF_EPS, 0.0));
  float hy = inkHeight(p + vec2(0.0, RELIEF_EPS));

  // p spans 1.0 over uViewSize.y world units, so the world-space slope is
  // lift * dh/dp / uViewSize.y on both axes.
  vec2 grad = vec2(hx - h, hy - h) / RELIEF_EPS * lift / uViewSize.y;
  vNormal = normalize(normalMatrix * vec3(-grad, 1.0));

  vec3 pos = vec3(position.xy * uViewSize * OVERSCAN, h * lift);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
