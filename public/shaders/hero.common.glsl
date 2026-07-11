// Shared between hero.vert and hero.frag. ShaderBackground.tsx prepends
// this file to both stages, so uniforms, tuning and the ink field are
// defined exactly once.
//
// Uniforms supplied by ShaderBackground.tsx:
//   uTime        seconds, pauses when the tab is hidden
//   uResolution  canvas size in physical pixels
//   uViewSize    world-unit size of the visible paper at the camera distance
//   uMouse       xy pointer position in uv (y up), z time of last move
//   uTrail[N]    xy spawn position, z spawn time, w strength (0 = unused)
precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uViewSize;
uniform vec3 uMouse;

const int TRAIL_N = 32; // must match TRAIL_COUNT in ShaderBackground.tsx
uniform vec4 uTrail[TRAIL_N];

// vUv is viewport uv (matches pointer coords), not plane uv.
varying vec2 vUv;
varying vec3 vNormal; // view-space normal of the displaced paper

// ---- tuning ------------------------------------------------------
// ink bleed
const float BLOT_RADIUS = 0.16;  // max bleed radius, uv units
const float GROW_SPEED  = 0.9;   // how fast a blot reaches full size
const float FAST_DECAY  = 0.30;  // initial absorption rate
const float SLOW_DECAY  = 0.045; // rate the faint stain fades at
const float RESIDUE     = 0.22;  // fraction of ink left as stain
const float EDGE_ROUGH  = 0.55;  // fibrous irregularity of the edge
const float WARP_SCALE  = 3.0;   // domain warp frequency
const float WARP_AMP    = 0.35;  // domain warp strength
const float FIBER_SCALE = 24.0;  // paper fiber frequency inside the ink
const float TIP_RADIUS  = 0.05;  // wet tip under the cursor
const float INK_MAX     = 0.50;  // peak ink opacity, keeps text readable

// halftone screen, layered on top of the ink density field
const bool  HALFTONE_ON     = true; // false skips the screen, pure ink wash
const float HALFTONE_SCALE  = 80.0; // dot rows per viewport height: ~40 newsprint, ~160 photo
const float HALFTONE_MIX    = 0.65; // 0 = continuous wash, 1 = full dot screen
const float HALFTONE_ANGLE  = 15.0; // screen rotation in degrees, print classic
const float HALFTONE_SOLID  = 0.70; // density above which ink stays continuous
const float HALFTONE_DOTMAX = 0.75; // max dot radius in cell units, >0.5 merges solid

// 3D relief
const bool  RELIEF_ON     = true;  // false = flat plane, the previous 2D look
const float RELIEF_HEIGHT = 0.07;  // mound height in world units, ~5% of view height
const float RELIEF_EPS    = 0.02;  // finite-difference step for normals
const float OVERSCAN      = 1.12;  // plane oversize so the parallax tilt never shows an edge

// lighting (direction is in view space, x right, y up, z toward viewer)
const vec3  LIGHT_DIR      = vec3(-0.45, 0.55, 0.75); // upper-left sidelight
const float LIGHT_AMBIENT  = 0.55; // fill light floor
const float LIGHT_STRENGTH = 0.85; // relief shading contrast, 0 = unlit

// vermilion accent
const float OX_START  = 0.72; // density where the vermilion shows
const float OX_AMOUNT = 0.35; // max vermilion blend

// paper
const float PAPER_GRAIN = 0.018; // idle paper texture
// ------------------------------------------------------------------

const vec3 PAPER   = vec3(0.961, 0.949, 0.925); // #F5F2EC
const vec3 INK     = vec3(0.102, 0.102, 0.102); // #1A1A1A
const vec3 OXBLOOD = vec3(0.604, 0.231, 0.133); // #9A3B22

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * noise(p);
    p *= 2.0;
    amp *= 0.5;
  }
  return v;
}

float fiberAt(vec2 p) {
  return fbm(p * FIBER_SCALE);
}

// One ink blot: grows outward from its spawn point, dense core, thin rim,
// absorbed into a faint long-lived stain.
float blot(vec2 p, vec2 center, float birth, float strength, float fiber) {
  float age = uTime - birth;
  if (age <= 0.0 || strength <= 0.0) return 0.0;
  float r = BLOT_RADIUS * (1.0 - exp(-age * GROW_SPEED));
  float env = mix(RESIDUE * exp(-age * SLOW_DECAY), 1.0, exp(-age * FAST_DECAY));
  float d = length(p - center) * (1.0 + (fiber - 0.5) * EDGE_ROUGH);
  float t = 1.0 - smoothstep(0.0, max(r, 1e-4), d);
  return pow(t, 1.6) * env * strength;
}

// Unclamped ink at paper point p (aspect-corrected viewport coords).
// Every blot bleeds along the same fixed fiber field, so overlapping
// strokes stay coherent.
float inkSum(vec2 p, float fiber) {
  vec2 q = vec2(fbm(p * WARP_SCALE), fbm(p * WARP_SCALE + vec2(5.2, 1.3)));
  vec2 pw = p + (q - 0.5) * WARP_AMP * 0.2;
  float aspect = uResolution.x / uResolution.y;

  float sum = 0.0;
  for (int i = 0; i < TRAIL_N; i++) {
    vec4 s = uTrail[i];
    sum += blot(pw, vec2(s.x * aspect, s.y), s.z, s.w, fiber);
  }

  // Fresh wet tip under the cursor, gone quickly once it stops.
  float tipEnv = exp(-max(uTime - uMouse.z, 0.0) * 2.5);
  float dTip = length(pw - vec2(uMouse.x * aspect, uMouse.y))
             * (1.0 + (fiber - 0.5) * EDGE_ROUGH);
  sum += pow(1.0 - smoothstep(0.0, TIP_RADIUS, dTip), 1.6) * tipEnv * 0.6;

  return sum;
}

// Smooth 0..1 height field driving the relief displacement.
float inkHeight(vec2 p) {
  return 1.0 - exp(-inkSum(p, fiberAt(p)));
}
