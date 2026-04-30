import { useMemo } from 'react';
import { formatPeriodLabel, getCurrentPeriod, isSamePeriod } from '../lib/period';
import { useSelectedPeriodStore } from '../store/useSelectedPeriodStore';

export function useSelectedPeriod() {
  const month = useSelectedPeriodStore((state) => state.month);
  const year = useSelectedPeriodStore((state) => state.year);
  const setPeriod = useSelectedPeriodStore((state) => state.setPeriod);
  const resetToCurrentPeriod = useSelectedPeriodStore((state) => state.resetToCurrentPeriod);

  return useMemo(() => {
    const currentPeriod = getCurrentPeriod();
    const value = { month, year };

    return {
      month,
      year,
      label: formatPeriodLabel(value),
      isCurrentPeriod: isSamePeriod(value, currentPeriod),
      setPeriod,
      resetToCurrentPeriod,
    };
  }, [month, year, resetToCurrentPeriod, setPeriod]);
}
