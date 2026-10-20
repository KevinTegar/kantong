import { useRef } from 'react';
import { AlertCircle, Check, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { budgetLevelStyles, type BudgetLevel } from '../../lib/budgetStatus';
import { formatIDRCompact } from '../../lib/formatCurrency';
import { EASE_OUT, gsap, prefersReducedMotion, useGSAP } from '../../lib/motion';
import ProgressBar from '../ui/ProgressBar';

export interface BudgetItem {
  id: string;
  name: string;
  color: string;
  spent: number;
  cap: number;
  percentage: number;
  level: BudgetLevel;
}

interface BudgetChecklistProps {
  items: BudgetItem[];
  className?: string;
}

function StatusCircle({ level }: { level: BudgetLevel }) {
  if (level === 'SAFE') {
    return (
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-400 text-dark-900">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
    );
  }

  if (level === 'DANGER') {
    return (
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500 text-white">
        <AlertCircle className="h-3.5 w-3.5" />
      </span>
    );
  }

  return (
    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-orange-400 text-orange-400">
      <TriangleAlert className="h-3 w-3" />
    </span>
  );
}

// Daftar status budget per kategori, padanan kartu "Onboarding tasks" di Coterie
export default function BudgetChecklist({ items, className = '' }: BudgetChecklistProps) {
  const scope = useRef<HTMLDivElement>(null);
  const safeCount = items.filter((item) => item.level === 'SAFE').length;
  const watchCount = items.filter((item) => item.level === 'WATCH' || item.level === 'WARNING').length;
  const overCount = items.filter((item) => item.level === 'DANGER').length;

  const segments = [
    { label: 'Aman', count: safeCount, className: 'bg-dark-900 text-white' },
    { label: 'Waspada', count: watchCount, className: 'bg-primary-400 text-dark-900' },
    { label: 'Lewat cap', count: overCount, className: 'bg-red-500 text-white' },
  ];

  useGSAP(() => {
    if (prefersReducedMotion()) return;

    gsap.fromTo(
      '[data-check-item]',
      { autoAlpha: 0, x: 14 },
      { autoAlpha: 1, x: 0, duration: 0.55, ease: EASE_OUT, stagger: 0.05, delay: 0.2 }
    );
  }, { scope, dependencies: [items.length] });

  return (
    <div ref={scope} data-reveal className={`card flex flex-col p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="panel-title">Budget kategori</h3>
          <p className="panel-caption mt-0.5">Kategori dengan spending cap</p>
        </div>
        <p className="text-[34px] font-light leading-none tracking-tight text-dark-900">
          {safeCount}
          <span className="text-dark-300">/{items.length}</span>
        </p>
      </div>

      {items.length > 0 ? (
        <div className="mt-4 flex gap-1.5">
          {segments.map((segment) => (
            <div key={segment.label} className="min-w-[64px]" style={{ flex: `${Math.max(segment.count, 0.5)} 1 0%` }}>
              <p className="mb-1.5 truncate text-[11px] text-dark-500">{segment.label}</p>
              <div
                className={`flex h-6 items-center rounded-full px-2.5 text-[11px] font-medium ${
                  segment.count > 0 ? segment.className : 'bg-hatch border border-dark-200 text-dark-500'
                }`}
              >
                {segment.count}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="card-dark mt-4 flex min-h-[220px] flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/90">Status kategori</p>
          <p className="text-sm text-white/50">{safeCount}/{items.length}</p>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-3">
            <p className="text-sm leading-6 text-white/60">
              Belum ada kategori dengan spending cap. Atur cap supaya Kantong bisa memberi peringatan lebih awal.
            </p>
            <Link to="/categories" className="btn-accent">Atur cap</Link>
          </div>
        ) : (
          <ul className="mt-3 space-y-0.5 overflow-y-auto scrollbar-none xl:max-h-[460px]">
            {items.map((item) => (
              <li key={item.id} data-check-item>
                <Link
                  to={`/categories?id=${item.id}`}
                  className="flex items-center gap-3 rounded-2xl px-2 py-2 transition-colors hover:bg-white/5"
                >
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/15">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm ${item.level === 'DANGER' ? 'text-red-300' : 'text-white'}`}>
                      {item.name}
                    </span>
                    <span className="block text-[11px] text-white/45">
                      {formatIDRCompact(item.spent)} / {formatIDRCompact(item.cap)}
                    </span>
                    <ProgressBar
                      value={item.percentage}
                      className="mt-1.5 h-1 bg-white/10"
                      barClassName={item.level === 'SAFE' ? 'bg-primary-400' : budgetLevelStyles[item.level].bar}
                    />
                  </span>
                  <StatusCircle level={item.level} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
