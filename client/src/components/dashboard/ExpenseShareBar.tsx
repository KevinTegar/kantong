import { useRef } from 'react';
import { EASE_OUT, gsap, prefersReducedMotion, useGSAP } from '../../lib/motion';

export interface ExpenseShareSegment {
  label: string;
  value: number;
}

interface ExpenseShareBarProps {
  segments: ExpenseShareSegment[];
  totalExpense: number;
  spendRatio: number | null;
}

const segmentStyles = [
  'bg-dark-900 text-white',
  'bg-primary-400 text-dark-900',
  'bg-hatch border border-dark-200 text-dark-700',
];

// Strip pembagian pengeluaran per kategori, padanan baris "Interviews / Hired / Project time" di Coterie
export default function ExpenseShareBar({ segments, totalExpense, spendRatio }: ExpenseShareBarProps) {
  const scope = useRef<HTMLDivElement>(null);
  const dataKey = segments.map((segment) => segment.value).join('|');

  useGSAP(() => {
    if (prefersReducedMotion()) return;

    gsap.fromTo(
      '[data-bar]',
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 0.9, ease: EASE_OUT, stagger: 0.08 }
    );
  }, { scope, dependencies: [dataKey] });

  return (
    <div ref={scope} data-reveal className="flex items-end gap-3">
      <div className="flex min-w-0 flex-1 gap-1.5">
        {totalExpense === 0 ? (
          <div className="min-w-0 flex-1">
            <p className="mb-1.5 text-[11px] text-dark-500">Pengeluaran</p>
            <div data-bar className="bg-hatch flex h-7 items-center rounded-full border border-dark-200 px-3 text-[11px] text-dark-600">
              Belum ada pengeluaran
            </div>
          </div>
        ) : (
          segments.map((segment, index) => {
            const share = (segment.value / totalExpense) * 100;

            return (
              <div key={segment.label} className="min-w-[56px]" style={{ flex: `${Math.max(share, 8)} 1 0%` }}>
                <p className="mb-1.5 truncate text-[11px] text-dark-500">{segment.label}</p>
                <div
                  data-bar
                  className={`flex h-7 items-center rounded-full px-3 text-[11px] font-medium ${segmentStyles[Math.min(index, 2)]}`}
                >
                  {share.toFixed(0)}%
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="w-24 flex-shrink-0 sm:w-36">
        <p className="mb-1.5 truncate text-[11px] text-dark-500">Dari pemasukan</p>
        <div data-bar className="flex h-7 items-center rounded-full border border-dark-300 px-3 text-[11px] font-medium text-dark-700">
          {spendRatio === null ? '–' : `${spendRatio.toFixed(0)}%`}
        </div>
      </div>
    </div>
  );
}
