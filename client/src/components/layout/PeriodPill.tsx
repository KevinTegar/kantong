import { useSelectedPeriod } from '../../hooks/useSelectedPeriod';
import MonthHistorySwitcher from './MonthHistorySwitcher';

// Label periode di atas judul halaman. Di HP sekaligus jadi pemilih bulan,
// karena pemilih di topbar disembunyikan supaya navbar muat satu baris penuh.
export default function PeriodPill() {
  const { label } = useSelectedPeriod();

  return (
    <>
      <div className="lg:hidden">
        <MonthHistorySwitcher align="left" />
      </div>
      <p className="hidden items-center gap-2 rounded-full border border-white bg-white/70 px-3 py-1 text-xs font-medium text-dark-600 shadow-soft lg:inline-flex">
        <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
        {label}
      </p>
    </>
  );
}
