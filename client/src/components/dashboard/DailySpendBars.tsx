import { useRef, useState } from 'react';
import { formatIDR, formatIDRCompact } from '../../lib/formatCurrency';
import { EASE_OUT, gsap, prefersReducedMotion, useGSAP } from '../../lib/motion';
import AnimatedNumber from '../ui/AnimatedNumber';
import PanelHeader from '../ui/PanelHeader';

interface DailySpendBarsProps {
  daily: number[];
  todayDay: number | null;
  weeklyAverage: number;
  className?: string;
}

const WEEK_START_DAYS = new Set([1, 8, 15, 22, 29]);

// Batang tipis per hari, padanan kartu "Progress" di Coterie
export default function DailySpendBars({ daily, todayDay, weeklyAverage, className = '' }: DailySpendBarsProps) {
  const scope = useRef<HTMLDivElement>(null);
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);
  const max = Math.max(...daily, 1);
  const lastSpendDay = daily.reduce((last, amount, index) => (amount > 0 ? index + 1 : last), 0);
  const activeDay = hoveredDay ?? todayDay ?? (lastSpendDay || null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;

    gsap.fromTo(
      '[data-daybar]',
      { scaleY: 0, transformOrigin: 'bottom center' },
      { scaleY: 1, duration: 0.8, ease: EASE_OUT, stagger: 0.015 }
    );
  }, { scope, dependencies: [daily.join(',')] });

  return (
    <div data-reveal className={`card flex flex-col p-5 ${className}`}>
      <PanelHeader title="Ritme harian" to="/reports" />

      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-[28px] font-light leading-none tracking-tight text-dark-900">
          <AnimatedNumber value={weeklyAverage} format={formatIDR} />
        </p>
      </div>
      <p className="mt-1 text-xs text-dark-500">rata-rata pengeluaran / minggu</p>

      <div ref={scope} className="mt-auto pt-8">
        <div className="flex h-28 items-end gap-[3px]">
          {daily.map((amount, index) => {
            const day = index + 1;
            const isActive = day === activeDay;
            const isFuture = todayDay !== null && day > todayDay;
            const height = amount > 0 ? Math.max(8, (amount / max) * 100) : 0;
            const tooltipAlign = index < 3
              ? 'left-0'
              : index > daily.length - 4
                ? 'right-0'
                : 'left-1/2 -translate-x-1/2';

            return (
              <button
                key={day}
                type="button"
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                onFocus={() => setHoveredDay(day)}
                onBlur={() => setHoveredDay(null)}
                aria-label={`Tanggal ${day}: ${formatIDR(amount)}`}
                className="relative flex h-full min-w-0 flex-1 flex-col items-center justify-end focus-visible:ring-0"
              >
                {isActive ? (
                  <span
                    className={`absolute z-10 whitespace-nowrap rounded-full bg-primary-400 px-2 py-0.5 text-[10px] font-medium text-dark-900 shadow-soft ${tooltipAlign}`}
                    style={{ bottom: `calc(${height}% + 6px)` }}
                  >
                    {day} · {formatIDRCompact(amount)}
                  </span>
                ) : null}
                {amount > 0 ? (
                  <span
                    data-daybar
                    className={`w-[3px] rounded-full transition-colors ${isActive ? 'bg-primary-400' : 'bg-dark-900'}`}
                    style={{ height: `${height}%` }}
                  />
                ) : (
                  <span className={`h-1 w-1 rounded-full ${isFuture ? 'bg-dark-200' : 'bg-dark-300'}`} />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-2 flex gap-[3px] text-[10px] text-dark-400">
          {daily.map((_, index) => (
            <span key={index} className="min-w-0 flex-1 overflow-visible text-center">
              {WEEK_START_DAYS.has(index + 1) ? index + 1 : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
