import type { LucideIcon } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

interface StatFigureProps {
  value: number;
  label: string;
  icon?: LucideIcon;
  format?: (value: number) => string;
  className?: string;
}

// Angka besar bergaya ringan dengan label kecil di bawahnya, seperti "84 Team" di Coterie
export default function StatFigure({ value, label, icon: Icon, format, className = '' }: StatFigureProps) {
  return (
    <div className={`min-w-0 ${className}`}>
      <p className="text-3xl font-light leading-none tracking-tight text-dark-900 lg:text-[40px]">
        <AnimatedNumber value={value} format={format} />
      </p>
      <p className="mt-2 flex items-center gap-1 text-xs text-dark-500">
        {Icon ? <Icon className="h-3 w-3" /> : null}
        {label}
      </p>
    </div>
  );
}
