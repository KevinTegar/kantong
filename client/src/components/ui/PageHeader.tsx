import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
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
    <div data-reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-3">
        {eyebrow ? (
          <p className="inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-3 py-1 text-xs font-medium text-dark-600 shadow-soft">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-400" />
            {eyebrow}
          </p>
        ) : null}
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
