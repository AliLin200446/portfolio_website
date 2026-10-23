'use client';
// 08 · Shared element. A row title becomes the case-study title.
//
// 1. Mount <ViewTransitionResolver /> once in app/layout.tsx.
// 2. Use <TransitionLink> for links that should morph.
// 3. Give the SAME name to the title on both pages:
//      style={{ viewTransitionName: vtName('latent') }}

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ComponentProps, type MouseEvent } from 'react';
import { prefersReducedMotion } from '../lib/motion';

let pendingResolve: (() => void) | null = null;

export const vtName = (slug: string) => `title-${slug.replace(/[^a-z0-9-]/gi, '-')}`;

type DocWithVT = Document & {
  startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void>; ready: Promise<void> };
};

export function TransitionLink({
  href,
  onClick,
  ...rest
}: ComponentProps<typeof Link> & { href: string }) {
  const router = useRouter();

  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const doc = document as DocWithVT;
    if (!doc.startViewTransition || prefersReducedMotion()) return; // plain navigation

    e.preventDefault();
    const transition = doc.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          pendingResolve = resolve;
          router.push(href);
          // Safety: never hold the transition longer than 1s.
          window.setTimeout(() => {
            if (pendingResolve === resolve) {
              pendingResolve = null;
              resolve();
            }
          }, 1000);
        }),
    );
    // Browsers can skip animation in background tabs; navigation still completes.
    void transition.ready.catch(() => {});
    void transition.finished.catch(() => {});
  };

  return <Link href={href} onClick={handle} {...rest} />;
}

/** Resolves the pending transition once the new route has rendered. */
export function ViewTransitionResolver() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pendingResolve) return;
    const r = pendingResolve;
    pendingResolve = null;
    r();
  }, [pathname]);
  return null;
}
