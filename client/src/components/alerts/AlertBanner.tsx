import { CheckCheck } from 'lucide-react';
import { useBurnRate } from '../../hooks/useBurnRate';
import { useMarkAllAlertsRead } from '../../hooks/useAlerts';
import { useSelectedPeriod } from '../../hooks/useSelectedPeriod';
import AlertCard from './AlertCard';

export default function AlertBanner() {
  const { month, year, isCurrentPeriod } = useSelectedPeriod();
  const { data: burnRateResults, isLoading } = useBurnRate({ month, year });
  const markAllRead = useMarkAllAlertsRead();

  const activeAlerts = burnRateResults?.filter((r) => r.alert_level !== null) ?? [];

  if (isLoading) {
    return (
      <div className="card animate-pulse p-5">
        <div className="h-4 w-1/3 rounded-full bg-dark-100" />
        <div className="mt-3 h-3 w-2/3 rounded-full bg-dark-100" />
      </div>
    );
  }

  if (activeAlerts.length === 0) {
    return null;
  }

  const counts = [
    { label: 'Darurat', count: activeAlerts.filter((a) => a.alert_level === 'DANGER').length, dot: 'bg-red-500' },
    { label: 'Peringatan', count: activeAlerts.filter((a) => a.alert_level === 'WARNING').length, dot: 'bg-orange-500' },
    { label: 'Watch', count: activeAlerts.filter((a) => a.alert_level === 'WATCH').length, dot: 'bg-amber-500' },
  ].filter((item) => item.count > 0);

  return (
    <section data-reveal className="card p-5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="panel-title">Burn rate alert</h3>
          <p className="panel-caption mt-0.5">
            {isCurrentPeriod
              ? `${activeAlerts.length} kategori diproyeksikan mendekati atau melewati cap.`
              : `${activeAlerts.length} hasil proyeksi dari periode yang sedang kamu lihat.`}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {counts.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs text-dark-600 shadow-soft">
                <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
                {item.count} {item.label}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending}
          className="btn-secondary self-start"
        >
          <CheckCheck className="h-4 w-4" />
          Tandai dibaca
        </button>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {activeAlerts.map((result) => (
          <AlertCard key={result.category_id} result={result} />
        ))}
      </div>
    </section>
  );
}
