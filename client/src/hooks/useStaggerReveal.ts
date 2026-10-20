import { useRef } from 'react';
import { EASE_OUT, gsap, prefersReducedMotion, useGSAP } from '../lib/motion';

/**
 * Staggered entrance for every `[data-reveal]` element inside the returned scope.
 * Elements are revealed once; re-runs (e.g. after data loads) only pick up new ones.
 */
export function useStaggerReveal<T extends HTMLElement = HTMLDivElement>(dependencies: unknown[] = []) {
  const scope = useRef<T>(null);

  useGSAP(() => {
    if (!scope.current) return;

    const items = gsap.utils
      .toArray<HTMLElement>('[data-reveal]', scope.current)
      .filter((item) => item.dataset.revealed !== 'true');

    if (items.length === 0 || prefersReducedMotion()) return;

    gsap.fromTo(
      items,
      { autoAlpha: 0, y: 28, scale: 0.985 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: EASE_OUT,
        stagger: 0.07,
        clearProps: 'transform,opacity,visibility',
        // Marked on start (first tick), so a StrictMode revert before that still replays it
        onStart: () => {
          items.forEach((item) => {
            item.dataset.revealed = 'true';
          });
        },
      }
    );
  }, { scope, dependencies });

  return scope;
}
