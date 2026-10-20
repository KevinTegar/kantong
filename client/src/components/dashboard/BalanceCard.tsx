import { useRef } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatIDR } from '../../lib/formatCurrency';
import { gsap, prefersReducedMotion, useGSAP } from '../../lib/motion';
import AnimatedNumber from '../ui/AnimatedNumber';

interface BalanceCardProps {
  balance: number;
  income: number;
  expense: number;
  periodLabel: string;
  className?: string;
}

export default function BalanceCard({ balance, income, expense, periodLabel, className = '' }: BalanceCardProps) {
  const scope = useRef<HTMLDivElement>(null);

  // Cahaya kuning yang bergerak pelan di belakang angka saldo
  useGSAP(() => {
    if (prefersReducedMotion()) return;

    gsap.to('[data-glow]', {
      x: 'random(-28, 28)',
      y: 'random(-20, 20)',
      scale: 'random(0.9, 1.15)',
      duration: 6,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      repeatRefresh: true,
      stagger: 1.2,
    });
  }, { scope });

  return (
    <div
      ref={scope}
      data-reveal
      className={`relative isolate flex min-h-[248px] flex-col justify-between overflow-hidden rounded-4xl bg-dark-900 p-5 text-white shadow-elevated ${className}`}
    >
      <div data-glow aria-hidden="true" className="absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-[#e8853d]/55 blur-3xl" />
      <div data-glow aria-hidden="true" className="absolute -right-6 -top-10 -z-10 h-44 w-44 rounded-full bg-primary-400 blur-2xl" />
      <div data-glow aria-hidden="true" className="absolute -bottom-24 -left-12 -z-10 h-56 w-56 rounded-full bg-primary-200/20 blur-3xl" />

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-white/70">Saldo bersih</span>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white/80 backdrop-blur">{periodLabel}</span>
      </div>

      <div>
        <p className={`text-[32px] font-light leading-none tracking-tight ${balance < 0 ? 'text-red-300' : ''}`}>
          <AnimatedNumber value={balance} format={formatIDR} />
        </p>
        <p className="mt-2 text-xs text-white/60">
          {balance >= 0 ? 'Arus kas periode ini masih aman.' : 'Pengeluaran melampaui pemasukan.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs backdrop-blur">
          <ArrowUpRight className="h-3.5 w-3.5 text-primary-300" />
          {formatIDR(income)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs backdrop-blur">
          <ArrowDownRight className="h-3.5 w-3.5 text-white/60" />
          {formatIDR(expense)}
        </span>
      </div>
    </div>
  );
}
