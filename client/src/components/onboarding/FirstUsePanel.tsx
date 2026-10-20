import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
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
        <div className="p-6 lg:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-800">
            <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
            {eyebrow}
          </p>

          <h2 className="mt-4 text-3xl font-light tracking-tight text-dark-900">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-dark-500">{description}</p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
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

        <div className="m-2 rounded-3xl bg-dark-900 p-6 text-white lg:p-7">
          <p className="text-sm text-white/90">Mulai dengan ringan</p>
          <p className="mt-1 text-xs text-white/50">Begitu data pertama masuk, dashboard langsung hidup.</p>

          <ol className="mt-5 space-y-2">
            {highlights.map((highlight, index) => (
              <li key={highlight} className="flex items-start gap-3 rounded-2xl px-1 py-1.5">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-400 text-[11px] font-semibold text-dark-900">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-white/75">{highlight}</p>
              </li>
            ))}
          </ol>

          {aside ? <div className="mt-4">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
