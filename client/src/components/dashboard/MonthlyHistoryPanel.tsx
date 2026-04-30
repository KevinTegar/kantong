import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarClock, History, Minus } from 'lucide-react';
import { useMemo } from 'react';
import { useSelectedPeriod } from '../../hooks/useSelectedPeriod';
import { useMonthlyHistorySummaries } from '../../hooks/useMonthlyHistorySummaries';
import { formatIDR } from '../../lib/formatCurrency';
import PanelHeader from '../ui/PanelHeader';

function DeltaBadge({
  label,
  value,
  positiveIsGood = false,
}: {
  label: string;
  value: number | null;
  positiveIsGood?: boolean;
}) {
  if (value === null) {
    return (
      <div className="rounded-xl border border-dark-200 bg-white/80 px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dark-400">{label}</p>
        <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-dark-500">
          <Minus className="h-3.5 w-3.5" />
          Belum ada pembanding
        </div>
      </div>
    );
  }

  const isPositive = value > 0;
  const isNeutral = value === 0;
  const positiveTone = positiveIsGood ? 'text-success-700' : 'text-danger-600';
  const negativeTone = positiveIsGood ? 'text-danger-600' : 'text-success-700';

  const tone = isNeutral
    ? 'text-dark-500'
    : isPositive
      ? positiveTone
      : negativeTone;

  const Icon = isNeutral ? Minus : isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="rounded-xl border border-dark-200 bg-white/80 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dark-400">{label}</p>
      <div className={`mt-1 flex items-center gap-2 text-xs font-semibold ${tone}`}>
        <Icon className="h-3.5 w-3.5" />
        {isNeutral ? 'Stabil' : formatIDR(Math.abs(value))}
      </div>
    </div>
  );
}

function MiniTrendBars({
  income,
  expense,
  maxIncome,
  maxExpense,
}: {
  income: number;
  expense: number;
  maxIncome: number;
  maxExpense: number;
}) {
  const incomeWidth = maxIncome > 0 ? Math.max(10, (income / maxIncome) * 100) : 0;
  const expenseWidth = maxExpense > 0 ? Math.max(10, (expense / maxExpense) * 100) : 0;

  return (
    <div className="mt-4 rounded-xl border border-dark-200 bg-white/80 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-dark-400">Visual cepat</p>
      <div className="mt-3 space-y-2.5">
        <div className="flex items-center gap-3">
          <span className="w-20 flex-shrink-0 text-xs font-medium text-dark-500">Pemasukan</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-success-100">
            <div
              className="h-full rounded-full bg-success-500 transition-all duration-500"
              style={{ width: `${incomeWidth}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-20 flex-shrink-0 text-xs font-medium text-dark-500">Pengeluaran</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-danger-100">
            <div
              className="h-full rounded-full bg-danger-500 transition-all duration-500"
              style={{ width: `${expenseWidth}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MonthlyHistoryPanel() {
  const { summaries, hasHistory, isLoading } = useMonthlyHistorySummaries(3);
  const { setPeriod } = useSelectedPeriod();
  const maxValues = useMemo(() => ({
    income: Math.max(...summaries.map((summary) => summary.totalIncome), 0),
    expense: Math.max(...summaries.map((summary) => summary.totalExpense), 0),
  }), [summaries]);

  return (
    <div className="card p-5 lg:p-6">
      <PanelHeader
        title="Riwayat Bulanan"
        caption="Bandingkan ritme cashflow dari bulan-bulan yang sudah punya data."
        icon={History}
        className="mb-5"
      />

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="surface-muted animate-pulse p-4">
              <div className="h-4 w-28 rounded bg-dark-200" />
              <div className="mt-4 h-6 w-24 rounded bg-dark-200" />
              <div className="mt-5 space-y-2">
                <div className="h-3 w-full rounded bg-dark-200" />
                <div className="h-3 w-5/6 rounded bg-dark-200" />
              </div>
            </div>
          ))}
        </div>
      ) : !hasHistory ? (
        <div className="surface-muted flex min-h-[184px] items-center justify-center p-5 text-sm leading-6 text-dark-500">
          Begitu transaksi pertamamu mulai masuk, ringkasan histori bulanan akan muncul di sini.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {summaries.map((summary) => (
            <button
              key={`${summary.year}-${summary.month}`}
              type="button"
              onClick={() => setPeriod(summary.month, summary.year)}
              className={`surface-muted min-w-0 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:bg-white ${
                summary.isActive ? 'border-primary-200 bg-primary-50/70' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-dark-400">
                    {summary.label}
                  </p>
                  <p className={`mt-2 text-lg font-bold tracking-tight ${
                    summary.balance >= 0 ? 'text-dark-900' : 'text-danger-600'
                  }`}>
                    {formatIDR(summary.balance)}
                  </p>
                </div>
                <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
                  summary.isActive ? 'bg-primary-100 text-primary-700' : 'bg-white text-dark-500'
                }`}>
                  {summary.isActive ? <CalendarClock className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3 text-dark-500">
                  <span>Pemasukan</span>
                  <span className="font-semibold text-success-700">{formatIDR(summary.totalIncome)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-dark-500">
                  <span>Pengeluaran</span>
                  <span className="font-semibold text-danger-600">{formatIDR(summary.totalExpense)}</span>
                </div>
              </div>

              <MiniTrendBars
                income={summary.totalIncome}
                expense={summary.totalExpense}
                maxIncome={maxValues.income}
                maxExpense={maxValues.expense}
              />

              <div className="mt-4 grid gap-2">
                <DeltaBadge label="Delta pengeluaran" value={summary.expenseDelta} />
                <DeltaBadge label="Delta saldo" value={summary.balanceDelta} positiveIsGood />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-dark-200 pt-3 text-xs">
                <span className="text-dark-400">
                  {summary.compareToLabel
                    ? `${summary.transactionCount} transaksi • vs ${summary.compareToLabel}`
                    : `${summary.transactionCount} transaksi`}
                </span>
                <span className={`font-semibold ${summary.isActive ? 'text-primary-700' : 'text-dark-500'}`}>
                  {summary.isActive ? 'Periode aktif' : 'Lihat bulan'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
