import { CalendarRange, Check, ChevronDown, History } from 'lucide-react';
import { useAvailableMonths } from '../../hooks/useAvailableMonths';
import { useSelectedPeriod } from '../../hooks/useSelectedPeriod';
import { formatPeriodLabel } from '../../lib/period';
import Popover from '../ui/Popover';

export default function MonthHistorySwitcher() {
  const { data: availableMonths } = useAvailableMonths();
  const { month, year, label, isCurrentPeriod, setPeriod, resetToCurrentPeriod } = useSelectedPeriod();
  // Label ringkas untuk HP, mis. "Okt 2026"
  const shortLabel = new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });

  return (
    <Popover
      panelClassName="w-72"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full border border-white bg-white/75 px-3.5 text-sm text-dark-800 shadow-soft backdrop-blur transition-colors hover:bg-white"
        >
          <CalendarRange className="h-4 w-4 text-dark-500" />
          <span className="sm:hidden">{shortLabel}</span>
          <span className="hidden sm:inline">{label}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-dark-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}
    >
      {(close) => (
        <div>
          <p className="eyebrow px-3 pb-2 pt-2">Periode aktif</p>

          {(availableMonths?.length ?? 0) > 0 ? (
            <ul className="max-h-72 space-y-0.5 overflow-y-auto">
              {(availableMonths ?? []).map((period) => {
                const isActive = period.month === month && period.year === year;

                return (
                  <li key={`${period.year}-${period.month}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setPeriod(period.month, period.year);
                        close();
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors ${
                        isActive ? 'bg-dark-900 text-white' : 'text-dark-700 hover:bg-dark-50'
                      }`}
                    >
                      <span>{formatPeriodLabel(period)}</span>
                      <span className={`flex items-center gap-1.5 text-xs ${isActive ? 'text-white/70' : 'text-dark-400'}`}>
                        {period.transaction_count} transaksi
                        {isActive ? <Check className="h-3.5 w-3.5 text-primary-400" /> : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-3 pb-3 text-sm leading-6 text-dark-500">
              Histori muncul setelah ada transaksi.
            </p>
          )}

          {!isCurrentPeriod ? (
            <button
              type="button"
              onClick={() => {
                resetToCurrentPeriod();
                close();
              }}
              className="btn-secondary mt-2 w-full"
            >
              <History className="h-4 w-4" />
              Kembali ke bulan ini
            </button>
          ) : null}
        </div>
      )}
    </Popover>
  );
}
