import type { LucideIcon } from 'lucide-react';
import { formatIDR } from '../../lib/formatCurrency';
import AnimatedNumber from './AnimatedNumber';

interface MetricCardProps {
  label: string;
  value: number;
  format?: 'currency' | 'number';
  description?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'primary' | 'success' | 'danger' | 'warning';
  className?: string;
}

const toneStyles = {
  default: { iconWrap: 'bg-dark-50 text-dark-700', value: 'text-dark-900' },
  primary: { iconWrap: 'bg-primary-100 text-primary-800', value: 'text-dark-900' },
  success: { iconWrap: 'bg-success-50 text-success-700', value: 'text-dark-900' },
  danger: { iconWrap: 'bg-danger-50 text-danger-600', value: 'text-danger-600' },
  warning: { iconWrap: 'bg-orange-50 text-orange-600', value: 'text-dark-900' },
};

export default function MetricCard({
  label,
  value,
  format = 'number',
  description,
  icon: Icon,
  tone = 'default',
  className = '',
}: MetricCardProps) {
  const styles = toneStyles[tone];

  return (
    <div data-reveal className={`card p-5 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-dark-500">{label}</p>
        {Icon ? (
          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${styles.iconWrap}`}>
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </div>
      <p className={`mt-3 text-[28px] font-light leading-none tracking-tight ${styles.value}`}>
        <AnimatedNumber value={value} format={format === 'currency' ? formatIDR : undefined} />
      </p>
      {description ? (
        <p className="mt-3 text-xs leading-5 text-dark-500">{description}</p>
      ) : null}
    </div>
  );
}
