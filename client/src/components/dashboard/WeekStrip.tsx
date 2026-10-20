import { useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatIDR, formatIDRCompact } from '../../lib/formatCurrency';
import { EASE_OUT, gsap, prefersReducedMotion, useGSAP } from '../../lib/motion';
import { getDaysInMonth, getWeekOfMonth } from '../../lib/period';
import type { Transaction } from '../../types';

interface WeekStripProps {
  transactions: Transaction[];
  month: number;
  year: number;
  todayDay: number | null;
  className?: string;
}

const MAX_CHIPS_PER_DAY = 3;

function getDefaultWeek(transactions: Transaction[], todayDay: number | null) {
  if (todayDay !== null) return getWeekOfMonth(todayDay);

  const lastDay = transactions.reduce((last, transaction) => Math.max(last, Number(transaction.date.split('-')[2])), 1);
  return getWeekOfMonth(lastDay);
}

// Kalender per minggu (minggu ke-1 = tanggal 1-7), padanan kalender mingguan di Coterie
export default function WeekStrip({ transactions, month, year, todayDay, className = '' }: WeekStripProps) {
  const scope = useRef<HTMLDivElement>(null);
  const daysInMonth = getDaysInMonth({ month, year });
  const weeksInMonth = getWeekOfMonth(daysInMonth);
  const [week, setWeek] = useState(() => getDefaultWeek(transactions, todayDay));

  const startDay = (week - 1) * 7 + 1;
  const endDay = Math.min(startDay + 6, daysInMonth);
  const monthShort = new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'short' });

  const byDay = useMemo(() => {
    const map = new Map<number, Transaction[]>();
    for (const transaction of transactions) {
      const day = Number(transaction.date.split('-')[2]);
      map.set(day, [...(map.get(day) ?? []), transaction]);
    }
    return map;
  }, [transactions]);

  const days = Array.from({ length: endDay - startDay + 1 }, (_, index) => startDay + index);
  const weekTransactions = days.flatMap((day) => byDay.get(day) ?? []);
  const weekExpense = weekTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const weekIncome = weekTransactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);

  useGSAP(() => {
    if (prefersReducedMotion()) return;

    gsap.fromTo(
      '[data-chip]',
      { autoAlpha: 0, y: 10, scale: 0.96 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: EASE_OUT, stagger: 0.03 }
    );
    gsap.fromTo('[data-day-head]', { autoAlpha: 0, y: -6 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.03 });
  }, { scope, dependencies: [week] });

  return (
    <div data-reveal className={`card flex flex-col p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setWeek((value) => value - 1)}
          disabled={week === 1}
          className="chip border border-white bg-white/70 shadow-soft disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Minggu {Math.max(week - 1, 1)}
        </button>
        <div className="text-center">
          <p className="text-sm font-medium text-dark-900">{startDay}–{endDay} {monthShort} {year}</p>
          <p className="text-[11px] text-dark-500">Minggu ke-{week}</p>
        </div>
        <button
          type="button"
          onClick={() => setWeek((value) => value + 1)}
          disabled={week === weeksInMonth}
          className="chip border border-white bg-white/70 shadow-soft disabled:pointer-events-none disabled:opacity-40"
        >
          Minggu {Math.min(week + 1, weeksInMonth)}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div ref={scope} className="mt-4 overflow-x-auto scrollbar-none">
        <div className="grid min-w-[560px] grid-cols-7">
          {days.map((day) => {
            const date = new Date(year, month - 1, day);
            const dayTransactions = byDay.get(day) ?? [];
            const isToday = day === todayDay;

            return (
              <div key={day} className="min-w-0 border-l border-dashed border-dark-200 first:border-l-0">
                <div data-day-head className="flex flex-col items-center gap-1 pb-3">
                  <span className="text-[11px] text-dark-400">
                    {date.toLocaleDateString('id-ID', { weekday: 'short' })}
                  </span>
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                      isToday ? 'bg-dark-900 text-white' : 'text-dark-800'
                    }`}
                  >
                    {day}
                  </span>
                </div>

                <div className="min-h-[132px] space-y-1.5 px-1">
                  {dayTransactions.slice(0, MAX_CHIPS_PER_DAY).map((transaction) => (
                    <div
                      key={transaction.id}
                      data-chip
                      title={`${transaction.description || transaction.category?.name || 'Transaksi'} · ${formatIDR(transaction.amount)}`}
                      className={`rounded-xl px-2 py-1.5 text-[11px] leading-tight shadow-soft ${
                        transaction.type === 'income' ? 'bg-primary-300 text-dark-900' : 'bg-dark-900 text-white'
                      }`}
                    >
                      <p className="truncate font-medium">
                        {transaction.description || transaction.category?.name || 'Transaksi'}
                      </p>
                      <p className="truncate opacity-70">
                        {transaction.type === 'income' ? '+' : '−'}{formatIDRCompact(transaction.amount)}
                      </p>
                    </div>
                  ))}
                  {dayTransactions.length > MAX_CHIPS_PER_DAY ? (
                    <p data-chip className="px-1 text-[11px] text-dark-500">
                      +{dayTransactions.length - MAX_CHIPS_PER_DAY} lainnya
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dark-100 pt-3 text-xs text-dark-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-dark-900" />
          Keluar minggu ini <span className="font-medium text-dark-900">{formatIDR(weekExpense)}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary-400" />
          Masuk <span className="font-medium text-dark-900">{formatIDR(weekIncome)}</span>
        </span>
      </div>
    </div>
  );
}
