import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: 'default' | 'income' | 'expense' | 'budget';
  note?: string;
}

const variantStyles = {
  default: {
    wrapper: 'border-dark-200 bg-white/95',
    iconBg: 'bg-dark-100/80',
    iconColor: 'text-dark-600',
    valueColor: 'text-dark-900',
    accent: 'bg-dark-300',
  },
  income: {
    wrapper: 'border-success-100 bg-white/95',
    iconBg: 'bg-success-100',
    iconColor: 'text-success-600',
    valueColor: 'text-success-700',
    accent: 'bg-success-500',
  },
  expense: {
    wrapper: 'border-danger-100 bg-white/95',
    iconBg: 'bg-danger-100',
    iconColor: 'text-danger-600',
    valueColor: 'text-danger-700',
    accent: 'bg-danger-500',
  },
  budget: {
    wrapper: 'border-primary-100 bg-white/95',
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600',
    valueColor: 'text-primary-700',
    accent: 'bg-primary-500',
  },
};

export default function SummaryCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
  note,
}: SummaryCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`rounded-2xl border p-4 shadow-soft ${styles.wrapper}`}>
      <div className={`mb-5 h-1.5 w-12 rounded-full ${styles.accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
            {title}
          </p>
          <p className={`mt-2 text-xl font-bold tracking-tight sm:text-2xl ${styles.valueColor}`}>
            {value}
          </p>
          {note ? (
            <p className="mt-2 text-xs text-dark-500 sm:text-sm">{note}</p>
          ) : null}
        </div>
        <div className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${styles.iconBg}`}>
          <Icon className={`h-5 w-5 ${styles.iconColor}`} />
        </div>
      </div>
    </div>
  );
}
