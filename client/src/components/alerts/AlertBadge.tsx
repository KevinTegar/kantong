import type { AlertLevel } from '../../types';

interface AlertBadgeProps {
  level: AlertLevel;
  size?: 'sm' | 'md';
}

const levelConfig = {
  WATCH: {
    bg: 'bg-primary-100',
    text: 'text-primary-700',
    border: 'border-primary-200',
    label: 'Watch',
  },
  WARNING: {
    bg: 'bg-warning-100',
    text: 'text-warning-700',
    border: 'border-warning-200',
    label: 'Warning',
  },
  DANGER: {
    bg: 'bg-danger-100',
    text: 'text-danger-700',
    border: 'border-danger-200',
    label: 'Danger',
  },
};

export default function AlertBadge({ level, size = 'sm' }: AlertBadgeProps) {
  const config = levelConfig[level];
  const padding = size === 'md' ? 'px-3 py-1.5' : 'px-2.5 py-1';
  const textSize = size === 'md' ? 'text-xs' : 'text-[10px]';

  return (
    <span
      className={`inline-flex items-center ${padding} rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border} ${textSize}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${level === 'DANGER' ? 'bg-danger-500' : level === 'WARNING' ? 'bg-warning-500' : 'bg-primary-500'} mr-1.5`} />
      {config.label}
    </span>
  );
}