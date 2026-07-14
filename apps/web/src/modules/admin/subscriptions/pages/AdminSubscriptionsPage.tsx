import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminMetricGrid,
  AdminPageHeader,
  AdminPanel,
  AdminSearch,
  AdminStatusBadge,
} from '../../shared';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import { boundedInteger } from '../../../../lib/bounded-number';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { ADMIN_SUBSCRIPTION_STATUS_OPTIONS } from '../constants/admin-subscriptions.constants';
import {
  useAdminSubscriptions,
} from '../hooks/useAdminSubscriptions';
import { useUpdateAdminPlan } from '../hooks/useUpdateAdminPlan';
import type {
  AdminSubscriptionPlan,
  AdminSubscriptionOverview,
} from '../types/admin-subscriptions.types';

const number = new Intl.NumberFormat('en-IN');
const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});
const formatMoney = (paise: number) => money.format(paise / 100);
export default function AdminSubscriptionsPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);
  const subscriptions = useAdminSubscriptions({ search: debouncedSearch, status, page });

  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Premium & Limits"
        description="Track purchases and manage every customer-visible plan, price, feature, and allowance."
      />
      <SubscriptionView
        query={subscriptions}
        search={search}
        status={status}
        page={page}
        setSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        setStatus={(value) => {
          setStatus(value);
          setPage(1);
        }}
        setPage={setPage}
      />
    </main>
  );
}

function SubscriptionView({
  query,
  search,
  status,
  page,
  setSearch,
  setStatus,
  setPage,
}: {
  query: UseQueryResult<AdminSubscriptionOverview>;
  search: string;
  status: string;
  page: number;
  setSearch: (value: string) => void;
  setStatus: (value: string) => void;
  setPage: (value: number) => void;
}) {
  if (query.isLoading) return <AdminLoading />;
  if (query.isError || !query.data) return <AdminError error={query.error} />;
  const data = query.data;
  const pagination = data.subscriptions.pagination;

  return (
    <>
      <AdminMetricGrid
        metrics={[
          { label: 'Revenue earned', value: formatMoney(data.metrics.totalRevenue), tone: 'accent' },
          { label: 'Subscriptions bought', value: data.metrics.subscriptionsBought, tone: 'info' },
          {
            label: 'Active premium',
            value: data.metrics.activePremiumSubscriptions,
            tone: 'success',
          },
          { label: 'Monthly recurring revenue', value: formatMoney(data.metrics.monthlyRecurringRevenue), tone: 'warning' },
        ]}
      />
      <AdminPanel title="Subscription plans">
        <div className="border-b border-[rgba(255,255,255,0.09)] px-6 py-4 text-xs text-[#aaa59d]">
          Prices are stored in paise. Set a request limit to 0 for unlimited. Existing paid subscriptions keep their purchased limits until expiration.
        </div>
        <div className="grid gap-4 p-6 xl:grid-cols-3">
          {data.plans.map((plan) => <PlanForm key={plan.planId} plan={plan} />)}
        </div>
      </AdminPanel>
      <section className="mt-7 grid gap-6 lg:grid-cols-2">
        <SummaryPanel title="Plans" rows={data.planBreakdown.map((item) => [
          item.plan,
          `${number.format(item.count)} purchases`,
          formatMoney(item.revenue),
        ])} />
        <SummaryPanel title="Revenue by month" rows={data.revenueByMonth.map((item) => [
          item.month,
          `${number.format(item.subscriptions)} purchases`,
          formatMoney(item.revenue),
        ])} />
      </section>
      <AdminPanel
        title="Purchase ledger"
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-lg border border-[rgba(255,255,255,0.16)] bg-[#24211e] px-4 py-3 text-xs capitalize outline-none"
            >
              {ADMIN_SUBSCRIPTION_STATUS_OPTIONS.map((item) => <option key={item}>{item}</option>)}
            </select>
            <AdminSearch value={search} onChange={setSearch} placeholder="Search buyer or payment…" />
          </div>
        }
      >
        {data.subscriptions.items.length === 0 ? <AdminEmpty>No purchases match these filters.</AdminEmpty> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left text-sm">
              <thead className="bg-[#141412] text-[9px] uppercase tracking-wider text-[#aaa59d]">
                <tr>
                  <th className="px-6 py-4">Bought by</th><th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Amount</th><th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Payment</th><th className="px-6 py-4">Purchased</th>
                  <th className="px-6 py-4">Valid until</th>
                </tr>
              </thead>
              <tbody>
                {data.subscriptions.items.map((item) => (
                  <tr key={item.id} className="border-t border-[rgba(255,255,255,0.09)]">
                    <td className="px-6 py-4"><div className="font-semibold">{item.userName}</div><div className="text-xs text-[#aaa59d]">{item.userEmail}</div></td>
                    <td className="px-6 py-4 capitalize">{item.planName}<div className="text-xs text-[#aaa59d]">{item.billingCycle}</div></td>
                    <td className="px-6 py-4 font-semibold">{formatMoney(item.amount)}</td>
                    <td className="px-6 py-4"><AdminStatusBadge value={item.status} /></td>
                    <td className="max-w-50 truncate px-6 py-4 font-mono text-xs text-[#aaa59d]">{item.paymentId || 'Awaiting payment'}</td>
                    <td className="px-6 py-4 text-xs text-[#aaa59d]">{new Date(item.purchasedAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-xs text-[#aaa59d]">{item.endsAt ? new Date(item.endsAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.09)] px-6 py-4 text-xs text-[#aaa59d]">
            <span>Page {pagination.page} of {pagination.pages} · {number.format(pagination.total)} purchases</span>
            <div className="flex gap-2">
              <PageButton disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={15} /></PageButton>
              <PageButton disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}><ChevronRight size={15} /></PageButton>
            </div>
          </div>
        )}
      </AdminPanel>
    </>
  );
}

function PlanForm({ plan }: { plan: AdminSubscriptionPlan }) {
  const update = useUpdateAdminPlan();
  const [form, setForm] = useState({
    name: plan.name,
    description: plan.description,
    monthlyAmount: plan.monthlyAmount,
    annualAmount: plan.annualAmount,
    currency: plan.currency,
    features: plan.features,
    highlighted: plan.highlighted,
    limits: plan.limits,
  });
  const fields: Array<[keyof typeof form.limits, string, number]> = [
    ['maxTrackers', 'Maximum trackers', 1_000],
    ['trackerGenerationsPerMonth', 'Generated trackers / month', 500],
    ['lessonGenerationsPerDay', 'Generated lessons / day', 500],
    ['mockTestGenerationsPerMonth', 'Generated mock tests / month', 500],
    ['aiTutorRequestsPerDay', 'AI tutor requests / day', 2_000],
  ];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    update.mutate({ planId: plan.planId, input: form });
  };
  return (
    <form onSubmit={submit} className="rounded-xl border border-[rgba(255,255,255,0.09)] bg-[#24211e] p-5">
      <div className="font-editorial text-xl font-bold capitalize">{plan.planId}</div>
      <div className="mt-4 space-y-3">
        <PlanTextField label="Display name" value={form.name} maxLength={80} onChange={(name) => setForm((current) => ({ ...current, name }))} />
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-wide text-[#aaa59d]">Description</span>
          <textarea required maxLength={300} rows={3} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#1c1a18] px-3 py-2 text-sm outline-none focus:border-[#e8816a]" />
        </label>
        <PlanNumberField label="Monthly price (paise)" value={form.monthlyAmount} maximum={100_000_000} onChange={(monthlyAmount) => setForm((current) => ({ ...current, monthlyAmount }))} />
        <PlanNumberField label="Annual price (paise)" value={form.annualAmount} maximum={1_000_000_000} onChange={(annualAmount) => setForm((current) => ({ ...current, annualAmount }))} />
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-wide text-[#aaa59d]">Features (one per line)</span>
          <textarea required rows={5} value={form.features.join('\n')} onChange={(event) => setForm((current) => ({ ...current, features: event.target.value.split('\n').map((value) => value.trim()).filter(Boolean).slice(0, 30) }))} className="w-full rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#1c1a18] px-3 py-2 text-sm outline-none focus:border-[#e8816a]" />
        </label>
        <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.highlighted} onChange={(event) => setForm((current) => ({ ...current, highlighted: event.target.checked }))} className="accent-[#e8816a]" /> Highlight this plan</label>
      </div>
      <div className="mt-5 border-t border-white/10 pt-4 text-xs font-semibold uppercase tracking-wide text-[#aaa59d]">Usage limits</div>
      <div className="mt-4 space-y-3">
        {fields.map(([key, label, maximum]) => (
          <label key={key} className="block">
            <span className="mb-1 block text-[10px] uppercase tracking-wide text-[#aaa59d]">{label}</span>
            <input
              required
              type="number"
              min={0}
              max={maximum}
              value={form.limits[key]}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  limits: { ...current.limits, [key]: boundedInteger(event.target.value, 0, maximum) },
                }))
              }
              className="w-full rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#1c1a18] px-3 py-2 text-sm outline-none focus:border-[#e8816a]"
            />
          </label>
        ))}
      </div>
      {update.isSuccess && <div className="mt-3 text-xs text-[#52c58c]">Plan saved.</div>}
      {update.isError && (
        <div className="mt-3 text-xs text-[#e26767]">
          {getUserFacingError(update.error, 'Plan could not be saved.')}
        </div>
      )}
      <button type="submit" disabled={update.isPending} className="admin-primary-button mt-5 w-full">
        {update.isPending ? 'Saving…' : `Save ${plan.planId} plan`}
      </button>
    </form>
  );
}

function PlanTextField({ label, value, maxLength, onChange }: { label: string; value: string; maxLength: number; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-1 block text-[10px] uppercase tracking-wide text-[#aaa59d]">{label}</span><input required maxLength={maxLength} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#1c1a18] px-3 py-2 text-sm outline-none focus:border-[#e8816a]" /></label>;
}

function PlanNumberField({ label, value, maximum, onChange }: { label: string; value: number; maximum: number; onChange: (value: number) => void }) {
  return <label className="block"><span className="mb-1 block text-[10px] uppercase tracking-wide text-[#aaa59d]">{label}</span><input required type="number" min={0} max={maximum} value={value} onChange={(event) => onChange(boundedInteger(event.target.value, 0, maximum))} className="w-full rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#1c1a18] px-3 py-2 text-sm outline-none focus:border-[#e8816a]" /></label>;
}

function SummaryPanel({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <AdminPanel title={title}>
      {rows.length === 0 ? <AdminEmpty /> : <div className="divide-y divide-[rgba(255,255,255,0.09)]">
        {rows.map(([label, detail, value]) => (
          <div key={label} className="flex items-center justify-between gap-4 px-6 py-4">
            <div><div className="font-semibold capitalize">{label}</div><div className="text-xs text-[#aaa59d]">{detail}</div></div>
            <div className="font-editorial text-lg text-[#52c58c]">{value}</div>
          </div>
        ))}
      </div>}
    </AdminPanel>
  );
}

function PageButton({ disabled, onClick, children }: { disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" disabled={disabled} onClick={onClick} className="grid h-8 w-8 place-items-center rounded border border-[rgba(255,255,255,0.16)] disabled:opacity-30">{children}</button>;
}
