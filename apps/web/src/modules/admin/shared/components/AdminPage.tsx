import type { ReactNode } from 'react';
import { Search } from 'lucide-react';
import { getUserFacingError } from '../../../../lib/user-facing-error';

export type AdminMetric = {
  label: string;
  value: string | number;
  tone?: 'accent' | 'success' | 'warning' | 'error' | 'info';
};
const tones = {
  accent: '#e8816a',
  success: '#52c58c',
  warning: '#f0a842',
  error: '#e26767',
  info: '#6aa9ff',
};

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e8816a]">
          Admin console
        </div>
        <h1 className="font-editorial mt-1 text-4xl font-bold">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-[#aaa59d]">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function AdminMetricGrid({ metrics }: { metrics: AdminMetric[] }) {
  return (
    <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => (
        <div
          key={metric.label}
          className="rounded-xl border border-[rgba(255,255,255,0.09)] bg-[#1c1a18] p-5"
        >
          <div className="text-[10px] uppercase tracking-wider text-[#aaa59d]">{metric.label}</div>
          <div
            className="font-editorial mt-4 text-2xl"
            style={{ color: tones[metric.tone ?? (index === 0 ? 'accent' : 'success')] }}
          >
            {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
          </div>
        </div>
      ))}
    </section>
  );
}

export function AdminSearch({
  value,
  onChange,
  placeholder = 'Search…',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex min-w-[250px] items-center gap-3 rounded-full border border-[rgba(255,255,255,0.16)] bg-[#24211e] px-5 py-3">
      <Search size={17} className="text-[#aaa59d]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm outline-none placeholder:text-[#817c75]"
      />
    </label>
  );
}

export function AdminStatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone = ['active', 'public', 'approved', 'resolved', 'healthy', 'success', 'sent'].includes(
    normalized
  )
    ? '#52c58c'
    : ['urgent', 'rejected', 'blocked', 'down', 'failure', 'error', 'critical'].includes(normalized)
      ? '#e26767'
      : ['open', 'pending', 'draft', 'warning', 'degraded', 'in_progress'].includes(normalized)
        ? '#f0a842'
        : '#aaa59d';
  return (
    <span
      className="inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
      style={{ color: tone, borderColor: `${tone}55`, backgroundColor: `${tone}18` }}
    >
      {value.replace('_', ' ')}
    </span>
  );
}

export function AdminPanel({
  title,
  toolbar,
  children,
}: {
  title: string;
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mt-7 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.09)] bg-[#1c1a18]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.09)] px-6 py-5">
        <h2 className="font-editorial text-xl font-bold">{title}</h2>
        {toolbar}
      </div>
      {children}
    </section>
  );
}

export function AdminEmpty({ children = 'No records found.' }: { children?: ReactNode }) {
  return <div className="p-12 text-center text-sm text-[#aaa59d]">{children}</div>;
}
export function AdminLoading() {
  return <div className="p-12 text-center text-sm text-[#aaa59d]">Loading current data…</div>;
}
export function AdminError({ error }: { error?: unknown }) {
  return (
    <div className="p-12 text-center text-sm text-[#e26767]">
      {getUserFacingError(error, 'This admin data could not be loaded. Please retry.')}
    </div>
  );
}
