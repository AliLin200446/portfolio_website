"use client";

import { useEffect, useState } from "react";
import { useBenchStore } from "@/lib/benchStore";

/*
 * BUNDLE RULE, and it is not a style preference:
 *
 *   Nothing from three, fiber or drei at module scope in any eagerly
 *   imported file. One static import defeats the dynamic one. This
 *   cost 100 kB gz on the home page until 2026-08.
 *
 * The mechanism: WorkGrid is loaded with dynamic(ssr:false) so the 3D
 * module stays out of the first paint. This file is NOT dynamic, and
 * it sat one `import { useProgress } from "@react-three/drei"` away
 * from the whole three dependency tree. That single line pulled the
 * 383 kB three chunk into the home route's First Load, where it
 * blocked the first paint of a page whose first paint is deliberately
 * plain DOM. The dynamic import had been correct the whole time and
 * was doing nothing. Do not import drei here to get a progress readout
 * back; feed it through setBoot from inside WorkGrid, which is already
 * dynamic.
 *
 * ── THE INTRO ─────────────────────────────────────────────────────
 *
 * Three statements, revealed one at a time, then the site. It replaces
 * a counter and a progress bar whose argument was "honest readout, not
 * loading theater": the number only ever chased the real milestones, so
 * if reality plateaued the bar stopped, and that stop was the point.
 *
 * That honesty is kept where it actually matters and dropped where it
 * was only decoration. KEPT: this overlay still cannot leave before the
 * scene is genuinely ready, and on a slow connection it holds. DROPPED:
 * the reader is no longer shown a number while it waits. The cost is
 * real and worth stating plainly — a visitor on a bad connection now
 * sees a still composition with no sign that anything is still
 * happening, where before they saw a bar stop moving.
 *
 * TWO CLOCKS, AND NEITHER ONE DRIVES THE OTHER:
 *
 *   1. the intro timeline — fixed, ~1.6s, starts once on mount
 *   2. site readiness     — bootTarget hits 100 when WorkGrid has
 *                           compiled its shaders
 *
 * The overlay leaves when BOTH have finished. Whichever lands second
 * sets the pace: a fast load waits for the sentences, a slow load holds
 * the finished sentences until the scene is up. The timeline effect has
 * EMPTY deps on purpose, so a change in boot state can never restart
 * the sequence half way through. That was the one behaviour most likely
 * to look like a glitch and is the reason the two are not merged.
 */

/** Set by WorkGrid once the scene is compiled. The string is shared by
 *  value, not by import: this overlay is deliberately plain DOM and
 *  must not pull the 3D module into the first paint. */
const READY_KEY = "bench-ready";

/* When each line begins, in ms from mount. The first is not 0: at 0 the
 * line would be in its finished state on the very first paint and there
 * would be nothing to animate from. */
const LINE_AT = [60, 380, 700] as const;
const REVEAL_MS = 460;
/** How long the completed composition holds before the exit begins. */
const HOLD_MS = 460;
/** 700 + 460 + 460 = 1620ms to a finished, held composition. */
const INTRO_MS = LINE_AT[2] + REVEAL_MS + HOLD_MS;
/** Short enough to disappear into the page rather than announce itself. */
const EXIT_MS = 320;

const LINES = [
  "Hi, I’m Ali Lin.",
  "I’m a Design Engineer working across generative AI and visual systems.",
  "I prototype, evaluate, and build tools for how images are made.",
] as const;

export default function BenchLoader() {
  const bootTarget = useBenchStore((s) => s.bootTarget);

  /* Same rule as before, read one commit earlier. Within a session that
   * already booted once, ANY return to the home page skips the intro:
   * the runtime is cached and there is nothing to wait for, so replaying
   * an introduction on every trip back from a case page would make it an
   * interstitial rather than an entrance. WorkGrid writes the key when
   * boot reaches 100.
   *
   * This was a useEffect, which is a frame too late to be a skip. A case
   * page is a full document load here, not a client-side route change
   * (checked, rather than assumed: a marker set on window does not
   * survive the trip), so the loader genuinely re-mounts every time a
   * visitor comes back. With the check in an effect, the sequence on
   * each return was: commit the overlay, paint it, then read the key and
   * remove it. That is a one frame flash of the whole introduction on a
   * page that is supposed to skip it, and it is exactly the kind of
   * thing that will not show up in a screenshot.
   *
   * Reading it in the initializer means the overlay is never committed
   * at all on a repeat visit. Safe from a hydration mismatch because
   * this component is not part of the server tree: HomeShell renders it
   * behind the useBench3d gate, which is false until its own effect
   * runs, so BenchLoader only ever mounts on the client. */
  const [phase, setPhase] = useState<"intro" | "exit" | "gone">(() =>
    sessionStorage.getItem(READY_KEY) === "1" ? "gone" : "intro"
  );
  const [introDone, setIntroDone] = useState(false);

  /* Clock 1. Empty deps: this must run exactly once, so that nothing
   * about loading can restart the sequence mid-sentence. Reduced motion
   * is read here rather than in its own effect because the answer is
   * needed on this first pass, and an effect that sets a ref for a
   * later effect would be one render too late. */
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setIntroDone(true);
      return;
    }
    const id = setTimeout(() => setIntroDone(true), INTRO_MS);
    return () => clearTimeout(id);
  }, []);

  /* Clock 2 meets clock 1. Both conditions, never one. */
  const ready = bootTarget >= 100;

  /* These are two effects for a reason, and merging them back is the
   * bug this comment exists to prevent. Written first as one effect
   * that flipped the phase and scheduled the unmount together, with
   * phase in its own dependency list:
   *
   *     setPhase("exit");
   *     const id = setTimeout(() => setPhase("gone"), EXIT_MS);
   *     return () => clearTimeout(id);          // deps: [phase, ...]
   *
   * Setting the phase changed a dependency of the effect that had just
   * set it, so React ran the cleanup and cleared the timeout that was
   * the only thing left to unmount the overlay. The sheet faded to
   * opacity 0 and then stayed in the tree for the life of the page.
   *
   * It is invisible and pointer-transparent by then, which is why no
   * amount of watching the animation would have found it: every frame
   * a visitor sees is correct. It was caught by reading the component's
   * committed state rather than looking at the screen. */
  useEffect(() => {
    if (phase !== "intro" || !introDone || !ready) return;
    setPhase("exit");
  }, [phase, introDone, ready]);

  /* The unmount timer keyed on the exit phase alone. Its cleanup now
   * fires only when the phase leaves "exit", which is the transition
   * this timeout itself causes. */
  useEffect(() => {
    if (phase !== "exit") return;
    const id = setTimeout(() => setPhase("gone"), EXIT_MS);
    return () => clearTimeout(id);
  }, [phase]);

  if (phase === "gone") return null;

  const leaving = phase === "exit";

  return (
    /* aria-hidden is kept from the previous loader rather than changed.
     * This layer removes itself after a second or two, and an overlay
     * that announces three sentences and then vanishes mid-read is worse
     * for a screen reader than one it never enters. The same three facts
     * are on /about as permanent text. One attribute to reverse if that
     * trade looks wrong. */
    <div
      aria-hidden
      className="fixed inset-0 z-[5]"
      style={{
        background: "var(--paper)",
        opacity: leaving ? 0 : 1,
        transition: `opacity ${EXIT_MS}ms ease`,
        pointerEvents: leaving ? "none" : "auto",
      }}
    >
      {/* Left aligned on the site's own measure, not centred in the
          viewport: max-w-5xl and px-6 are what the top bar's inner row
          uses, so the first line starts on the same x as the ALI LIN
          mark above it and the composition belongs to the page rather
          than floating in it. */}
      <div className="mx-auto flex h-full max-w-5xl items-center px-6">
        {/* 24rem, swept rather than estimated. The first guess at 22rem
            came from arithmetic on an assumed character width and was
            wrong: it fixed line 3 and pushed line 2 to three lines.
            Measured across 330-470px, the window where line 2 wraps to
            two AND line 3 wraps to two is 360-410px, so this sits at
            384px, the middle of it. Sitting mid-window rather than on an
            edge is the point: a font metric that shifts by a few pixels
            should not restructure the composition.

            It is a measure, not a hardcoded break. Narrower viewports
            still reflow naturally. */}
        <div className="max-w-[24rem]">
          <p
            /* Sentence case, deliberately. The site's mono labels are
               uppercase, and an `uppercase` class here would have cost
               nothing to type and rendered HI, I’M ALI LIN. — which is
               rewriting the copy through CSS rather than in the string. */
            className="intro-line font-mono font-medium text-[length:var(--text-body)] tracking-[0.06em] text-bronze-text"
            style={{ animationDelay: `${LINE_AT[0]}ms` }}
          >
            {LINES[0]}
          </p>
          <p
            className="intro-line mt-5 text-balance font-serif text-[length:var(--text-lead)] leading-snug text-ink"
            style={{ animationDelay: `${LINE_AT[1]}ms` }}
          >
            {LINES[1]}
          </p>
          <p
            /* text-balance on both sentences. At 384px line 3 broke as
               "...how images are / made." and a one word last line reads
               as a mistake in a composition this quiet. Balancing evens
               the two lines instead, and it does it at whatever width
               the viewport gives, so the fix survives a resize where a
               hand-placed break would not. */
            className="intro-line mt-4 text-balance font-serif text-[length:var(--text-body)] leading-relaxed text-muted"
            style={{ animationDelay: `${LINE_AT[2]}ms` }}
          >
            {LINES[2]}
          </p>
        </div>
      </div>
    </div>
  );
}
