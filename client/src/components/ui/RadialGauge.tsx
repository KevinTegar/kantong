import { useRef, type ReactNode } from 'react';
import { gsap, prefersReducedMotion, useGSAP } from '../../lib/motion';

interface RadialGaugeProps {
  value: number;
  marker?: number | null;
  arcColor?: string;
  size?: number;
  children?: ReactNode;
}

const CENTER = 100;
const ARC_RADIUS = 68;
const CIRCUMFERENCE = 2 * Math.PI * ARC_RADIUS;
const TICK_COUNT = 72;

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

export default function RadialGauge({
  value,
  marker = null,
  arcColor = '#f4c63d',
  size = 184,
  children,
}: RadialGaugeProps) {
  const arcRef = useRef<SVGCircleElement>(null);
  const markerRef = useRef<SVGGElement>(null);
  const progress = clampPercent(value);
  const markerProgress = marker === null ? null : clampPercent(marker);

  useGSAP(() => {
    const instant = prefersReducedMotion();
    const duration = instant ? 0 : 1.4;

    if (arcRef.current) {
      gsap.to(arcRef.current, {
        strokeDashoffset: CIRCUMFERENCE * (1 - progress / 100),
        duration,
        ease: 'power3.out',
        overwrite: true,
      });
    }

    if (markerRef.current && markerProgress !== null) {
      gsap.to(markerRef.current, {
        rotation: markerProgress * 3.6,
        svgOrigin: `${CENTER} ${CENTER}`,
        duration: instant ? 0 : 1.6,
        ease: 'power3.out',
        overwrite: true,
      });
    }
  }, { dependencies: [progress, markerProgress] });

  const ticks = Array.from({ length: TICK_COUNT }, (_, index) => {
    const angle = (index / TICK_COUNT) * Math.PI * 2;
    const isMajor = index % 6 === 0;
    const inner = isMajor ? 80 : 84;
    const outer = 90;
    const isActive = (index / TICK_COUNT) * 100 < progress;

    return (
      <line
        key={index}
        x1={CENTER + inner * Math.cos(angle)}
        y1={CENTER + inner * Math.sin(angle)}
        x2={CENTER + outer * Math.cos(angle)}
        y2={CENTER + outer * Math.sin(angle)}
        stroke={isActive ? '#413d36' : '#d7cfbe'}
        strokeWidth={isMajor ? 1.6 : 1}
        strokeLinecap="round"
      />
    );
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90" aria-hidden="true">
        <g>{ticks}</g>
        <circle cx={CENTER} cy={CENTER} r={ARC_RADIUS} fill="none" stroke="#efe9dc" strokeWidth="9" />
        <circle
          ref={arcRef}
          cx={CENTER}
          cy={CENTER}
          r={ARC_RADIUS}
          fill="none"
          stroke={arcColor}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
        {markerProgress !== null ? (
          <g ref={markerRef}>
            <circle cx={CENTER + ARC_RADIUS} cy={CENTER} r="5.5" fill="#181715" stroke="#ffffff" strokeWidth="2" />
          </g>
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  );
}
