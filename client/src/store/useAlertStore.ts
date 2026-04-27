import { create } from 'zustand';
import type { Alert } from '../types';

interface AlertState {
  unreadCount: number;
  alerts: Alert[];
  setAlerts: (alerts: Alert[]) => void;
  incrementUnread: () => void;
  decrementUnread: () => void;
  clearAlerts: () => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  unreadCount: 0,
  alerts: [],

  setAlerts: (alerts) =>
    set({
      alerts,
      unreadCount: alerts.filter((a) => !a.is_read).length,
    }),

  incrementUnread: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  decrementUnread: () =>
    set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  clearAlerts: () => set({ alerts: [], unreadCount: 0 }),
}));