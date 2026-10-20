import { AlertCircle, Bell, CheckCheck, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMarkAlertRead, useMarkAllAlertsRead, useUnreadAlerts } from '../../hooks/useAlerts';
import { formatIDR } from '../../lib/formatCurrency';
import Popover from '../ui/Popover';
import AlertBadge from './AlertBadge';
import type { AlertLevel } from '../../types';

const levelIconStyles: Record<AlertLevel, string> = {
  WATCH: 'bg-amber-50 text-amber-600',
  WARNING: 'bg-orange-50 text-orange-600',
  DANGER: 'bg-red-50 text-red-600',
};

const relativeTime = new Intl.RelativeTimeFormat('id-ID', { numeric: 'auto' });

function formatRelative(isoDate: string) {
  const minutes = Math.round((new Date(isoDate).getTime() - Date.now()) / 60000);
  if (Math.abs(minutes) < 60) return relativeTime.format(minutes, 'minute');

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relativeTime.format(hours, 'hour');

  return relativeTime.format(Math.round(hours / 24), 'day');
}

export default function NotificationsMenu() {
  const navigate = useNavigate();
  const { data: alerts } = useUnreadAlerts();
  const markRead = useMarkAlertRead();
  const markAllRead = useMarkAllAlertsRead();
  const unreadCount = alerts?.length ?? 0;

  return (
    <Popover
      panelClassName="sm:w-[22rem]"
      fullWidthOnMobile
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : 'Notifikasi'}
          className="icon-btn relative"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-400 px-1 text-[10px] font-semibold text-dark-900 ring-2 ring-[#f3efe6]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </button>
      )}
    >
      {(close) => (
        <div>
          <div className="flex items-center justify-between gap-3 px-3 pb-2 pt-2">
            <p className="text-sm font-medium text-dark-900">Notifikasi</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-dark-500 hover:text-dark-900 disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Tandai semua dibaca
              </button>
            ) : null}
          </div>

          {unreadCount === 0 ? (
            <div className="mx-1 mb-1 rounded-2xl bg-dark-50 px-4 py-6 text-center">
              <p className="text-sm font-medium text-dark-800">Semua aman</p>
              <p className="mt-1 text-xs text-dark-500">Belum ada peringatan burn rate baru.</p>
            </div>
          ) : (
            <ul className="max-h-80 space-y-0.5 overflow-y-auto">
              {(alerts ?? []).map((alert) => {
                const Icon = alert.level === 'DANGER' ? AlertCircle : TrendingUp;

                return (
                  <li key={alert.id}>
                    <button
                      type="button"
                      onClick={() => {
                        markRead.mutate(alert.id);
                        close();
                        navigate(`/categories?id=${alert.category_id}`);
                      }}
                      className="flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors hover:bg-dark-50"
                    >
                      <span className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${levelIconStyles[alert.level]}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium text-dark-900">
                            {alert.category?.name ?? 'Kategori'}
                          </span>
                          <AlertBadge level={alert.level} />
                        </span>
                        <span className="mt-0.5 block text-xs leading-5 text-dark-500">
                          Proyeksi akhir bulan {formatIDR(alert.projected_amount)}
                        </span>
                        <span className="block text-[11px] text-dark-400">{formatRelative(alert.created_at)}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </Popover>
  );
}
