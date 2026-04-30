import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface FirstUseAction {
  label: string;
  onClick?: () => void;
  to?: string;
  variant?: 'primary' | 'secondary';
  icon?: LucideIcon;
}

interface FirstUsePanelProps {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  actions?: FirstUseAction[];
  aside?: ReactNode;
}

export default function FirstUsePanel({
  eyebrow,
  title,
  description,
  highlights,
  actions = [],
  aside,
}: FirstUsePanelProps) {
  return (
    <section className="card overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="border-b border-dark-200 p-6 lg:border-b-0 lg:border-r lg:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            {eyebrow}
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-dark-900 lg:text-3xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-dark-500">{description}</p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {actions.map((action) => {
              const Icon = action.icon ?? ArrowRight;
              const className = action.variant === 'secondary' ? 'btn-secondary' : 'btn-primary';

              if (action.to) {
                return (
                  <Link key={action.label} to={action.to} className={className}>
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </Link>
                );
              }

              return (
                <button key={action.label} type="button" onClick={action.onClick} className={className}>
                  <Icon className="h-4 w-4" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-dark-50/70 p-6 lg:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-soft">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="panel-title">Mulai dengan ringan</p>
              <p className="panel-caption">Begitu data pertama masuk, dashboard langsung mulai hidup.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {highlights.map((highlight, index) => (
              <div key={highlight} className="surface-muted flex items-start gap-3 p-4">
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                  {index + 1}
                </div>
                <p className="text-sm leading-6 text-dark-600">{highlight}</p>
              </div>
            ))}
          </div>

          {aside ? <div className="mt-4">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
