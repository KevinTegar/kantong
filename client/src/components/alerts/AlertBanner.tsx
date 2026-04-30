import { AlertTriangle, CheckCheck } from 'lucide-react';
import { useBurnRate } from '../../hooks/useBurnRate';
import { useSelectedPeriod } from '../../hooks/useSelectedPeriod';
import AlertCard from './AlertCard';
import { api } from '../../lib/api';

export default function AlertBanner() {
  const { month, year, isCurrentPeriod } = useSelectedPeriod();
  const { data: burnRateResults, isLoading, refetch } = useBurnRate({ month, year });

  const activeAlerts = burnRateResults?.filter((r) => r.alert_level !== null) ?? [];

  const handleMarkAllRead = async () => {
    try {
      await api.put('/alerts/read-all');
      refetch();
    } catch (error) {
      console.error('Failed to mark all alerts as read:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="card p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-dark-200 rounded-xl" />
          <div className="flex-1">
            <div className="h-4 bg-dark-200 rounded w-1/3 mb-2" />
            <div className="h-3 bg-dark-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (activeAlerts.length === 0) {
    return null;
  }

  const dangerCount = activeAlerts.filter((a) => a.alert_level === 'DANGER').length;
  const warningCount = activeAlerts.filter((a) => a.alert_level === 'WARNING').length;
  const watchCount = activeAlerts.filter((a) => a.alert_level === 'WATCH').length;

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-dark-200 bg-warning-50/70 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-warning-100 text-warning-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="panel-title">Burn Rate Alert</h3>
              <p className="panel-caption">
                {isCurrentPeriod
                  ? `${activeAlerts.length} peringatan aktif yang perlu ditinjau.`
                  : `${activeAlerts.length} hasil proyeksi dari periode yang sedang kamu lihat.`}
              </p>
            </div>
          </div>
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-2 rounded-xl border border-warning-200 bg-white px-3 py-2 text-sm font-semibold text-warning-700 transition-colors hover:bg-warning-50"
          >
            <CheckCheck className="h-4 w-4" />
            Tandai dibaca
          </button>
        </div>
      </div>

      <div className="flex divide-x divide-dark-200 border-b border-dark-200">
        {dangerCount > 0 && (
          <div className="flex-1 px-4 py-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-danger-500" />
            <span className="text-sm font-medium text-danger-600">{dangerCount} Darurat</span>
          </div>
        )}
        {warningCount > 0 && (
          <div className="flex-1 px-4 py-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-warning-500" />
            <span className="text-sm font-medium text-warning-600">{warningCount} Peringatan</span>
          </div>
        )}
        {watchCount > 0 && (
          <div className="flex-1 px-4 py-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-400" />
            <span className="text-sm font-medium text-primary-600">{watchCount} Watch</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {activeAlerts.map((result) => (
          <AlertCard key={result.category_id} result={result} />
        ))}
      </div>
    </div>
  );
}
