/** Projects V3.1. Media remains at its original path; unknown details stay explicit. */
export const expandedProjects = [
  { id: 'latent', name: 'Latent', year: '2026', description: 'A film physics engine that gives AI video real halation and grain, running in a browser tab.', discipline: 'Graphics engine', stack: 'WebGL2 · GLSL', status: 'Live', href: '/work/latent', live: 'https://latentfilm.com', image: '/case-assets/latent/workbench.webp', alt: 'Latent calibration workbench showing a reference film scan, engine output, and halation controls.' },
  { id: 'teardown', name: 'Teardown №1', year: '2026', description: 'A measurement study of a hosted image generation API, built to turn “it feels fast” into numbers.', discipline: 'Measurement study', stack: 'TypeScript · React · fal API', status: 'Live', href: '/work/teardown', live: 'https://teardown.alilinlab.com', image: '/case-assets/teardown/teardown-demo-poster.webp', alt: 'Teardown image-generation API measurement interface and benchmark display.' },
  { id: 'preserve', published: false, name: 'Preserve', year: 'Details forthcoming', description: 'Project details forthcoming.', discipline: 'Not documented', stack: 'Not documented', status: 'Details forthcoming', href: null, live: null, image: null, alt: '' },
  { id: 'framefield', name: 'FRAMEFIELD', year: '2026', description: 'A visual control library that turns camera, lens and composition choices into instructions an image model can follow.', discipline: 'Generative tools', stack: 'TypeScript · Three.js · WebGL · Vite · OpenAI API', status: 'IN ACTIVE DEVELOPMENT', note: 'Developed for Meta Hackathon 2026', href: null, live: 'https://framefield.alilinlab.com/', image: null, alt: '' },
];

/** Published Projects page rows; retain hidden entries above for restoration. */
export const publishedProjects = expandedProjects.filter(project => project.published !== false);
