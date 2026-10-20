import { TrendingUp, AlertCircle } from 'lucide-react';
import { formatIDR } from '../../lib/formatCurrency';
import ProgressBar from '../ui/ProgressBar';
import AlertBadge from './AlertBadge';
import type { BurnRateResult } from '../../types';

interface AlertCardProps {
  result: BurnRateResult;
}

const levelConfig = {
  WATCH: { iconWrap: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500' },
  WARNING: { iconWrap: 'bg-orange-50 text-orange-600', bar: 'bg-orange-500' },
  DANGER: { iconWrap: 'bg-red-50 text-red-600', bar: 'bg-red-500' },
};

export default function AlertCard({ result }: AlertCardProps) {
  const { category_name, alert_level, percentage_projected, projected_total, spending_cap } = result;

  if (!alert_level) return null;

  const config = levelConfig[alert_level];
  const Icon = alert_level === 'DANGER' ? AlertCircle : TrendingUp;

  return (
    <div className="card-solid p-4">
      <div className="flex items-start gap-3">
        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${config.iconWrap}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium text-dark-900">{category_name}</span>
            <AlertBadge level={alert_level} />
          </div>
          <p className="mt-1 text-sm text-dark-500">
            Diproyeksikan mencapai{' '}
            <span className="font-medium text-dark-800">{percentage_projected.toFixed(0)}%</span> dari budget
          </p>
          <ProgressBar value={percentage_projected} barClassName={config.bar} className="mt-3 h-1.5 bg-dark-100" />
          <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-dark-400">
            <span>Proyeksi {formatIDR(projected_total)}</span>
            <span>Budget {formatIDR(spending_cap)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
