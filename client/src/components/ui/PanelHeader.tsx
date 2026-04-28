import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PanelHeaderProps {
  title: string;
  caption?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'primary' | 'success' | 'danger' | 'warning';
  aside?: ReactNode;
  className?: string;
}

const toneStyles = {
  default: 'bg-dark-100 text-dark-600',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-100 text-success-700',
  danger: 'bg-danger-100 text-danger-600',
  warning: 'bg-warning-100 text-warning-700',
};

export default function PanelHeader({
  title,
  caption,
  icon: Icon,
  tone = 'primary',
  aside,
  className = '',
}: PanelHeaderProps) {
  return (
    <div className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`}>
      <div className="flex items-start gap-3">
        {Icon ? (
          <div className={`mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${toneStyles[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div>
          <h3 className="panel-title">{title}</h3>
          {caption ? <p className="panel-caption mt-1">{caption}</p> : null}
        </div>
      </div>

      {aside ? <div className="sm:flex-shrink-0">{aside}</div> : null}
    </div>
  );
}
