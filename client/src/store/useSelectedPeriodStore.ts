import { create } from 'zustand';
import { getCurrentPeriod } from '../lib/period';

interface SelectedPeriodState {
  month: number;
  year: number;
  setPeriod: (month: number, year: number) => void;
  resetToCurrentPeriod: () => void;
}

const currentPeriod = getCurrentPeriod();

export const useSelectedPeriodStore = create<SelectedPeriodState>((set) => ({
  month: currentPeriod.month,
  year: currentPeriod.year,
  setPeriod: (month, year) => set({ month, year }),
  resetToCurrentPeriod: () => set(getCurrentPeriod()),
}));
