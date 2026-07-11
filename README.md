# Ali Lin — Portfolio

Design engineer portfolio. Next.js 15 App Router, TypeScript, Tailwind CSS, @react-three/fiber.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build, must pass before deploy
```

## Structure

```
app/
  page.tsx              home: shader hero + project index
  about/page.tsx        about + contact
  work/[slug]/page.tsx  shared case study template, statically generated
components/
  ShaderBackground.tsx  fullscreen R3F shader, 30fps cap, pauses when hidden
lib/
  projects.ts           single source of truth for all project content
public/shaders/
  hero.frag             the hero fragment shader
```

All colors and font roles are CSS variables in `app/globals.css`. Nothing else defines color.

## Replace the hero shader

The shader is split across three files in `public/shaders/`, fetched at runtime and concatenated by `ShaderBackground.tsx`, so no build config is involved:

- `hero.common.glsl` — uniforms, the full TUNING block, noise, the ink field. Prepended to both stages; everything is defined once.
- `hero.vert` — displaces the subdivided paper plane by the ink height field, finite-difference normals.
- `hero.frag` — ink color, halftone develop, relief lighting.

Uniforms supplied by `ShaderBackground.tsx`:

```glsl
uniform float uTime;       // seconds, pauses when tab is hidden
uniform vec2  uResolution; // canvas size in physical pixels
uniform vec2  uViewSize;   // world-unit size of the visible paper
uniform vec3  uMouse;      // xy pointer in uv (y up), z time of last move
uniform vec4  uTrail[32];  // xy spawn pos, z spawn time, w strength
```

`uTrail` is a ring buffer of ink spawn points fed by pointer events; its size must match `TRAIL_COUNT` in `ShaderBackground.tsx`. All shader knobs (bleed, halftone, relief height, light) live in the TUNING block at the top of `hero.common.glsl`; mesh subdivisions, camera and parallax are constants at the top of `ShaderBackground.tsx`. Fallback switches: `RELIEF_ON = false` flattens back to the 2D halftone look, `HALFTONE_ON = false` gives the pure ink wash. The dev server does not hot-reload files in `public/`, so refresh the page after editing shaders.

Constraints the component enforces for you: 30fps cap, pause on hidden tab, sleep once all ink has faded, static paper under prefers-reduced-motion, dpr capped at 1.5. If the fetch or WebGL fails it falls back to static paper, so a broken shader never blanks the hero.

## Add a case study video

Each case page has a marked `video slot` container in `app/work/[slug]/page.tsx`. Replace the placeholder div contents with:

```tsx
<video
  className="h-full w-full object-cover"
  poster="/work/<slug>/poster.jpg"
  src="/work/<slug>/demo.mp4"
  muted loop playsInline autoPlay
/>
```

Put assets in `public/work/<slug>/`. Keep recordings around 30 seconds, 16:9, H.264, target under 8 MB.

All text content (thesis, metadata, section copy, demo URLs) lives in `lib/projects.ts`. Edit there, not in the template.

## Deploy to Vercel

```bash
npx vercel        # preview
npx vercel --prod # production
```

Or push the repo to GitHub and import it in the Vercel dashboard. No environment variables, no build settings beyond the defaults. All routes are static.
