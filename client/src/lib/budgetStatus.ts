import type { AlertLevel } from '../types';

export type BudgetLevel = 'SAFE' | AlertLevel;

// Ambang batas sama dengan Burn Rate Engine: 70% WATCH, 85% WARNING, 100% DANGER
export function getBudgetLevel(percentage: number): BudgetLevel {
  if (percentage >= 100) return 'DANGER';
  if (percentage >= 85) return 'WARNING';
  if (percentage >= 70) return 'WATCH';
  return 'SAFE';
}

export const budgetLevelStyles: Record<BudgetLevel, {
  label: string;
  bar: string;
  badge: string;
  dot: string;
}> = {
  SAFE: {
    label: 'Aman',
    bar: 'bg-dark-900',
    badge: 'bg-dark-100 text-dark-700',
    dot: 'bg-success-500',
  },
  WATCH: {
    label: 'Mendekati cap',
    bar: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-600',
    dot: 'bg-amber-500',
  },
  WARNING: {
    label: 'Perlu perhatian',
    bar: 'bg-orange-500',
    badge: 'bg-orange-50 text-orange-600',
    dot: 'bg-orange-500',
  },
  DANGER: {
    label: 'Melebihi cap',
    bar: 'bg-red-500',
    badge: 'bg-red-50 text-red-600',
    dot: 'bg-red-500',
  },
};

// Label untuk hasil proyeksi Burn Rate Engine (bukan pemakaian aktual)
export const alertLevelLabels: Record<AlertLevel, string> = {
  WATCH: 'Watch',
  WARNING: 'Peringatan',
  DANGER: 'Darurat',
};
