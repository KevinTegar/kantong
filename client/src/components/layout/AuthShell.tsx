import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { useStaggerReveal } from '../../hooks/useStaggerReveal';
import BrandMark from '../ui/BrandMark';
import RadialGauge from '../ui/RadialGauge';

interface AuthShellProps {
  children: ReactNode;
}

const PREVIEW_ITEMS = ['Makan & minum', 'Transportasi', 'Langganan'];

// Kerangka halaman login/register bergaya intro Coterie: wordmark besar + preview produk
export default function AuthShell({ children }: AuthShellProps) {
  const scope = useStaggerReveal();

  return (
    <div ref={scope} className="flex min-h-screen flex-col px-4 py-6 lg:px-8">
      <header data-reveal className="mx-auto flex w-full max-w-[1320px] items-center gap-2">
        <BrandMark className="h-6 w-6" />
        <span className="text-lg font-medium tracking-tight text-dark-900">Kantong</span>
      </header>

      <div className="mx-auto grid w-full max-w-[1320px] flex-1 items-center gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_440px]">
        <section className="hidden lg:block" aria-hidden="true">
          <div data-reveal className="flex items-center gap-4">
            <BrandMark className="h-14 w-14" />
            <span className="text-7xl font-light tracking-tight text-dark-900">Kantong</span>
          </div>
          <p data-reveal className="mt-4 text-xl font-light text-dark-600">Uang harian, dalam kendali.</p>
          <p data-reveal className="eyebrow mt-3">Pencatatan keuangan · Burn rate · Budget kategori</p>

          <div data-reveal className="mt-14 flex items-stretch gap-3">
            <div className="card flex flex-col items-center p-5">
              <RadialGauge value={64} marker={82} size={150}>
                <p className="text-3xl font-light leading-none tracking-tight text-dark-900">64%</p>
                <p className="mt-1 text-[10px] text-dark-500">proyeksi 82%</p>
              </RadialGauge>
              <p className="mt-3 text-xs text-dark-500">Burn rate bulan ini</p>
            </div>
            <div className="card-dark w-64 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/90">Budget kategori</span>
                <span className="text-white/50">2/3</span>
              </div>
              <ul className="mt-3 space-y-2">
                {PREVIEW_ITEMS.map((item, index) => (
                  <li key={item} className="flex items-center gap-3 rounded-2xl px-1 py-1.5">
                    <span className="h-8 w-8 rounded-full border border-white/15" />
                    <span className="flex-1 text-sm text-white/80">{item}</span>
                    {index < 2 ? (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-400 text-dark-900">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="h-6 w-6 rounded-full border border-orange-400" />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section data-reveal className="card mx-auto w-full max-w-md p-7 sm:p-8">
          {children}
        </section>
      </div>
    </div>
  );
}
