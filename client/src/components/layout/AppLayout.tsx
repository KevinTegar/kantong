import { useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { BarChart3, LayoutDashboard, Receipt, Tags } from 'lucide-react';
import { gsap, prefersReducedMotion } from '../../lib/motion';
import NotificationsMenu from '../alerts/NotificationsMenu';
import QuickAddTransaction from '../transactions/QuickAddTransaction';
import BrandMark from '../ui/BrandMark';
import Toaster from '../ui/Toaster';
import MonthHistorySwitcher from './MonthHistorySwitcher';
import UserMenu from './UserMenu';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transaksi', icon: Receipt },
  { path: '/categories', label: 'Kategori', icon: Tags },
  { path: '/reports', label: 'Laporan', icon: BarChart3 },
];

function NavPills() {
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const hasPositioned = useRef(false);

  // Indikator hitam bergeser ke tab aktif, seperti segmented nav di Coterie
  useLayoutEffect(() => {
    const nav = navRef.current;
    const indicator = indicatorRef.current;
    if (!nav || !indicator) return;

    const active = nav.querySelector<HTMLElement>('[data-active="true"]');
    if (!active) {
      gsap.set(indicator, { autoAlpha: 0 });
      return;
    }

    // On narrow screens the nav scrolls horizontally; keep the active tab in view
    const scroller = nav.parentElement;
    if (scroller && scroller.scrollWidth > scroller.clientWidth) {
      scroller.scrollTo({
        left: active.offsetLeft - (scroller.clientWidth - active.offsetWidth) / 2,
        behavior: hasPositioned.current ? 'smooth' : 'auto',
      });
    }

    const target = { x: active.offsetLeft, width: active.offsetWidth, autoAlpha: 1 };
    if (!hasPositioned.current || prefersReducedMotion()) {
      gsap.set(indicator, target);
      hasPositioned.current = true;
      return;
    }

    gsap.to(indicator, { ...target, duration: 0.5, ease: 'power3.inOut', overwrite: true });
  }, [location.pathname]);

  // Keep the indicator aligned when the web font loads or the nav resizes
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;

    const observer = new ResizeObserver(() => {
      const active = nav.querySelector<HTMLElement>('[data-active="true"]');
      if (active && indicatorRef.current) {
        gsap.set(indicatorRef.current, { x: active.offsetLeft, width: active.offsetWidth });
      }
    });
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  return (
    <nav className="min-w-0 flex-1 overflow-x-auto scrollbar-none lg:flex-none">
      <div
        ref={navRef}
        className="relative inline-flex items-center gap-0.5 rounded-full border border-white bg-white/60 p-1 shadow-soft backdrop-blur"
      >
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="invisible absolute left-0 top-1 h-[calc(100%-0.5rem)] rounded-full bg-dark-900 shadow-soft"
        />
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              data-active={isActive}
              aria-current={isActive ? 'page' : undefined}
              className={`relative z-10 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors duration-300 ${
                isActive ? 'text-white' : 'text-dark-600 hover:text-dark-900'
              }`}
            >
              <item.icon className="h-3.5 w-3.5" />
              {/* Di layar kecil hanya tab aktif yang menampilkan label */}
              <span className={isActive ? '' : 'sr-only sm:not-sr-only'}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function AppLayout() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-[1320px] flex-wrap items-center gap-x-2 gap-y-3 px-4 pt-5 lg:flex-nowrap lg:px-8">
        <Link to="/dashboard" className="mr-auto flex items-center gap-2 lg:mr-6">
          <BrandMark className="h-6 w-6" />
          <span className="text-lg font-medium tracking-tight text-dark-900">Kantong</span>
        </Link>

        <div className="order-last flex w-full items-center gap-2 lg:order-none lg:ml-auto lg:w-auto">
          <NavPills />
          <MonthHistorySwitcher />
        </div>

        <div className="flex items-center gap-2">
          <QuickAddTransaction />
          <NotificationsMenu />
          <UserMenu />
        </div>
      </header>

      <main className="mx-auto max-w-[1320px] px-4 pb-20 pt-6 lg:px-8 lg:pt-8">
        <Outlet />
      </main>

      <Toaster />
    </div>
  );
}
