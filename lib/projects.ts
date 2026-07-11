export type Project = {
  slug: string;
  title: string;
  thesis: string;
  role: string;
  type: string;
  /** Stack as shown in the case page metadata row, verbatim. */
  stack: string;
  /** Tags as shown in the home index, verbatim. */
  tags: string;
  /** Optional status note appended to the tags in the home index. */
  status?: string;
  year: string;
  /** Live demo URL. Null renders a disabled slot showing demoNote. */
  demo: string | null;
  demoNote?: string;
  /** Optional note shown inside the video slot placeholder. */
  mediaNote?: string;
  interaction: string[];
  /** Optional mono list rendered after the interaction paragraphs. */
  interactionList?: string[];
  architecture: {
    intro?: string;
    points: string[];
  };
  extend: {
    company: "Krea" | "Runway" | "Moonvalley";
    body: string;
  };
};

export const projects: Project[] = [
  {
    slug: "latent",
    title: "Latent",
    thesis: "Dehancer assumes you've shot something. We assume you haven't.",
    role: "Sole Designer & Engineer",
    type: "Solo project",
    stack: "React · TypeScript · WebGL · GLSL",
    tags: "React / TypeScript / WebGL / GLSL",
    status: "Shipping August 2026",
    year: "2026",
    demo: null,
    demoNote: "Live demo coming soon",
    mediaNote: "Shipping August 2026",
    interaction: [
      "A WebGL film-physics engine for AI-generated video. Five film-emulation parameters applied as a realtime shader pipeline. [content in progress]",
    ],
    architecture: {
      intro:
        "5-layer pipeline: linearize sRGB → color response remap → halation → grain → highlight roll-off → re-encode. [content in progress]",
      points: [],
    },
    extend: {
      company: "Krea",
      body: "How this fits Runway / Krea's post-generation pipeline. [content in progress]",
    },
  },
  {
    slug: "resonance",
    title: "Resonance",
    thesis: "A physical feedback interface for world model outputs.",
    role: "Sole Designer & Engineer",
    type: "Solo project",
    stack: "Three.js · GLSL · Claude API · fal.ai · React · Vercel",
    tags: "Three.js / GLSL / Claude API / fal.ai",
    year: "2026",
    demo: "https://resonance.alilinlab.com/",
    interaction: [
      "AI video generation is a black box. Creators describe intent in words, receive unpredictable output, and judge results with their eyes alone — no physical intuition, no spatial feedback, no measurable control. Resonance turns every frame of an AI-generated video into sculptable material in real time. Brightness sculpts geometry. Motion energy drives surface frequency. When something is wrong, you feel it in the form before you can say it in words.",
    ],
    interactionList: [
      "INFLUENCE — ratio of AI-driven to procedural physics. At 0, pure GLSL simulation. At 1, the video sculpts the mesh.",
      "AMPLITUDE — magnitude of displacement. Maps to fal.ai's guidance scale.",
      "THRESHOLD — minimum luminance to trigger displacement. A photographer's luminosity mask as physics.",
      "MEMORY — temporal inertia via pingpong framebuffer. The mesh remembers previous frames.",
      "RESONANCE — frequency of response to motion energy, via a 4×4 DataTexture spatial frequency map.",
    ],
    architecture: {
      points: [
        "VideoTexture → GPU realtime pipeline (60fps)",
        "Ridged multifractal noise + luminance blend (GLSL)",
        "Pingpong WebGLRenderTarget for MEMORY",
        "4×4 DataTexture frequency map for RESONANCE",
        "Latent-space mapping: INFLUENCE → denoising strength, AMPLITUDE → guidance scale, THRESHOLD → luminosity mask",
        "Session recorder: full parameter timeline, exportable JSON",
        "Claude API: realtime form analysis → prompt suggestion",
        "fal.ai: in-app generation with canvas frame as image reference",
      ],
    },
    extend: {
      company: "Runway",
      body: "The next phase uses physics simulation as a spatial consistency validator for world-model output. If a generated scene has an inconsistent light source, the physics readout surfaces it as a form anomaly before the creator consciously identifies it. A generation feedback layer that speaks the language of materials, not words.",
    },
  },
  {
    slug: "skeletal-silk",
    title: "Skeletal Silk",
    thesis: "AI as material interpreter, not image generator.",
    role: "Sole Designer & Engineer",
    type: "Experimental",
    stack: "Claude Vision · GLSL · Three.js",
    tags: "Claude Vision / GLSL / Three.js",
    year: "2026",
    demo: "https://skeletal-silk.alilinlab.com/",
    interaction: [
      "A fabric is photographed. Claude Vision reads its surface — gloss, rigidity, flow — and returns not a description but a set of numbers. Those numbers enter a GLSL shader as uniforms. What renders is not the fabric. It is what the fabric would become if bone grew through it. AI is used not as an image generator but as a material interpreter: the output is not a picture but a coordinate in shader space.",
    ],
    architecture: {
      points: [
        "Claude Vision: image → material parameters (gloss, rigidity, flow)",
        "Parameters passed as GLSL uniforms",
        "Realtime Three.js render",
      ],
    },
    extend: {
      company: "Moonvalley",
      body: "Skeletal Silk proves a pattern. The AI reads a material and returns shader parameters, not an image. The same interpreter can move from a static fabric to every frame of a video, which is what Latent does. For Krea or Runway this changes what a model output is: physical parameters you can control, not a black box image you can only regenerate. Control lives at the parameter layer, not the prompt layer.",
    },
  },
  {
    slug: "vestige",
    title: "Vestige",
    thesis: "A digital product passport built to outlast the first sale.",
    role: "Design Engineer",
    type: "Capstone, provisional patent applied",
    stack: "ZK-SNARKs · NFC (NTAG 424 DNA) · Smart Contracts · R3F · GLSL",
    tags: "ZK-SNARKs / NFC / Smart Contracts / R3F",
    year: "2026",
    demo: "https://vestige.alilinlab.com/",
    interaction: [
      "Vestige turns EU Digital Product Passport compliance into luxury brand value. For the brand it is infrastructure: ZK-verified provenance, NFC authentication, and smart-contract royalties that route value back on every resale. For the consumer it is intimacy with the object: a tap that wakes a real-time 3D twin, which evolves each time a moment is added. Two stakeholders, one source of truth. Selective disclosure lets one passport present three views, so regulators get transparency without exposing the brand's supplier list.",
    ],
    architecture: {
      points: [
        "ZK-SNARKs: privacy-preserving selective disclosure",
        "NFC (NTAG 424 DNA): tamper-resistant physical authentication",
        "Smart-contract royalty protocol: perpetual secondary-market participation",
        "R3F / GLSL: real-time evolving digital twin",
      ],
    },
    extend: {
      company: "Runway",
      body: "Vestige is not a single product. The architecture is a template: ZK proofs, NFC authentication and a realtime twin, rethemed per brand. One retheme already exists, a Coachtopia version that reuses the same stack under a different visual identity. What it demonstrates is serious system design plus a componentized front end built for reuse, not a one-off demo.",
    },
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
