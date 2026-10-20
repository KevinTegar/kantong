import { alertLevelLabels } from '../../lib/budgetStatus';
import type { AlertLevel } from '../../types';

interface AlertBadgeProps {
  level: AlertLevel;
  size?: 'sm' | 'md';
}

const levelConfig = {
  WATCH: { badge: 'bg-amber-50 text-amber-600', dot: 'bg-amber-500' },
  WARNING: { badge: 'bg-orange-50 text-orange-600', dot: 'bg-orange-500' },
  DANGER: { badge: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
};

export default function AlertBadge({ level, size = 'sm' }: AlertBadgeProps) {
  const config = levelConfig[level];
  const sizeClass = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]';

  return (
    <span className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full font-medium ${sizeClass} ${config.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {alertLevelLabels[level]}
    </span>
  );
}
