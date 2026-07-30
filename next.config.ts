import type { NextConfig } from "next";

/*
 * Production builds write to .next-build, not .next.
 *
 * `rm -rf .next && next build` has broken the running dev server ten
 * times in this project, always the same way: the build wipes chunks
 * the dev server still holds references to, and the next request dies
 * on "Cannot find module ./NNN.js". It is not a code fault and no
 * amount of remembering to stop the server first has prevented it.
 *
 * Separate directories make the collision impossible rather than
 * merely discouraged. Dev keeps .next; builds and their cleanup touch
 * only .next-build.
 */
const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === "production" ? ".next-build" : ".next",
};

export default nextConfig;
