import type { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant?: 'default' | 'income' | 'expense' | 'budget';
}

const variantStyles = {
  default: {
    wrapper: 'bg-white border-dark-200',
    iconBg: 'bg-dark-100',
    iconColor: 'text-dark-600',
    valueColor: 'text-dark-900',
  },
  income: {
    wrapper: 'bg-white border-success-200',
    iconBg: 'bg-success-100',
    iconColor: 'text-success-600',
    valueColor: 'text-success-700',
  },
  expense: {
    wrapper: 'bg-white border-danger-200',
    iconBg: 'bg-danger-100',
    iconColor: 'text-danger-600',
    valueColor: 'text-danger-700',
  },
  budget: {
    wrapper: 'bg-white border-primary-200',
    iconBg: 'bg-primary-100',
    iconColor: 'text-primary-600',
    valueColor: 'text-primary-700',
  },
};

export default function SummaryCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
}: SummaryCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={`rounded-xl border ${styles.wrapper} p-4 shadow-card`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-dark-400 font-medium truncate">{title}</p>
          <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${styles.valueColor} mt-1 truncate`}>
            {value}
          </p>
        </div>
        <div className={`p-2.5 sm:p-3 rounded-xl ${styles.iconBg} flex-shrink-0`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 ${styles.iconColor}" />
        </div>
      </div>
    </div>
  );
}