export interface PeriodValue {
  month: number;
  year: number;
}

export function getCurrentPeriod(): PeriodValue {
  const now = new Date();

  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  };
}

export function formatPeriodLabel({ month, year }: PeriodValue, locale = 'id-ID') {
  return new Date(year, month - 1, 1).toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });
}

export function isSamePeriod(a: PeriodValue, b: PeriodValue) {
  return a.month === b.month && a.year === b.year;
}

export function buildPeriodDate(period: PeriodValue, day: number) {
  const maxDay = new Date(period.year, period.month, 0).getDate();
  const safeDay = Math.min(day, maxDay);

  return `${period.year}-${String(period.month).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;
}
