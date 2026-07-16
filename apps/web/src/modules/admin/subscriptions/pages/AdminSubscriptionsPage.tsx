import { ChevronLeft, ChevronRight, Download, LoaderCircle, X } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminMetricGrid,
  AdminNumberInput,
  AdminPageHeader,
  AdminPanel,
  AdminSearch,
  AdminStatusBadge,
  downloadCsv,
} from '../../shared';
import { useDebouncedValue } from '../../../../hooks/useDebouncedValue';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import api from '../../../../lib/axios';
import type { ApiEnvelope } from '../../../../lib/api.types';
import { toast } from '../../../../lib/toast';
import Modal from '../../../../components/overlays/Modal';
import {
  ADMIN_SUBSCRIPTIONS_ENDPOINTS,
  ADMIN_SUBSCRIPTION_STATUS_OPTIONS,
} from '../constants/admin-subscriptions.constants';
import { useAdminSubscriptions } from '../hooks/useAdminSubscriptions';
import { useUpdateAdminPlan } from '../hooks/useUpdateAdminPlan';
import type {
  AdminSubscriptionPlan,
  AdminSubscriptionOverview,
  AdminPlanLimitField,
  AdminSubscriptionItem,
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
  const [isExporting, setIsExporting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<AdminSubscriptionPlan | null>(null);
  if (query.isLoading) return <AdminLoading />;
  if (query.isError || !query.data) return <AdminError error={query.error} />;
  const data = query.data;
  const pagination = data.subscriptions.pagination;
  const exportLedger = async () => {
    setIsExporting(true);
    try {
      const rows: AdminSubscriptionItem[] = [];
      let nextPage = 1;
      let pages = 1;
      do {
        const response = await api.get<ApiEnvelope<AdminSubscriptionOverview>>(
          ADMIN_SUBSCRIPTIONS_ENDPOINTS.overview,
          { params: { search: search || undefined, status, page: nextPage, limit: 100 } }
        );
        rows.push(...response.data.data.subscriptions.items);
        pages = response.data.data.subscriptions.pagination.pages;
        nextPage += 1;
      } while (nextPage <= pages);
      downloadCsv(`subscription-ledger-${new Date().toISOString().slice(0, 10)}.csv`, [
        ['Buyer', 'Email', 'Plan', 'Billing cycle', 'Amount (paise)', 'Currency', 'Status', 'Payment ID', 'Purchased', 'Valid until'],
        ...rows.map((item) => [item.userName, item.userEmail, item.planName, item.billingCycle, item.amount, item.currency, item.status, item.paymentId ?? '', item.purchasedAt, item.endsAt ?? '']),
      ]);
      toast.success('Subscription ledger exported', `${rows.length} matching purchases downloaded.`);
    } catch (error) {
      toast.error('Subscription export failed', getUserFacingError(error));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <AdminMetricGrid
        metrics={[
          {
            label: 'Revenue earned',
            value: formatMoney(data.metrics.totalRevenue),
            tone: 'accent',
          },
          { label: 'Subscriptions bought', value: data.metrics.subscriptionsBought, tone: 'info' },
          {
            label: 'Active premium',
            value: data.metrics.activePremiumSubscriptions,
            tone: 'success',
          },
          {
            label: 'Monthly recurring revenue',
            value: formatMoney(data.metrics.monthlyRecurringRevenue),
            tone: 'warning',
          },
        ]}
      />
      <AdminPanel title="Subscription plans">
        <div className="border-b border-[rgba(255,255,255,0.09)] px-6 py-4 text-xs text-[#aaa59d]">
          Select a plan to review its customer-facing details. Changes to pricing, features, and
          limits are available only after choosing Edit.
        </div>
        <div className="grid gap-3 p-6 sm:grid-cols-3">
          {data.plans.map((plan) => (
            <PlanButton
              key={`${plan.planId}-${plan.updatedAt ?? 'default'}`}
              plan={plan}
              onClick={() => setSelectedPlan(plan)}
            />
          ))}
        </div>
      </AdminPanel>
      <PlanDialog
        key={selectedPlan ? `${selectedPlan.planId}-${selectedPlan.updatedAt ?? 'default'}` : 'closed'}
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
      />
      <section className="mt-7 grid gap-6 lg:grid-cols-2">
        <SummaryPanel
          title="Plans"
          rows={data.planBreakdown.map((item) => [
            item.plan,
            `${number.format(item.count)} purchases`,
            formatMoney(item.revenue),
          ])}
        />
        <SummaryPanel
          title="Revenue by month"
          rows={data.revenueByMonth.map((item) => [
            item.month,
            `${number.format(item.subscriptions)} purchases`,
            formatMoney(item.revenue),
          ])}
        />
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
              {ADMIN_SUBSCRIPTION_STATUS_OPTIONS.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <AdminSearch
              value={search}
              onChange={setSearch}
              placeholder="Search buyer or payment…"
            />
            <button className="admin-button inline-flex items-center gap-2" disabled={isExporting} onClick={() => void exportLedger()}>
              <Download size={15} /> {isExporting ? 'Exporting…' : 'Export ledger'}
            </button>
          </div>
        }
      >
        {data.subscriptions.items.length === 0 ? (
          <AdminEmpty>No purchases match these filters.</AdminEmpty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left text-sm">
              <thead className="bg-[#141412] text-[9px] uppercase tracking-wider text-[#aaa59d]">
                <tr>
                  <th className="px-6 py-4">Bought by</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Purchased</th>
                  <th className="px-6 py-4">Valid until</th>
                </tr>
              </thead>
              <tbody>
                {data.subscriptions.items.map((item) => (
                  <tr key={item.id} className="border-t border-[rgba(255,255,255,0.09)]">
                    <td className="px-6 py-4">
                      <div className="font-semibold">{item.userName}</div>
                      <div className="text-xs text-[#aaa59d]">{item.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {item.planName}
                      <div className="text-xs text-[#aaa59d]">{item.billingCycle}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold">{formatMoney(item.amount)}</td>
                    <td className="px-6 py-4">
                      <AdminStatusBadge value={item.status} />
                    </td>
                    <td className="max-w-50 truncate px-6 py-4 font-mono text-xs text-[#aaa59d]">
                      {item.paymentId || 'Awaiting payment'}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#aaa59d]">
                      {new Date(item.purchasedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#aaa59d]">
                      {item.endsAt ? new Date(item.endsAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.09)] px-6 py-4 text-xs text-[#aaa59d]">
            <span>
              Page {pagination.page} of {pagination.pages} · {number.format(pagination.total)}{' '}
              purchases
            </span>
            <div className="flex gap-2">
              <PageButton disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={15} />
              </PageButton>
              <PageButton disabled={page >= pagination.pages} onClick={() => setPage(page + 1)}>
                <ChevronRight size={15} />
              </PageButton>
            </div>
          </div>
        )}
      </AdminPanel>
    </>
  );
}

function PlanButton({ plan, onClick }: { plan: AdminSubscriptionPlan; onClick: () => void }) {
  const isFree = plan.planId === 'free';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-xl border p-5 text-left transition hover:-translate-y-0.5 hover:border-[#e8816a]/60 hover:bg-[#292622] focus:outline-none focus:ring-2 focus:ring-[#e8816a]/70 ${
        plan.highlighted ? 'border-[#e8816a]/50 bg-[#e8816a]/8' : 'border-white/10 bg-[#24211e]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-editorial text-xl font-bold">{plan.name}</div>
          <div className="mt-1 text-xs capitalize text-[#aaa59d]">{plan.planId} plan</div>
        </div>
        {plan.highlighted && (
          <span className="rounded border border-[#e8816a]/40 bg-[#e8816a]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#f0aa98]">
            Featured
          </span>
        )}
      </div>
      <p className="mt-4 min-h-10 text-sm leading-5 text-[#aaa59d]">{plan.description}</p>
      <div className="mt-5 flex items-end justify-between gap-3">
        <span className="font-editorial text-lg text-[#f2f0eb]">
          {isFree ? 'Free' : `${formatMoney(plan.monthlyAmount)} / mo`}
        </span>
        <span className="text-xs font-semibold text-[#e8816a] group-hover:text-[#f0aa98]">View details</span>
      </div>
    </button>
  );
}

function PlanDialog({ plan, onClose }: { plan: AdminSubscriptionPlan | null; onClose: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const fields: Array<[AdminPlanLimitField, string]> = [
    ['maxTrackers', 'Maximum trackers'],
    ['trackerGenerationsPerMonth', 'Generated trackers / month'],
    ['lessonGenerationsPerDay', 'Generated lessons / day'],
    ['mockTestGenerationsPerMonth', 'Generated mock tests / month'],
    ['aiTutorRequestsPerDay', 'AI tutor requests / day'],
  ];

  return (
    <Modal
      open={Boolean(plan)}
      onClose={onClose}
      ariaLabel="Subscription plan details"
      contentClassName="max-h-[calc(100dvh-2rem)] max-w-4xl overflow-y-auto bg-[#1c1a18] p-0 text-[#f2f0eb]"
    >
      {plan && (
        <>
          <div className="flex items-start justify-between gap-5 border-b border-white/10 px-6 py-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#e8816a]">
                {plan.planId} subscription plan
              </p>
              <h2 className="mt-1 font-editorial text-3xl font-bold">{plan.name}</h2>
            </div>
            <button
              type="button"
              className="admin-button !p-2"
              onClick={onClose}
              aria-label="Close plan details"
            >
              <X size={16} />
            </button>
          </div>
          {isEditing ? (
            <PlanEditor plan={plan} onCancel={() => setIsEditing(false)} onSaved={onClose} />
          ) : (
            <div className="p-6">
              <p className="max-w-2xl text-sm leading-6 text-[#aaa59d]">{plan.description}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <DetailCard
                  label="Monthly price"
                  value={plan.planId === 'free' ? 'Free' : formatMoney(plan.monthlyAmount)}
                />
                <DetailCard
                  label="Annual price"
                  value={plan.planId === 'free' ? 'Free' : formatMoney(plan.annualAmount)}
                />
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#aaa59d]">Included features</h3>
                  <ul className="mt-3 space-y-2 text-sm text-[#d7d2ca]">
                    {plan.features.map((feature) => <li key={feature}>• {feature}</li>)}
                  </ul>
                </section>
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#aaa59d]">Usage limits</h3>
                  <div className="mt-3 space-y-2">
                    {fields.map(([key, label]) => (
                      <div
                        key={key}
                        className="flex justify-between gap-4 rounded-lg border border-white/8 bg-[#24211e] px-3 py-2 text-sm"
                      >
                        <span className="text-[#aaa59d]">{label}</span>
                        <span className="font-semibold">
                          {plan.limits[key] === 0 ? 'Unlimited' : number.format(plan.limits[key])}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              <div className="mt-7 flex justify-end border-t border-white/10 pt-5">
                <button type="button" className="admin-primary-button" onClick={() => setIsEditing(true)}>
                  Edit plan
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#24211e] p-4">
      <div className="text-[10px] uppercase tracking-wide text-[#aaa59d]">{label}</div>
      <div className="mt-1 font-editorial text-xl font-bold">{value}</div>
    </div>
  );
}

function PlanEditor({ plan, onCancel, onSaved }: { plan: AdminSubscriptionPlan; onCancel: () => void; onSaved: () => void }) {
  const update = useUpdateAdminPlan();
  const [propagateLimitFields, setPropagateLimitFields] = useState<AdminPlanLimitField[]>([]);
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
  const fields: Array<[AdminPlanLimitField, string, number]> = [
    ['maxTrackers', 'Maximum trackers', 1_000],
    ['trackerGenerationsPerMonth', 'Generated trackers / month', 500],
    ['lessonGenerationsPerDay', 'Generated lessons / day', 500],
    ['mockTestGenerationsPerMonth', 'Generated mock tests / month', 500],
    ['aiTutorRequestsPerDay', 'AI tutor requests / day', 2_000],
  ];
  const submit = (event: FormEvent) => {
    event.preventDefault();
    update.mutate(
      { planId: plan.planId, input: { plan: form, propagateLimitFields } },
      { onSuccess: onSaved }
    );
  };
  return (
    <form onSubmit={submit} className="p-6">
      <p className="mb-4 text-xs leading-5 text-[#aaa59d]">
        Prices are stored in paise. Set a usage limit to 0 for unlimited.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        <PlanTextField
          label="Display name"
          value={form.name}
          maxLength={80}
          onChange={(name) => setForm((current) => ({ ...current, name }))}
        />
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-wide text-[#aaa59d]">
            Description
          </span>
          <textarea
            required
            maxLength={300}
            rows={3}
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
            className="w-full rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#1c1a18] px-3 py-2 text-sm outline-none focus:border-[#e8816a]"
          />
        </label>
        <PlanNumberField
          label="Monthly price (paise)"
          value={form.monthlyAmount}
          maximum={100_000_000}
          onChange={(monthlyAmount) => setForm((current) => ({ ...current, monthlyAmount }))}
        />
        <PlanNumberField
          label="Annual price (paise)"
          value={form.annualAmount}
          maximum={1_000_000_000}
          onChange={(annualAmount) => setForm((current) => ({ ...current, annualAmount }))}
        />
        <label className="block">
          <span className="mb-1 block text-[10px] uppercase tracking-wide text-[#aaa59d]">
            Features (one per line)
          </span>
          <textarea
            required
            rows={5}
            value={form.features.join('\n')}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                features: event.target.value
                  .split('\n')
                  .map((value) => value.trim())
                  .filter(Boolean)
                  .slice(0, 30),
              }))
            }
            className="w-full rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#1c1a18] px-3 py-2 text-sm outline-none focus:border-[#e8816a]"
          />
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input
            type="checkbox"
            checked={form.highlighted}
            onChange={(event) =>
              setForm((current) => ({ ...current, highlighted: event.target.checked }))
            }
            className="accent-[#e8816a]"
          />{' '}
          Highlight this plan
        </label>
      </div>
      <div className="mt-6 border-t border-white/10 pt-5 text-xs font-semibold uppercase tracking-wide text-[#aaa59d]">
        Usage limits
      </div>
      {plan.planId !== 'free' && (
        <p className="mt-2 text-xs leading-5 text-[#aaa59d]">
          Select any changed limit you want evaluated for active existing subscribers. It is applied
          only where the new value is an upgrade for that subscriber; equal values and downgrades
          are always preserved.
        </p>
      )}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {fields.map(([key, label, maximum]) => {
          const change = getLimitChange(plan.limits[key], form.limits[key]);
          const canPropagate = plan.planId !== 'free' && change !== 'unchanged';
          return (
            <div key={key} className="rounded-lg border border-white/8 bg-[#1c1a18] p-3">
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className="text-[10px] uppercase tracking-wide text-[#aaa59d]">{label}</span>
                <LimitChangeBadge change={change} />
              </div>
              <AdminNumberInput
                required
                min={0}
                max={maximum}
                value={form.limits[key]}
                onValueChange={(value) => {
                  setForm((current) => ({
                    ...current,
                    limits: { ...current.limits, [key]: value },
                  }));
                  if (getLimitChange(plan.limits[key], value) === 'unchanged') {
                    setPropagateLimitFields((current) => current.filter((field) => field !== key));
                  }
                }}
                className="w-full rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#24211e] px-3 py-2 text-sm outline-none focus:border-[#e8816a]"
              />
              {plan.planId !== 'free' && (
                <label
                  className={`mt-2 flex items-start gap-2 text-xs ${canPropagate ? 'cursor-pointer text-[#d7d2ca]' : 'text-[#817c75]'}`}
                >
                  <input
                    type="checkbox"
                    disabled={!canPropagate}
                    checked={propagateLimitFields.includes(key)}
                    onChange={(event) =>
                      setPropagateLimitFields((current) =>
                        event.target.checked
                          ? [...new Set([...current, key])]
                          : current.filter((field) => field !== key)
                      )
                    }
                    className="mt-0.5 accent-[#52c58c]"
                  />
                  Apply only where this is a subscriber upgrade
                </label>
              )}
            </div>
          );
        })}
      </div>
      {update.isSuccess && <div className="mt-3 text-xs text-[#52c58c]">Plan saved.</div>}
      {update.isError && (
        <div className="mt-3 text-xs text-[#e26767]">
          {getUserFacingError(update.error, 'Plan could not be saved.')}
        </div>
      )}
      <div className="mt-6 flex justify-end gap-3 border-t border-white/10 pt-5">
        <button
          type="button"
          className="admin-button"
          onClick={onCancel}
          disabled={update.isPending}
        >
          Cancel
        </button>
        <button type="submit" disabled={update.isPending} className="admin-primary-button">
          {update.isPending ? (
            <>
              <LoaderCircle size={15} className="animate-spin" /> Saving…
            </>
          ) : (
            `Save ${plan.planId} plan`
          )}
        </button>
      </div>
    </form>
  );
}

function PlanTextField({
  label,
  value,
  maxLength,
  onChange,
}: {
  label: string;
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-wide text-[#aaa59d]">{label}</span>
      <input
        required
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#1c1a18] px-3 py-2 text-sm outline-none focus:border-[#e8816a]"
      />
    </label>
  );
}

function PlanNumberField({
  label,
  value,
  maximum,
  onChange,
}: {
  label: string;
  value: number;
  maximum: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-wide text-[#aaa59d]">{label}</span>
      <AdminNumberInput
        required
        min={0}
        max={maximum}
        value={value}
        onValueChange={onChange}
        className="w-full rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#1c1a18] px-3 py-2 text-sm outline-none focus:border-[#e8816a]"
      />
    </label>
  );
}

type LimitChange = 'upgrade' | 'downgrade' | 'unchanged';

function getLimitChange(current: number, next: number): LimitChange {
  if (current === next) return 'unchanged';
  if (current === 0) return 'downgrade';
  if (next === 0 || next > current) return 'upgrade';
  return 'downgrade';
}

function LimitChangeBadge({ change }: { change: LimitChange }) {
  const className =
    change === 'upgrade'
      ? 'border-[#52c58c]/40 bg-[#52c58c]/10 text-[#52c58c]'
      : change === 'downgrade'
        ? 'border-[#f0a842]/40 bg-[#f0a842]/10 text-[#f0a842]'
        : 'border-white/10 text-[#817c75]';
  return (
    <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${className}`}>
      {change}
    </span>
  );
}

function SummaryPanel({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <AdminPanel title={title}>
      {rows.length === 0 ? (
        <AdminEmpty />
      ) : (
        <div className="divide-y divide-[rgba(255,255,255,0.09)]">
          {rows.map(([label, detail, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 px-6 py-4">
              <div>
                <div className="font-semibold capitalize">{label}</div>
                <div className="text-xs text-[#aaa59d]">{detail}</div>
              </div>
              <div className="font-editorial text-lg text-[#52c58c]">{value}</div>
            </div>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}

function PageButton({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded border border-[rgba(255,255,255,0.16)] disabled:opacity-30"
    >
      {children}
    </button>
  );
}
