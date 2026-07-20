"use client";

import { useEffect, useState } from "react";

/*
 * LOGO「显影中的印」— the developing seal. Square 0.5px frame, 林 as
 * two stroke-skeletons, the right stroke tipped with the single 45°
 * cut. Entrance = darkroom development, THREE beats ≤1.1s, ONCE per
 * session (sessionStorage), then permanently still:
 *   1 潜影 0–0.4s: faint grain (SVG feTurbulence — engine-grain echo,
 *     zero WebGL) with the mark latent at 8% ink
 *   2 显影 0.4–0.9s: the form settles upward out of the grain
 *     (clip-path inset sweeps bottom→up; direction locked upward),
 *     grain drains; the 45° cut is carved LAST (a paper triangle
 *     drops the tip corner at 0.8s — the sharp edge is the final
 *     stroke of the brush)
 *   3 定影 0.9–1.1s: a 2px oxblood square blinks outside the frame's
 *     lower-right — in by 1.0s, gone by 1.1s. 决策A: the dot exists
 *     only in this instant; the resting state is pure ink, so the
 *     screen never holds two cinnabar marks.
 * All motion is CSS keyframes on SVG — no rAF ever runs, nothing
 * loops, idle is structurally still (§5). reduced-motion renders the
 * final form directly (no animation, no dot). Hover on the resting
 * mark = a copper glint on the cut (§3 default; never cinnabar).
 */

const PLAYED_KEY = "logo-developed";

export default function LogoMark({ size = 22 }: { size?: number }) {
  const [animate, setAnimate] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const played = sessionStorage.getItem(PLAYED_KEY) === "1";
    if (!reduced && !played) {
      sessionStorage.setItem(PLAYED_KEY, "1");
      setAnimate(true);
    }
    setReady(true);
  }, []);

  // SSR/first paint: the static form (no flash of animation state)
  const cls = ready && animate ? "lm lm-dev" : "lm";
  return (
    <span className={cls} aria-label="alilinlab" style={{ display: "inline-flex" }}>
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        role="img"
        aria-hidden
      >
        <defs>
          <filter id="lm-grain" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
            <feColorMatrix values="0 0 0 0 0.10  0 0 0 0 0.09  0 0 0 0 0.08  0 0 0 0.6 0" />
          </filter>
        </defs>

        {/* beat 1 latent ghost: the mark faint inside the grain */}
        <g className="lm-ghost" aria-hidden>
          <rect x="1.25" y="1.25" width="29.5" height="29.5" fill="none" stroke="#1A1A1A" strokeWidth="0.5" />
          <rect x="11.5" y="8" width="1" height="16" fill="#1A1A1A" />
          <rect x="9" y="12" width="6" height="1" fill="#1A1A1A" />
          <rect x="17" y="12" width="6" height="1" fill="#1A1A1A" />
          <rect x="19.5" y="8" width="1" height="16" fill="#1A1A1A" />
        </g>

        {/* the ink form, revealed upward through a clip sweep */}
        <g className="lm-ink">
          <rect x="1.25" y="1.25" width="29.5" height="29.5" fill="none" stroke="#1A1A1A" strokeWidth="0.5" />
          <rect x="11.5" y="8" width="1" height="16" fill="#1A1A1A" />
          <rect x="9" y="12" width="6" height="1" fill="#1A1A1A" />
          <rect x="17" y="12" width="6" height="1" fill="#1A1A1A" />
          {/* right stroke drawn square-tipped; the cut is carved below */}
          <rect x="19.5" y="8" width="1" height="16" fill="#1A1A1A" />
        </g>

        {/* the 45° cut: a paper triangle carves the tip — LAST */}
        <path className="lm-cut" d="M20.5 23 L20.5 24 L19.5 24 Z" fill="#F5F2EC" />
        {/* copper glint over the cut edge (hover affordance, resting) */}
        <path className="lm-glint" d="M20.5 23 L19.5 24" stroke="#8C6A3F" strokeWidth="0.7" opacity="0" />

        {/* beat 1 grain sheet */}
        <rect className="lm-noise" x="0" y="0" width="32" height="32" filter="url(#lm-grain)" opacity="0" />

        {/* beat 3: the 2px cinnabar square, outside lower-right */}
        <rect className="lm-dot" x="31" y="31" width="2" height="2" fill="#9A3B22" opacity="0" />
      </svg>

      <style>{`
        .lm { color: #1A1A1A; }
        .lm .lm-ghost { opacity: 0; }
        .lm .lm-noise { opacity: 0; }
        .lm .lm-dot { opacity: 0; }
        .lm .lm-glint { transition: opacity 0.3s ease; }
        .lm:hover .lm-glint { opacity: 0.9; }

        .lm-dev .lm-ghost {
          opacity: 0.08;
          animation: lm-ghost-out 0.5s ease-out 0.4s forwards;
        }
        .lm-dev .lm-ink {
          clip-path: inset(100% 0 0 0);
          animation: lm-develop 0.5s ease-out 0.4s forwards;
        }
        .lm-dev .lm-cut {
          opacity: 0;
          animation: lm-carve 0.1s ease-out 0.8s forwards;
        }
        .lm-dev .lm-noise {
          animation: lm-grain-io 0.9s ease-out forwards;
        }
        .lm-dev .lm-dot {
          animation: lm-fix 0.2s ease-out 0.9s forwards;
        }

        @keyframes lm-ghost-out {
          to { opacity: 0; }
        }
        @keyframes lm-develop {
          from { clip-path: inset(100% 0 0 0); }
          to { clip-path: inset(0 0 0 0); }
        }
        @keyframes lm-carve {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes lm-grain-io {
          0% { opacity: 0; }
          45% { opacity: 0.45; }
          100% { opacity: 0; }
        }
        @keyframes lm-fix {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lm-dev .lm-ghost, .lm-dev .lm-ink, .lm-dev .lm-cut,
          .lm-dev .lm-noise, .lm-dev .lm-dot {
            animation: none;
          }
          .lm-dev .lm-ghost { opacity: 0; }
          .lm-dev .lm-ink { clip-path: none; }
          .lm-dev .lm-cut { opacity: 1; }
        }
      `}</style>
    </span>
  );
}
