import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PanelHeaderProps {
  title: string;
  caption?: string;
  icon?: LucideIcon;
  aside?: ReactNode;
  to?: string;
  className?: string;
}

export default function PanelHeader({
  title,
  caption,
  icon: Icon,
  aside,
  to,
  className = '',
}: PanelHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? (
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-dark-50 text-dark-700">
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
        <div className="min-w-0">
          <h3 className="panel-title">{title}</h3>
          {caption ? <p className="panel-caption mt-0.5">{caption}</p> : null}
        </div>
      </div>

      <div className="flex flex-shrink-0 items-center gap-2">
        {aside}
        {to ? (
          <Link to={to} className="icon-btn h-8 w-8" aria-label={`Buka ${title}`}>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
