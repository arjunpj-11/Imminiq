import { AlertTriangle, Download, FileText, LoaderCircle, X } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminMetricGrid,
  AdminNumberInput,
  AdminPageHeader,
  AdminPaginationControls,
  AdminPanel,
  AdminRefreshingIndicator,
  AdminSearch,
  AdminStatusBadge,
  AdminTableSkeleton,
  downloadCsv,
  downloadTablePdf,
} from "../../shared";
import { useDebouncedValue } from "../../../../hooks/useDebouncedValue";
import { getUserFacingError } from "../../../../lib/user-facing-error";
import api from "../../../../lib/axios";
import type { ApiEnvelope } from "../../../../lib/api.types";
import { toast } from "../../../../lib/toast";
import Modal from "../../shared/components/AdminModal";
import {
  ADMIN_SUBSCRIPTIONS_ENDPOINTS,
  ADMIN_SUBSCRIPTION_STATUS_OPTIONS,
} from "../constants/admin-subscriptions.constants";
import { useAdminSubscriptions } from "../hooks/useAdminSubscriptions";
import { useUpdateAdminPlan } from "../hooks/useUpdateAdminPlan";
import type {
  AdminSubscriptionPlan,
  AdminSubscriptionOverview,
  AdminPlanLimitField,
  AdminSubscriptionItem,
  AdminSubscriptionPlanInput,
} from "../types/admin-subscriptions.types";

const number = new Intl.NumberFormat("en-IN");
const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const formatMoney = (paise: number) => money.format(paise / 100);
export default function AdminSubscriptionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") || "");
  const debouncedSearch = useDebouncedValue(search, 300);
  const requestedStatus = searchParams.get("status") || "all";
  const status = (
    ADMIN_SUBSCRIPTION_STATUS_OPTIONS as readonly string[]
  ).includes(requestedStatus)
    ? requestedStatus
    : "all";
  const requestedPage = Number(searchParams.get("page") || 1);
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const updateParams = (updates: Record<string, string | number | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "" || value === "all" || value === 1)
        next.delete(key);
      else next.set(key, String(value));
    }
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if ((searchParams.get("q") || "") === debouncedSearch) return;
    updateParams({ q: debouncedSearch || null, page: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const subscriptions = useAdminSubscriptions({
    search: debouncedSearch,
    status,
    page,
  });

  return (
    <main className="mx-auto max-w-310 px-5 py-8 sm:px-8">
      <AdminPageHeader
        title="Premium & Limits"
        description="Track purchases and manage every customer-visible plan, price, feature, and allowance."
      />
      <SubscriptionView
        query={subscriptions}
        search={search}
        exportSearch={debouncedSearch}
        status={status}
        page={page}
        setSearch={setSearch}
        setStatus={(value) => updateParams({ status: value, page: null })}
        setPage={(value) => updateParams({ page: value })}
      />
    </main>
  );
}

function SubscriptionView({
  query,
  search,
  exportSearch,
  status,
  page,
  setSearch,
  setStatus,
  setPage,
}: {
  query: UseQueryResult<AdminSubscriptionOverview>;
  search: string;
  exportSearch: string;
  status: string;
  page: number;
  setSearch: (value: string) => void;
  setStatus: (value: string) => void;
  setPage: (value: number) => void;
}) {
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | null>(null);
  const [selectedPlan, setSelectedPlan] =
    useState<AdminSubscriptionPlan | null>(null);
  if (query.isLoading) return <AdminLoading />;
  if (query.isError || !query.data)
    return (
      <AdminError error={query.error} onRetry={() => void query.refetch()} />
    );
  const data = query.data;
  const pagination = data.subscriptions.pagination;
  const exportLedger = async (format: "csv" | "pdf") => {
    setExportFormat(format);
    try {
      const rows: AdminSubscriptionItem[] = [];
      let nextPage = 1;
      let pages = 1;
      do {
        const response = await api.get<ApiEnvelope<AdminSubscriptionOverview>>(
          ADMIN_SUBSCRIPTIONS_ENDPOINTS.overview,
          {
            params: {
              search: exportSearch || undefined,
              status,
              page: nextPage,
              limit: 50,
            },
          },
        );
        rows.push(...response.data.data.subscriptions.items);
        pages = response.data.data.subscriptions.pagination.pages;
        nextPage += 1;
      } while (nextPage <= pages);
      const date = new Date().toISOString().slice(0, 10);
      if (format === "csv") {
        downloadCsv(`subscription-ledger-${date}.csv`, [
          [
            "Buyer",
            "Email",
            "Plan",
            "Billing cycle",
            "Amount (paise)",
            "Currency",
            "Status",
            "Payment ID",
            "Purchased",
            "Valid until",
          ],
          ...rows.map((item) => [
            item.userName,
            item.userEmail,
            item.planName,
            item.billingCycle,
            item.amount,
            item.currency,
            item.status,
            item.paymentId ?? "",
            item.purchasedAt,
            item.endsAt ?? "",
          ]),
        ]);
      } else {
        await downloadTablePdf({
          filename: `subscription-ledger-${date}.pdf`,
          title: "Subscription Ledger",
          description:
            "Premium purchases matching the selected administrator filters.",
          filters: [
            `Status: ${status === "all" ? "All statuses" : status}`,
            `Search: ${exportSearch || "All buyers and payments"}`,
            `Matching purchases: ${rows.length}`,
          ],
          summary: [
            {
              label: "Revenue earned",
              value: formatMoney(data.metrics.totalRevenue),
            },
            {
              label: "Purchases",
              value: data.metrics.subscriptionsBought,
            },
            {
              label: "Active premium",
              value: data.metrics.activePremiumSubscriptions,
            },
            {
              label: "Monthly recurring",
              value: formatMoney(data.metrics.monthlyRecurringRevenue),
            },
          ],
          columns: [
            { header: "Buyer", key: "buyer", width: 88 },
            { header: "Email", key: "email", width: 112 },
            { header: "Plan", key: "plan", width: 52 },
            { header: "Cycle", key: "cycle", width: 48 },
            { header: "Amount", key: "amount", width: 60 },
            { header: "Status", key: "status", width: 54 },
            { header: "Payment ID", key: "payment", width: 92 },
            { header: "Purchased", key: "purchased", width: 76 },
            { header: "Valid until", key: "validUntil", width: 66 },
          ],
          rows: rows.map((item) => ({
            buyer: item.userName,
            email: item.userEmail,
            plan: item.planName,
            cycle: item.billingCycle,
            amount: formatMoney(item.amount),
            status: item.status,
            payment: item.paymentId || "Awaiting payment",
            purchased: new Date(item.purchasedAt).toLocaleString(),
            validUntil: item.endsAt
              ? new Date(item.endsAt).toLocaleDateString()
              : "No expiry",
          })),
        });
      }
      toast.success(
        `Subscription ${format.toUpperCase()} downloaded`,
        `${rows.length} matching purchases exported.`,
      );
    } catch (error) {
      toast.error("Subscription export failed", getUserFacingError(error));
    } finally {
      setExportFormat(null);
    }
  };

  return (
    <>
      <AdminMetricGrid
        metrics={[
          {
            label: "Revenue earned",
            value: formatMoney(data.metrics.totalRevenue),
            tone: "accent",
          },
          {
            label: "Subscriptions bought",
            value: data.metrics.subscriptionsBought,
            tone: "info",
          },
          {
            label: "Active premium",
            value: data.metrics.activePremiumSubscriptions,
            tone: "success",
          },
          {
            label: "Monthly recurring revenue",
            value: formatMoney(data.metrics.monthlyRecurringRevenue),
            tone: "warning",
          },
        ]}
      />
      <AdminPanel title="Subscription plans">
        <div className="border-b border-[rgba(255,255,255,0.09)] px-6 py-4 text-xs text-[#aaa59d]">
          Select a plan to review its customer-facing details. Changes to
          pricing, features, and limits are available only after choosing Edit.
        </div>
        <div className="grid gap-3 p-6 sm:grid-cols-3">
          {data.plans.map((plan) => (
            <PlanButton
              key={`${plan.planId}-${plan.updatedAt ?? "default"}`}
              plan={plan}
              onClick={() => setSelectedPlan(plan)}
            />
          ))}
        </div>
      </AdminPanel>
      <PlanDialog
        key={
          selectedPlan
            ? `${selectedPlan.planId}-${selectedPlan.updatedAt ?? "default"}`
            : "closed"
        }
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
            {query.isFetching && !query.isPlaceholderData && (
              <AdminRefreshingIndicator label="Updating purchase ledger" />
            )}
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="admin-select capitalize"
              aria-label="Filter subscriptions by status"
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
            <button
              className="admin-button inline-flex items-center gap-2"
              disabled={Boolean(exportFormat)}
              onClick={() => void exportLedger("csv")}
            >
              <Download size={15} aria-hidden="true" />
              {exportFormat === "csv" ? "Preparing CSV…" : "Export CSV"}
            </button>
            <button
              className="admin-button inline-flex items-center gap-2"
              disabled={Boolean(exportFormat)}
              onClick={() => void exportLedger("pdf")}
            >
              <FileText size={15} aria-hidden="true" />
              {exportFormat === "pdf" ? "Preparing PDF…" : "Export PDF"}
            </button>
          </div>
        }
      >
        {query.isLoading || query.isPlaceholderData ? (
          <div className="admin-table-scroll overflow-x-auto">
            <AdminTableSkeleton
              columns={7}
              rows={7}
              label="Updating subscription purchases"
            />
          </div>
        ) : data.subscriptions.items.length === 0 ? (
          <AdminEmpty>No purchases match these filters.</AdminEmpty>
        ) : (
          <div className="admin-table-scroll overflow-x-auto">
            <table className="admin-table w-full min-w-225 text-left text-sm">
              <caption className="sr-only">Subscription ledger</caption>
              <thead className="bg-[#141412] text-[9px] uppercase tracking-wider text-[#aaa59d]">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Bought by
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Plan
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Payment
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Purchased
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Valid until
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.subscriptions.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t border-[rgba(255,255,255,0.09)]"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold">{item.userName}</div>
                      <div className="text-xs text-[#aaa59d]">
                        {item.userEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize">
                      {item.planName}
                      <div className="text-xs text-[#aaa59d]">
                        {item.billingCycle}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {formatMoney(item.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <AdminStatusBadge value={item.status} />
                    </td>
                    <td className="max-w-50 truncate px-6 py-4 font-mono text-xs text-[#aaa59d]">
                      {item.paymentId || "Awaiting payment"}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#aaa59d]">
                      {new Date(item.purchasedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#aaa59d]">
                      {item.endsAt
                        ? new Date(item.endsAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!query.isPlaceholderData && pagination.pages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-[#141412] px-4 py-3 sm:px-6">
            <span className="text-xs text-[#aaa59d]">
              {number.format(pagination.total)} matching purchases
            </span>
            <AdminPaginationControls
              page={page}
              pages={pagination.pages}
              label="subscription purchases"
              onPageChange={setPage}
            />
          </div>
        )}
      </AdminPanel>
    </>
  );
}

function PlanButton({
  plan,
  onClick,
}: {
  plan: AdminSubscriptionPlan;
  onClick: () => void;
}) {
  const isFree = plan.planId === "free";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`admin-interactive-card group rounded-xl border p-5 text-left ${
        plan.highlighted
          ? "border-[#e8816a]/50 bg-[#e8816a]/8"
          : "border-white/10 bg-[#24211e]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-editorial text-xl font-bold">{plan.name}</div>
          <div className="mt-1 text-xs capitalize text-[#aaa59d]">
            {plan.planId} plan
          </div>
        </div>
        {plan.highlighted && (
          <span className="rounded border border-[#e8816a]/40 bg-[#e8816a]/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#f0aa98]">
            Featured
          </span>
        )}
      </div>
      <p className="mt-4 min-h-10 text-sm leading-5 text-[#aaa59d]">
        {plan.description}
      </p>
      <div className="mt-5 flex items-end justify-between gap-3">
        <span className="font-editorial text-lg text-[#f2f0eb]">
          {isFree ? "Free" : `${formatMoney(plan.monthlyAmount)} / mo`}
        </span>
        <span className="text-xs font-semibold text-[#e8816a] group-hover:text-[#f0aa98]">
          View details
        </span>
      </div>
    </button>
  );
}

function PlanDialog({
  plan,
  onClose,
}: {
  plan: AdminSubscriptionPlan | null;
  onClose: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const fields: Array<[AdminPlanLimitField, string]> = [
    ["maxTrackers", "Maximum trackers"],
    ["trackerGenerationsPerMonth", "Generated trackers / month"],
    ["lessonGenerationsPerDay", "Generated lessons / day"],
    ["mockTestGenerationsPerMonth", "Generated mock tests / month"],
    ["aiTutorRequestsPerDay", "AI tutor requests / day"],
  ];

  return (
    <Modal
      open={Boolean(plan)}
      onClose={onClose}
      preventClose={isEditing}
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
              <h2 className="mt-1 font-editorial text-3xl font-bold">
                {plan.name}
              </h2>
            </div>
            {!isEditing && (
              <button
                type="button"
                className="admin-button p-2!"
                onClick={onClose}
                aria-label="Close plan details"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {isEditing ? (
            <PlanEditor
              plan={plan}
              onCancel={() => setIsEditing(false)}
              onSaved={onClose}
            />
          ) : (
            <div className="p-6">
              <p className="max-w-2xl text-sm leading-6 text-[#aaa59d]">
                {plan.description}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <DetailCard
                  label="Monthly price"
                  value={
                    plan.planId === "free"
                      ? "Free"
                      : formatMoney(plan.monthlyAmount)
                  }
                />
                <DetailCard
                  label="Annual price"
                  value={
                    plan.planId === "free"
                      ? "Free"
                      : formatMoney(plan.annualAmount)
                  }
                />
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#aaa59d]">
                    Included features
                  </h3>
                  <ul className="mt-3 space-y-2 text-sm text-[#d7d2ca]">
                    {plan.features.map((feature) => (
                      <li key={feature}>• {feature}</li>
                    ))}
                  </ul>
                </section>
                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-[#aaa59d]">
                    Usage limits
                  </h3>
                  <div className="mt-3 space-y-2">
                    {fields.map(([key, label]) => (
                      <div
                        key={key}
                        className="flex justify-between gap-4 rounded-lg border border-white/8 bg-[#24211e] px-3 py-2 text-sm"
                      >
                        <span className="text-[#aaa59d]">{label}</span>
                        <span className="font-semibold">
                          {plan.limits[key] === 0
                            ? "Unlimited"
                            : number.format(plan.limits[key])}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
              <div className="mt-7 flex justify-end border-t border-white/10 pt-5">
                <button
                  type="button"
                  className="admin-primary-button"
                  onClick={() => setIsEditing(true)}
                >
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
    <div className="admin-info-tile p-4">
      <div className="text-[10px] uppercase tracking-wide text-[#aaa59d]">
        {label}
      </div>
      <div className="mt-1 font-editorial text-xl font-bold">{value}</div>
    </div>
  );
}

function PlanEditor({
  plan,
  onCancel,
  onSaved,
}: {
  plan: AdminSubscriptionPlan;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const update = useUpdateAdminPlan();
  const initialForm: AdminSubscriptionPlanInput = useMemo(
    () => ({
      name: plan.name,
      description: plan.description,
      monthlyAmount: plan.monthlyAmount,
      annualAmount: plan.annualAmount,
      currency: plan.currency,
      features: plan.features,
      highlighted: plan.highlighted,
      limits: plan.limits,
    }),
    [plan],
  );
  const [propagateLimitFields, setPropagateLimitFields] = useState<
    AdminPlanLimitField[]
  >([]);
  const [form, setForm] = useState<AdminSubscriptionPlanInput>(initialForm);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [changeReason, setChangeReason] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const changes = useMemo(
    () => collectPlanChanges(initialForm, form),
    [initialForm, form],
  );
  const isDirty = changes.length > 0 || propagateLimitFields.length > 0;

  const fields: Array<[AdminPlanLimitField, string, number]> = [
    ["maxTrackers", "Maximum trackers", 1_000],
    ["trackerGenerationsPerMonth", "Generated trackers / month", 500],
    ["lessonGenerationsPerDay", "Generated lessons / day", 500],
    ["mockTestGenerationsPerMonth", "Generated mock tests / month", 500],
    ["aiTutorRequestsPerDay", "AI tutor requests / day", 2_000],
  ];

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || update.isPending) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty, update.isPending]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (changes.length) setReviewOpen(true);
  };

  const requestCancel = () => {
    if (isDirty) setDiscardOpen(true);
    else onCancel();
  };

  const applyChanges = () => {
    update.mutate(
      {
        planId: plan.planId,
        input: { plan: form, propagateLimitFields },
        mfaCode,
        changeReason: changeReason.trim(),
      },
      { onSuccess: onSaved },
    );
  };

  const reviewReady =
    changeReason.trim().length >= 10 && /^\d{6}$/.test(mfaCode);

  return (
    <>
      <form onSubmit={submit} className="p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#24211e] p-4">
          <p className="text-xs leading-5 text-[#aaa59d]">
            Prices are stored in paise. Set a usage limit to 0 for unlimited.
          </p>
          <span
            className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
              isDirty
                ? "border-[#f0a842]/30 bg-[#f0a842]/10 text-[#f0a842]"
                : "border-[#52c58c]/25 bg-[#52c58c]/10 text-[#52c58c]"
            }`}
            role="status"
          >
            {isDirty
              ? `${changes.length} changed field${changes.length === 1 ? "" : "s"}`
              : "No changes"}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <PlanTextField
            label="Display name"
            value={form.name}
            maxLength={80}
            onChange={(name) => setForm((current) => ({ ...current, name }))}
          />
          <label className="admin-field">
            <span>Description</span>
            <textarea
              required
              maxLength={300}
              rows={3}
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </label>
          <PlanNumberField
            label="Monthly price (paise)"
            value={form.monthlyAmount}
            maximum={100_000_000}
            onChange={(monthlyAmount) =>
              setForm((current) => ({ ...current, monthlyAmount }))
            }
          />
          <PlanNumberField
            label="Annual price (paise)"
            value={form.annualAmount}
            maximum={1_000_000_000}
            onChange={(annualAmount) =>
              setForm((current) => ({ ...current, annualAmount }))
            }
          />
          <label className="admin-field">
            <span>Features (one per line)</span>
            <textarea
              required
              rows={5}
              value={form.features.join("\n")}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  features: event.target.value
                    .split("\n")
                    .map((value) => value.trim())
                    .filter(Boolean)
                    .slice(0, 30),
                }))
              }
            />
          </label>
          <label className="admin-policy-section flex cursor-pointer items-center justify-between gap-4 p-4 text-sm">
            <span>
              <span className="block font-semibold">Feature this plan</span>
              <span className="mt-1 block text-xs text-[#aaa59d]">
                Visually emphasize this plan in customer-facing pricing views.
              </span>
            </span>
            <input
              type="checkbox"
              checked={form.highlighted}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  highlighted: event.target.checked,
                }))
              }
              className="h-5 w-5 accent-[#e8816a]"
            />
          </label>
        </div>

        <div className="mt-7 border-t border-white/10 pt-5 text-xs font-semibold uppercase tracking-wide text-[#aaa59d]">
          Usage limits
        </div>
        {plan.planId !== "free" && (
          <p className="mt-2 text-xs leading-5 text-[#aaa59d]">
            Select changed limits that should be evaluated for active
            subscribers. The backend must apply them only where the new value is
            an upgrade.
          </p>
        )}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {fields.map(([key, label, maximum]) => {
            const change = getLimitChange(plan.limits[key], form.limits[key]);
            const canPropagate =
              plan.planId !== "free" && change !== "unchanged";
            return (
              <div key={key} className="admin-policy-section p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[#aaa59d]">
                    {label}
                  </span>
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
                    if (
                      getLimitChange(plan.limits[key], value) === "unchanged"
                    ) {
                      setPropagateLimitFields((current) =>
                        current.filter((field) => field !== key),
                      );
                    }
                  }}
                  className="w-full rounded-lg border border-[rgba(255,255,255,0.12)] bg-[#24211e] px-3 py-2 text-sm outline-none focus:border-[#e8816a]"
                />
                {plan.planId !== "free" && (
                  <label
                    className={`mt-3 flex items-start gap-2 text-xs ${
                      canPropagate
                        ? "cursor-pointer text-[#d7d2ca]"
                        : "text-[#817c75]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      disabled={!canPropagate}
                      checked={propagateLimitFields.includes(key)}
                      onChange={(event) =>
                        setPropagateLimitFields((current) =>
                          event.target.checked
                            ? [...new Set([...current, key])]
                            : current.filter((field) => field !== key),
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

        {update.isError && (
          <div
            className="mt-4 rounded-lg border border-[#e26767]/25 bg-[#e26767]/10 p-3 text-sm text-[#e26767]"
            role="alert"
          >
            {getUserFacingError(update.error, "Plan could not be saved.")}
          </div>
        )}

        <div className="admin-sticky-action-bar mt-6">
          <div>
            <strong className="block text-sm">
              Customer-facing plan configuration
            </strong>
            <span className="text-xs text-[#aaa59d]">
              Review pricing and limits before publishing.
            </span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="admin-button"
              onClick={requestCancel}
              disabled={update.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={update.isPending || !changes.length}
              className="admin-primary-button"
            >
              Review changes
            </button>
          </div>
        </div>
      </form>

      <Modal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        preventClose={update.isPending}
        ariaLabel={`Review changes to the ${plan.name} subscription plan`}
        contentClassName="max-w-2xl bg-[#1c1a18] text-[#f2f0eb]"
      >
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#f0a842]/12 text-[#f0a842]">
            <AlertTriangle size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-editorial text-2xl font-bold">
              Review plan changes
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#aaa59d]">
              Pricing and limits are customer-visible. Verify every value before
              publishing.
            </p>
          </div>
        </div>

        <div className="admin-table-scroll mt-5 max-h-72 overflow-auto rounded-xl border border-white/10">
          <table className="admin-table w-full min-w-125 text-left text-sm">
            <caption className="sr-only">
              Review of subscription plan changes
            </caption>
            <thead>
              <tr>
                <th scope="col">Field</th>
                <th scope="col">Previous</th>
                <th scope="col">New</th>
              </tr>
            </thead>
            <tbody>
              {changes.map((change) => (
                <tr key={change.key}>
                  <td className="font-semibold">{change.label}</td>
                  <td className="text-[#aaa59d]">{change.before}</td>
                  <td className="font-semibold text-[#e8816a]">
                    {change.after}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {propagateLimitFields.length > 0 && (
          <div className="admin-dialog-section mt-4 p-4 text-sm">
            <strong>
              {propagateLimitFields.length} limit field
              {propagateLimitFields.length === 1 ? "" : "s"}
            </strong>{" "}
            will be evaluated for eligible active-subscriber upgrades.
          </div>
        )}

        <label className="admin-field mt-5">
          <span>Audit reason</span>
          <textarea
            rows={3}
            minLength={10}
            maxLength={500}
            value={changeReason}
            onChange={(event) => setChangeReason(event.target.value)}
            placeholder="Explain why this plan is changing."
          />
        </label>
        <label className="admin-field mt-4">
          <span>6-digit authenticator code</span>
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={mfaCode}
            onChange={(event) =>
              setMfaCode(event.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="000000"
          />
        </label>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="admin-button"
            onClick={() => setReviewOpen(false)}
          >
            Back to edit
          </button>
          <button
            type="button"
            className="admin-primary-button"
            disabled={!reviewReady || update.isPending}
            onClick={applyChanges}
          >
            {update.isPending ? (
              <>
                <LoaderCircle size={15} className="animate-spin" /> Saving…
              </>
            ) : (
              `Publish ${plan.planId} plan`
            )}
          </button>
        </div>
      </Modal>

      <Modal
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        ariaLabel="Discard unsaved plan changes"
        contentClassName="max-w-md bg-[#1c1a18] text-[#f2f0eb]"
      >
        <h2 className="font-editorial text-2xl font-bold">
          Discard unsaved changes?
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#aaa59d]">
          Your edits to this subscription plan will be permanently lost.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="admin-button"
            onClick={() => setDiscardOpen(false)}
          >
            Keep editing
          </button>
          <button
            type="button"
            className="admin-danger-button"
            onClick={onCancel}
          >
            Discard changes
          </button>
        </div>
      </Modal>
    </>
  );
}

type PlanChange = { key: string; label: string; before: string; after: string };

function collectPlanChanges(
  before: AdminSubscriptionPlanInput,
  after: AdminSubscriptionPlanInput,
): PlanChange[] {
  const changes: PlanChange[] = [];
  const add = (
    key: string,
    label: string,
    left: unknown,
    right: unknown,
    format?: (value: unknown) => string,
  ) => {
    if (JSON.stringify(left) === JSON.stringify(right)) return;
    changes.push({ key, label, before: format?.(left) ?? String(left), after: format?.(right) ?? String(right) });
  };

  add("name", "Display name", before.name, after.name);
  add("description", "Description", before.description, after.description);
  add(
    "monthlyAmount",
    "Monthly price",
    before.monthlyAmount,
    after.monthlyAmount,
    (value) => formatMoney(Number(value)),
  );
  add(
    "annualAmount",
    "Annual price",
    before.annualAmount,
    after.annualAmount,
    (value) => formatMoney(Number(value)),
  );
  add("features", "Features", before.features, after.features, (value) =>
    (value as string[]).join(" · "),
  );
  add(
    "highlighted",
    "Featured plan",
    before.highlighted,
    after.highlighted,
    (value) => (value ? "Yes" : "No"),
  );

  const labels: Record<AdminPlanLimitField, string> = {
    maxTrackers: "Maximum trackers",
    trackerGenerationsPerMonth: "Generated trackers / month",
    lessonGenerationsPerDay: "Generated lessons / day",
    mockTestGenerationsPerMonth: "Generated mock tests / month",
    aiTutorRequestsPerDay: "AI tutor requests / day",
  };
  for (const key of Object.keys(labels) as AdminPlanLimitField[]) {
    add(
      `limits.${key}`,
      labels[key],
      before.limits[key],
      after.limits[key],
      (value) =>
        Number(value) === 0 ? "Unlimited" : number.format(Number(value)),
    );
  }
  return changes;
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
    <label className="admin-field">
      <span>{label}</span>
      <input
        required
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
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
    <label className="admin-field">
      <span>{label}</span>
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

type LimitChange = "upgrade" | "downgrade" | "unchanged";

function getLimitChange(current: number, next: number): LimitChange {
  if (current === next) return "unchanged";
  if (current === 0) return "downgrade";
  if (next === 0 || next > current) return "upgrade";
  return "downgrade";
}

function LimitChangeBadge({ change }: { change: LimitChange }) {
  const className =
    change === "upgrade"
      ? "border-[#52c58c]/40 bg-[#52c58c]/10 text-[#52c58c]"
      : change === "downgrade"
        ? "border-[#f0a842]/40 bg-[#f0a842]/10 text-[#f0a842]"
        : "border-white/10 text-[#817c75]";
  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${className}`}
    >
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
            <div
              key={label}
              className="flex items-center justify-between gap-4 px-6 py-4"
            >
              <div>
                <div className="font-semibold capitalize">{label}</div>
                <div className="text-xs text-[#aaa59d]">{detail}</div>
              </div>
              <div className="font-editorial text-lg text-[#52c58c]">
                {value}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPanel>
  );
}
