import { AlertTriangle, Inbox, RefreshCw, Search, X } from 'lucide-react';
import { useId, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react';
import { getUserFacingError } from '../../lib/user-facing-error';

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
    <header className="admin-page-header flex flex-wrap items-end justify-between gap-5">
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e8816a]">
          Admin console
        </div>
        <h1 className="admin-page-title font-editorial mt-1 text-4xl font-bold">{title}</h1>
        <p className="admin-page-description mt-2 max-w-2xl text-sm">{description}</p>
      </div>
      {action && <div className="flex min-w-0 flex-wrap items-center gap-3">{action}</div>}
    </header>
  );
}

export function AdminMetricGrid({ metrics }: { metrics: AdminMetric[] }) {
  return (
    <section
      aria-label="Key metrics"
      className="mt-7 grid grid-cols-[repeat(auto-fit,minmax(min(100%,10.5rem),1fr))] gap-4"
    >
      {metrics.map((metric, index) => {
        const tone = metric.tone ?? (index === 0 ? 'accent' : 'success');
        const color = tones[tone];
        return (
          <article
            key={metric.label}
            className="admin-metric-card rounded-xl border border-[rgba(255,255,255,0.09)] bg-[#1c1a18] p-5"
            style={{ '--metric-color': color } as CSSProperties}
          >
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-[#aaa59d]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 0 14px ${color}`,
                }}
              />
              {metric.label}
            </div>
            <div className="font-editorial mt-4 text-3xl" style={{ color }}>
              {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
            </div>
          </article>
        );
      })}
    </section>
  );
}

export function AdminSearch({
  value,
  onChange,
  placeholder = 'Search…',
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const inputId = useId();
  return (
    <label
      htmlFor={inputId}
      className="admin-search flex min-w-62.5 items-center gap-3 rounded-full border border-[rgba(255,255,255,0.16)] bg-[#24211e] px-4 py-2.5"
    >
      <Search size={17} aria-hidden="true" className="shrink-0 text-[#aaa59d]" />
      <span className="sr-only">{ariaLabel ?? placeholder}</span>
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#817c75]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[#aaa59d] transition hover:bg-white/8 hover:text-[#f2f0eb]"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </label>
  );
}

export function AdminNumberInput({
  value,
  min,
  max,
  onValueChange,
  ...inputProps
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'min' | 'max' | 'onChange'> & {
  value: number;
  min: number;
  max: number;
  onValueChange: (value: number) => void;
}) {
  const commit = (rawValue: string) => {
    if (rawValue.trim() === '') return;
    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) return;
    onValueChange(Math.min(max, Math.max(min, Math.trunc(parsed))));
  };

  return (
    <input
      {...inputProps}
      type="number"
      min={min}
      max={max}
      key={value}
      defaultValue={String(value)}
      onChange={(event) => commit(event.target.value)}
    />
  );
}

export function AdminStatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone = [
    'active',
    'public',
    'approved',
    'resolved',
    'healthy',
    'success',
    'sent',
    'on_track',
  ].includes(normalized)
    ? '#52c58c'
    : ['urgent', 'rejected', 'blocked', 'down', 'failure', 'error', 'critical', 'overdue'].includes(
          normalized
        )
      ? '#e26767'
      : ['open', 'pending', 'draft', 'warning', 'degraded', 'in_progress'].includes(normalized)
        ? '#f0a842'
        : '#b9b4ac';
  return (
    <span
      className="inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
      style={{
        color: tone,
        borderColor: `${tone}55`,
        backgroundColor: `${tone}18`,
      }}
    >
      {value.replaceAll('_', ' ')}
    </span>
  );
}

export function AdminPanel({
  title,
  toolbar,
  children,
  className = '',
}: {
  title: string;
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`admin-panel mt-7 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.09)] bg-[#1c1a18] ${className}`}
    >
      <div className="admin-panel-header flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.09)] px-6 py-5">
        <h2 className="font-editorial text-xl font-bold">{title}</h2>
        {toolbar}
      </div>
      {children}
    </section>
  );
}

export function AdminTableScroll({ children }: { children: ReactNode }) {
  return <div className="admin-table-scroll overflow-x-auto">{children}</div>;
}

export function AdminPaginationControls({
  page,
  pages,
  onPageChange,
  label = 'results',
}: {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  const safePages = Math.max(1, pages);
  return (
    <nav className="admin-pagination" aria-label={`${label} pagination`}>
      <button
        type="button"
        className="admin-button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label={`Go to previous ${label} page`}
      >
        Previous
      </button>
      <span className="admin-pagination-status" aria-live="polite">
        Page {page} of {safePages}
      </span>
      <button
        type="button"
        className="admin-button"
        disabled={page >= safePages}
        onClick={() => onPageChange(page + 1)}
        aria-label={`Go to next ${label} page`}
      >
        Next
      </button>
    </nav>
  );
}

export function AdminEmpty({ children = 'No records found.' }: { children?: ReactNode }) {
  return (
    <div className="grid min-h-52 place-items-center p-8 text-center" role="status">
      <div>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-[#24211e] text-[#aaa59d]">
          <Inbox size={21} aria-hidden="true" />
        </span>
        <div className="mt-4 text-sm text-[#aaa59d]">{children}</div>
      </div>
    </div>
  );
}

export function AdminTableSkeleton({
  columns = 6,
  rows = 7,
  label = 'Loading table data',
}: {
  columns?: number;
  rows?: number;
  label?: string;
}) {
  return (
    <div
      className="admin-section-skeleton overflow-hidden"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <span className="sr-only">{label}…</span>
      <div
        className="admin-table-skeleton-row admin-table-skeleton-header"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(7rem, 1fr))` }}
        aria-hidden="true"
      >
        {Array.from({ length: columns }, (_, column) => (
          <span key={column} className="admin-skeleton h-3 w-3/5" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="admin-table-skeleton-row"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(7rem, 1fr))` }}
          aria-hidden="true"
        >
          {Array.from({ length: columns }, (_, column) => (
            <span
              key={column}
              className={`admin-skeleton h-4 ${
                column === 0 ? 'w-4/5' : column % 2 === 0 ? 'w-3/5' : 'w-2/3'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function AdminListSkeleton({
  rows = 6,
  label = 'Loading list',
}: {
  rows?: number;
  label?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className="divide-y divide-white/8"
    >
      <span className="sr-only">{label}…</span>
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          className="grid gap-4 px-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-6"
          aria-hidden="true"
        >
          <div>
            <div className="admin-skeleton h-4 w-2/5" />
            <div className="admin-skeleton mt-3 h-3 w-4/5" />
            <div className="admin-skeleton mt-2 h-3 w-3/5" />
          </div>
          <div className="admin-skeleton h-9 w-24" />
        </div>
      ))}
    </div>
  );
}

export function AdminCardSkeleton({
  cards = 4,
  label = 'Loading cards',
}: {
  cards?: number;
  label?: string;
}) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <span className="sr-only">{label}…</span>
      {Array.from({ length: cards }, (_, item) => (
        <div
          key={item}
          className="rounded-xl border border-white/9 bg-[#1c1a18] p-5"
          aria-hidden="true"
        >
          <div className="admin-skeleton h-3 w-2/5" />
          <div className="admin-skeleton mt-5 h-8 w-3/5" />
          <div className="admin-skeleton mt-4 h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function AdminRefreshingIndicator({ label = 'Refreshing data' }: { label?: string }) {
  return (
    <div className="admin-refresh-indicator" role="status" aria-live="polite">
      <RefreshCw size={13} className="animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function AdminLoading({
  tableColumns = 6,
  tableRows = 7,
  variant = 'table',
}: {
  tableColumns?: number;
  tableRows?: number;
  variant?: 'table' | 'analytics' | 'settings' | 'health' | 'detail' | 'subscriptions';
} = {}) {
  const chartBars = [38, 62, 48, 76, 58, 88, 68, 52, 72, 44, 64, 82];

  return (
    <div
      aria-label="Loading current data"
      aria-live="polite"
      aria-busy="true"
      className="mt-7 space-y-4"
    >
      <span className="sr-only">Loading current data…</span>
      {variant === 'detail' && (
        <>
          <div className="admin-skeleton h-4 w-36" />
          <div className="flex flex-wrap items-end justify-between gap-5 py-2">
            <div className="min-w-0 flex-1">
              <div className="admin-skeleton h-3 w-24" />
              <div className="admin-skeleton mt-3 h-10 w-[min(30rem,80%)] rounded-lg" />
              <div className="admin-skeleton mt-3 h-4 w-[min(42rem,92%)]" />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="admin-skeleton h-8 w-20 rounded-md" />
              <div className="admin-skeleton h-10 w-24 rounded-lg" />
              <div className="admin-skeleton h-10 w-24 rounded-lg" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-5">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="rounded-xl border border-white/9 bg-[#1c1a18] p-4">
                <div className="admin-skeleton h-3 w-2/5" />
                <div className="admin-skeleton mt-3 h-4 w-4/5" />
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border border-white/9 bg-[#1c1a18]">
            <div className="border-b border-white/9 px-6 py-5">
              <div className="admin-skeleton h-6 w-48" />
            </div>
            <div className="space-y-5 p-6">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="rounded-xl border border-white/9 bg-[#24211e] p-5">
                  <div className="admin-skeleton h-3 w-20" />
                  <div className="admin-skeleton mt-3 h-5 w-2/5" />
                  <div className="admin-skeleton mt-3 h-3 w-4/5" />
                  <div className="mt-5 space-y-3">
                    <div className="admin-skeleton h-10 w-full rounded-md" />
                    <div className="admin-skeleton h-10 w-full rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {variant !== 'detail' && <AdminCardSkeleton />}

      {variant === 'analytics' && (
        <>
          <div className="overflow-hidden rounded-xl border border-white/9 bg-[#1c1a18]">
            <div className="border-b border-white/9 px-6 py-5">
              <div className="admin-skeleton h-6 w-48" />
            </div>
            <div className="flex h-72 items-end gap-2 overflow-hidden p-6 pt-10">
              {chartBars.map((height, index) => (
                <div
                  key={index}
                  className="admin-skeleton min-w-6 flex-1 rounded-b-none rounded-t-md"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/9 bg-[#1c1a18]">
            <div className="border-b border-white/9 px-6 py-5">
              <div className="admin-skeleton h-6 w-36" />
            </div>
            <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }, (_, index) => (
                <div key={index} className="rounded-lg border border-white/8 bg-[#24211e] p-4">
                  <div className="admin-skeleton h-3 w-3/5" />
                  <div className="admin-skeleton mt-3 h-7 w-2/5" />
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {variant === 'settings' && (
        <div className="overflow-hidden rounded-xl border border-white/9 bg-[#1c1a18]">
          <div className="flex justify-between border-b border-white/9 px-6 py-5">
            <div className="admin-skeleton h-6 w-40" />
            <div className="admin-skeleton h-8 w-32 rounded-full" />
          </div>
          <div className="space-y-6 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4 rounded-xl border border-white/9 p-5">
              <div className="flex-1">
                <div className="admin-skeleton h-4 w-40" />
                <div className="admin-skeleton mt-3 h-3 w-4/5" />
              </div>
              <div className="admin-skeleton h-7 w-12 rounded-full" />
            </div>
            {Array.from({ length: 3 }, (_, section) => (
              <div key={section} className="rounded-xl border border-white/9 p-5">
                <div className="admin-skeleton h-5 w-44" />
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }, (_, field) => (
                    <div key={field}>
                      <div className="admin-skeleton h-3 w-28" />
                      <div className="admin-skeleton mt-2 h-11 w-full rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {variant === 'health' && (
        <>
          <div className="overflow-hidden rounded-xl border border-white/9 bg-[#1c1a18]">
            <div className="border-b border-white/9 px-6 py-5">
              <div className="admin-skeleton h-6 w-32" />
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="rounded-xl border border-white/10 bg-[#24211e] p-5">
                  <div className="flex justify-between">
                    <div className="admin-skeleton h-6 w-6 rounded-md" />
                    <div className="admin-skeleton h-6 w-20 rounded-md" />
                  </div>
                  <div className="admin-skeleton mt-5 h-4 w-2/5" />
                  <div className="admin-skeleton mt-3 h-3 w-3/5" />
                </div>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/9 bg-[#1c1a18]">
            <div className="border-b border-white/9 px-6 py-5">
              <div className="admin-skeleton h-6 w-24" />
            </div>
            <div className="p-6">
              <div className="flex justify-between">
                <div className="admin-skeleton h-4 w-28" />
                <div className="admin-skeleton h-4 w-32" />
              </div>
              <div className="admin-skeleton mt-4 h-3 w-full rounded-full" />
              <div className="admin-skeleton mt-4 h-3 w-2/5" />
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-white/9 bg-[#1c1a18]">
            <div className="border-b border-white/9 px-6 py-5">
              <div className="admin-skeleton h-6 w-44" />
            </div>
            <AdminTableSkeleton columns={6} rows={5} />
          </div>
        </>
      )}

      {variant === 'subscriptions' && (
        <>
          <div className="overflow-hidden rounded-xl border border-white/9 bg-[#1c1a18]">
            <div className="border-b border-white/9 px-6 py-5">
              <div className="admin-skeleton h-6 w-44" />
            </div>
            <div className="border-b border-white/9 px-6 py-4">
              <div className="admin-skeleton h-3 w-4/5" />
            </div>
            <div className="grid gap-3 p-6 sm:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="rounded-xl border border-white/9 bg-[#24211e] p-5">
                  <div className="admin-skeleton h-5 w-2/5" />
                  <div className="admin-skeleton mt-4 h-7 w-3/5" />
                  <div className="admin-skeleton mt-3 h-3 w-4/5" />
                  <div className="admin-skeleton mt-5 h-9 w-full rounded-lg" />
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }, (_, panel) => (
              <div
                key={panel}
                className="overflow-hidden rounded-xl border border-white/9 bg-[#1c1a18]"
              >
                <div className="border-b border-white/9 px-6 py-5">
                  <div className="admin-skeleton h-6 w-36" />
                </div>
                <div className="space-y-4 p-6">
                  {Array.from({ length: 4 }, (_, row) => (
                    <div key={row} className="flex justify-between gap-5">
                      <div className="admin-skeleton h-4 w-2/5" />
                      <div className="admin-skeleton h-4 w-1/4" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border border-white/9 bg-[#1c1a18]">
            <div className="border-b border-white/9 px-6 py-5">
              <div className="admin-skeleton h-6 w-40" />
            </div>
            <AdminTableSkeleton columns={7} rows={7} />
          </div>
        </>
      )}

      {variant === 'table' && (
        <div className="overflow-hidden rounded-xl border border-white/9 bg-[#1c1a18]">
          <div className="border-b border-white/9 px-6 py-5">
            <div className="admin-skeleton h-6 w-44" />
          </div>
          <AdminTableSkeleton columns={tableColumns} rows={tableRows} />
        </div>
      )}
    </div>
  );
}

export function AdminError({ error, onRetry }: { error?: unknown; onRetry?: () => void }) {
  const retry = onRetry ?? (() => window.location.reload());
  return (
    <div className="grid min-h-52 place-items-center p-8 text-center" role="alert">
      <div className="max-w-md">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-[#e26767]/25 bg-[#e26767]/10 text-[#e26767]">
          <AlertTriangle size={21} aria-hidden="true" />
        </span>
        <p className="mt-4 text-sm leading-6 text-[#e26767]">
          {getUserFacingError(error, 'This admin data could not be loaded. Please retry.')}
        </p>
        <button type="button" className="admin-button mt-5" onClick={retry}>
          <RefreshCw size={15} aria-hidden="true" />
          Retry
        </button>
      </div>
    </div>
  );
}
