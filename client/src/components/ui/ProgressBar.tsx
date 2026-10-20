import { useRef } from 'react';
import { EASE_OUT, gsap, prefersReducedMotion, useGSAP } from '../../lib/motion';

interface ProgressBarProps {
  value: number;
  barClassName?: string;
  color?: string;
  className?: string;
}

export default function ProgressBar({
  value,
  barClassName = 'bg-dark-900',
  color,
  className = 'h-2 bg-dark-100',
}: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const width = `${Math.max(0, Math.min(100, value))}%`;

  useGSAP(() => {
    if (!barRef.current) return;

    if (prefersReducedMotion()) {
      gsap.set(barRef.current, { width });
      return;
    }

    gsap.to(barRef.current, { width, duration: 1, ease: EASE_OUT, overwrite: true });
  }, { dependencies: [width] });

  return (
    <div className={`overflow-hidden rounded-full ${className}`}>
      <div
        ref={barRef}
        className={`h-full rounded-full ${barClassName}`}
        style={{ width: 0, backgroundColor: color }}
      />
    </div>
  );
}
