import { Link } from 'react-router-dom';
import { alertLevelLabels, budgetLevelStyles, getBudgetLevel, type BudgetLevel } from '../../lib/budgetStatus';
import { formatIDR } from '../../lib/formatCurrency';
import AnimatedNumber from '../ui/AnimatedNumber';
import PanelHeader from '../ui/PanelHeader';
import RadialGauge from '../ui/RadialGauge';

interface BudgetGaugeProps {
  usedPercentage: number | null;
  projectedPercentage: number | null;
  totalCap: number;
  totalSpent: number;
  className?: string;
}

const arcColors: Record<BudgetLevel, string> = {
  SAFE: '#f4c63d',
  WATCH: '#f59e0b',
  WARNING: '#f97316',
  DANGER: '#ef4444',
};

// Dial burn rate, padanan kartu "Time tracker" di Coterie
export default function BudgetGauge({
  usedPercentage,
  projectedPercentage,
  totalCap,
  totalSpent,
  className = '',
}: BudgetGaugeProps) {
  if (usedPercentage === null) {
    return (
      <div data-reveal className={`card flex flex-col p-5 ${className}`}>
        <PanelHeader title="Burn rate" to="/categories" />
        <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
          <RadialGauge value={0} size={150}>
            <p className="text-2xl font-light text-dark-400">–</p>
          </RadialGauge>
          <p className="mt-4 max-w-[220px] text-xs leading-5 text-dark-500">
            Atur spending cap kategori untuk mulai memantau burn rate.
          </p>
          <Link to="/categories" className="btn-primary mt-3">Atur cap</Link>
        </div>
      </div>
    );
  }

  const level = getBudgetLevel(projectedPercentage ?? usedPercentage);

  return (
    <div data-reveal className={`card flex flex-col p-5 ${className}`}>
      <PanelHeader title="Burn rate" to="/categories" />

      <div className="flex flex-1 items-center justify-center py-3">
        <RadialGauge value={usedPercentage} marker={projectedPercentage} arcColor={arcColors[level]}>
          <p className="text-[34px] font-light leading-none tracking-tight text-dark-900">
            <AnimatedNumber value={usedPercentage} format={(value) => `${Math.round(value)}%`} />
          </p>
          <p className="mt-1.5 text-[11px] leading-tight text-dark-500">terpakai</p>
          {projectedPercentage !== null ? (
            <p className="text-[11px] leading-tight text-dark-400">proyeksi {Math.round(projectedPercentage)}%</p>
          ) : null}
        </RadialGauge>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-dark-500">Sisa cap bulan ini</p>
          <p className="truncate text-sm font-medium text-dark-900">{formatIDR(Math.max(0, totalCap - totalSpent))}</p>
        </div>
        <span className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${budgetLevelStyles[level].badge}`}>
          {level === 'SAFE' ? 'Aman' : `Proyeksi: ${alertLevelLabels[level]}`}
        </span>
      </div>
    </div>
  );
}
