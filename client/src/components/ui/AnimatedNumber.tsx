import { useRef } from 'react';
import { gsap, prefersReducedMotion, useGSAP } from '../../lib/motion';

interface AnimatedNumberProps {
  value: number;
  format?: (value: number) => string;
  duration?: number;
  className?: string;
}

const defaultFormat = (value: number) => Math.round(value).toLocaleString('id-ID');

/**
 * Counts from the previous value to the new one. Text is written straight to the DOM
 * (no re-render per frame), so React never owns the span's children.
 */
export default function AnimatedNumber({
  value,
  format = defaultFormat,
  duration = 1.1,
  className = '',
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const state = useRef({ value: 0 });

  useGSAP(() => {
    const element = ref.current;
    if (!element) return;

    const render = () => {
      element.textContent = format(state.current.value);
    };

    if (prefersReducedMotion()) {
      state.current.value = value;
      render();
      return;
    }

    render();
    gsap.to(state.current, {
      value,
      duration,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: render,
    });
  }, { dependencies: [value] });

  return <span ref={ref} className={`tabular-nums ${className}`} />;
}
