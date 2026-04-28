import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'primary' | 'success' | 'danger' | 'warning';
  className?: string;
}

const toneStyles = {
  default: {
    iconWrap: 'bg-dark-100 text-dark-600',
    value: 'text-dark-900',
  },
  primary: {
    iconWrap: 'bg-primary-100 text-primary-700',
    value: 'text-primary-700',
  },
  success: {
    iconWrap: 'bg-success-100 text-success-700',
    value: 'text-success-700',
  },
  danger: {
    iconWrap: 'bg-danger-100 text-danger-600',
    value: 'text-danger-600',
  },
  warning: {
    iconWrap: 'bg-warning-100 text-warning-700',
    value: 'text-warning-700',
  },
};

export default function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone = 'default',
  className = '',
}: MetricCardProps) {
  const styles = toneStyles[tone];

  return (
    <div className={`card p-5 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">{label}</p>
          <p className={`mt-2 text-2xl font-bold tracking-tight ${styles.value}`}>{value}</p>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-dark-500">{description}</p>
          ) : null}
        </div>

        {Icon ? (
          <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${styles.iconWrap}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
