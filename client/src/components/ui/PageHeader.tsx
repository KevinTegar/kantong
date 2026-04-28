import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
  action?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  eyebrow,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600">
            {eyebrow}
          </p>
        ) : null}
        <div className="space-y-1">
          <h1 className="text-[28px] font-bold tracking-tight text-dark-900 lg:text-[32px]">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-dark-500">
            {description}
          </p>
        </div>
      </div>
      {action ? (
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          {action}
        </div>
      ) : null}
    </div>
  );
}
