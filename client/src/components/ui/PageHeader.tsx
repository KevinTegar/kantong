import type { ReactNode } from 'react';
import PeriodPill from '../layout/PeriodPill';

interface PageHeaderProps {
  title: string;
  description?: string;
  showPeriod?: boolean;
  action?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  showPeriod = false,
  action,
}: PageHeaderProps) {
  return (
    <div data-reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        {showPeriod ? <PeriodPill /> : null}
        <h1 className="text-4xl font-light tracking-tight text-dark-900 lg:text-[44px] lg:leading-[1.1]">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-6 text-dark-500">
            {description}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          {action}
        </div>
      ) : null}
    </div>
  );
}
