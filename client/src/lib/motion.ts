import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);
// Lists are often empty (no transactions yet); selector-based tweens may legitimately match nothing
gsap.config({ nullTargetWarn: false });

export const EASE_OUT = 'power3.out';

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export { gsap, useGSAP };
