import { TrendingUp, AlertCircle } from 'lucide-react';
import type { BurnRateResult } from '../../types';

interface AlertCardProps {
  result: BurnRateResult;
}

const levelConfig = {
  WATCH: {
    bg: 'bg-primary-50 border-primary-200',
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600',
    bar: 'bg-primary-400',
    badge: 'bg-primary-100 text-primary-700',
    badgeText: 'Watch',
  },
  WARNING: {
    bg: 'bg-warning-50 border-warning-200',
    iconBg: 'bg-warning-100',
    iconColor: 'text-warning-600',
    bar: 'bg-warning-500',
    badge: 'bg-warning-100 text-warning-700',
    badgeText: 'Peringatan',
  },
  DANGER: {
    bg: 'bg-danger-50 border-danger-200',
    iconBg: 'bg-danger-100',
    iconColor: 'text-danger-600',
    bar: 'bg-danger-500',
    badge: 'bg-danger-100 text-danger-700',
    badgeText: 'Darurat',
  },
};

export default function AlertCard({ result }: AlertCardProps) {
  const { category_name, alert_level, percentage_projected, projected_total, spending_cap } = result;

  if (!alert_level) return null;

  const config = levelConfig[alert_level];
  const Icon = alert_level === 'DANGER' ? AlertCircle : TrendingUp;

  return (
    <div className={`p-4 rounded-xl border ${config.bg} transition-all hover:shadow-md`}>
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl ${config.iconBg}`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <span className="font-semibold text-dark-900">{category_name}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.badge}`}>
              {config.badgeText}
            </span>
          </div>
          <p className="text-sm text-dark-500 mb-3">
            Diproyeksikan mencapai <span className="font-semibold text-dark-700">{percentage_projected.toFixed(0)}%</span> dari budget
          </p>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-dark-400">
              <span>Progress</span>
              <span>{percentage_projected.toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-dark-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${config.bar} transition-all duration-500`}
                style={{ width: `${Math.min(100, percentage_projected)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-dark-400">
                Proyeksi: Rp {projected_total.toLocaleString('id-ID')}
              </span>
              <span className="text-dark-400">
                Budget: Rp {spending_cap.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}