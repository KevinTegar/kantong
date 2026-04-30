import { CalendarRange, History } from 'lucide-react';
import { useMemo } from 'react';
import { useAvailableMonths } from '../../hooks/useAvailableMonths';
import { useSelectedPeriod } from '../../hooks/useSelectedPeriod';
import { formatPeriodLabel } from '../../lib/period';

function buildOptionValue(month: number, year: number) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export default function MonthHistorySwitcher() {
  const { data: availableMonths } = useAvailableMonths();
  const { month, year, label, isCurrentPeriod, setPeriod, resetToCurrentPeriod } = useSelectedPeriod();

  const selectedValue = buildOptionValue(month, year);

  const selectedHasData = useMemo(
    () => (availableMonths ?? []).some((period) => period.month === month && period.year === year),
    [availableMonths, month, year]
  );

  const latestHistory = availableMonths?.[0];

  return (
    <div className="rounded-2xl border border-dark-200 bg-white p-4 shadow-soft">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
          <CalendarRange className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-dark-400">
            Periode Aktif
          </p>
          <p className="mt-1 text-sm font-semibold text-dark-800">{label}</p>
          <p className="mt-1 text-xs leading-5 text-dark-500">
            {selectedHasData
              ? 'Semua ringkasan, chart, dan daftar transaksi mengikuti periode aktif.'
              : 'Periode aktif ini belum punya transaksi. Kamu tetap bisa pindah ke histori yang sudah terisi.'}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="relative">
          <select
            value={selectedHasData ? selectedValue : ''}
            onChange={(event) => {
              const value = event.target.value;
              if (!value) return;

              const [selectedYear, selectedMonth] = value.split('-');
              setPeriod(Number(selectedMonth), Number(selectedYear));
            }}
            className="input min-h-[48px] pr-10 text-sm"
          >
            <option value="" disabled>
              {(availableMonths?.length ?? 0) > 0
                ? 'Pilih bulan yang sudah punya data'
                : 'Histori muncul setelah ada transaksi'}
            </option>
            {(availableMonths ?? []).map((period) => (
              <option key={buildOptionValue(period.month, period.year)} value={buildOptionValue(period.month, period.year)}>
                {formatPeriodLabel(period)} ({period.transaction_count} transaksi)
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          {!isCurrentPeriod ? (
            <button type="button" onClick={resetToCurrentPeriod} className="btn-secondary w-full justify-center">
              <History className="h-4 w-4" />
              Kembali ke Bulan Ini
            </button>
          ) : null}

          {!selectedHasData && latestHistory ? (
            <button
              type="button"
              onClick={() => setPeriod(latestHistory.month, latestHistory.year)}
              className="btn-ghost w-full justify-center text-sm"
            >
              Lihat histori terbaru
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
