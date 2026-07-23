import { useState } from 'react';
import { Check, Crown, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from '../../../../lib/toast';
import { useAuthStore } from '../../../../store/useAuthStore';
import PageHero from '../../../../components/layout/PageHero';
import SkeletonBlock from '../../../../components/feedback/SkeletonBlock';
import {
  useCreateSubscriptionOrder,
  useCurrentSubscription,
  useSubscriptionPlans,
  useVerifySubscriptionPayment,
} from '../hooks/useSubscriptions';
import type { SubscriptionBillingCycle, SubscriptionPlan } from '../types/subscription.types';

type RazorpaySuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpaySuccess) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color: string };
  modal?: { ondismiss?: () => void };
};
declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open(): void };
  }
}

const loadRazorpay = async () => {
  if (window.Razorpay) return true;
  return new Promise<boolean>((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true });
      existing.addEventListener('error', () => resolve(false), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const formatPrice = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount / 100);

export default function SubscriptionPlansPage() {
  const [billingCycle, setBillingCycle] = useState<SubscriptionBillingCycle>('monthly');
  const plans = useSubscriptionPlans();
  const current = useCurrentSubscription();
  const createOrder = useCreateSubscriptionOrder();
  const verify = useVerifySubscriptionPayment();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const purchase = async (plan: SubscriptionPlan) => {
    if (plan.id === 'free') return;
    try {
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        toast.error('Razorpay could not load', 'Check your connection and try again.');
        return;
      }
      const order = await createOrder.mutateAsync({ planId: plan.id, billingCycle });
      new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Imminiq',
        description: `${order.planName} ${billingCycle} subscription`,
        order_id: order.orderId,
        prefill: { name: user?.fullName, email: user?.email, contact: user?.phone },
        theme: { color: '#b84c2b' },
        handler: (response) => {
          void verify
            .mutateAsync({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            .then(() => {
              if (user) setUser({ ...user, isPremium: true });
              toast.success('Premium activated', `${plan.name} is now active on your account.`);
            })
            .catch(() =>
              toast.error('Payment verification failed', 'Contact support if you were charged.')
            );
        },
        modal: { ondismiss: () => toast.info('Checkout closed') },
      }).open();
    } catch {
      toast.error('Could not start checkout', 'Please try again in a moment.');
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <section>
        <PageHero
          eyebrow="Plans & billing"
          title={
            <>
              Invest in deeper <span className="text-(--brand-500)">learning momentum.</span>
            </>
          }
          description="Increase your AI capacity, unlock advanced evaluations, and choose the billing rhythm that fits your goals."
          actions={
            <div className="inline-flex rounded-xl border border-(--border-subtle) bg-(--surface-muted) p-1">
              {(['monthly', 'annual'] as const).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`rounded-lg px-5 py-2 text-sm font-bold capitalize ${billingCycle === cycle ? 'bg-(--brand-500) text-white' : 'text-(--text-secondary)'}`}
                >
                  {cycle}
                  {cycle === 'annual' && <span className="ml-2 text-[10px]">Save up to 17%</span>}
                </button>
              ))}
            </div>
          }
          aside={
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[rgba(184,76,43,0.12)] text-(--brand-500)">
                <Crown size={26} />
              </span>
              <div>
                <div className="font-mono text-[10px] font-semibold uppercase tracking-wider text-(--text-muted)">
                  Flexible access
                </div>
                <div className="mt-1 text-[13px] font-bold text-(--text-primary)">
                  Upgrade, renew, or compare anytime.
                </div>
              </div>
            </div>
          }
        />

        {current.data && (
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(82,197,140,0.25)] bg-[rgba(82,197,140,0.08)] p-4">
            <div>
              <div className="font-bold text-[#2f9d68]">{current.data.planName} is active</div>
              <div className="mt-1 text-xs text-(--text-secondary)">
                {current.data.billingCycle} billing · access until{' '}
                {current.data.endsAt ? new Date(current.data.endsAt).toLocaleDateString() : '—'}
              </div>
            </div>
            <ShieldCheck className="text-[#52c58c]" />
          </div>
        )}

        {plans.isLoading && (
          <div
            className="mt-10 grid gap-5 lg:grid-cols-3"
            role="status"
            aria-label="Loading subscription plans"
          >
            <span className="sr-only">Loading subscription plans…</span>
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                aria-hidden="true"
                className="rounded-2xl border border-(--border-subtle) bg-(--surface-page) p-6"
              >
                <SkeletonBlock className="h-6 w-6 rounded-md" />
                <SkeletonBlock className="mt-4 h-7 w-2/5 rounded-lg" />
                <SkeletonBlock className="mt-3 h-4 w-full" />
                <SkeletonBlock className="mt-2 h-4 w-4/5" />
                <SkeletonBlock className="mt-6 h-10 w-1/2 rounded-lg" />
                <div className="mt-5 grid grid-cols-2 gap-2">
                  {Array.from({ length: 6 }, (_, item) => (
                    <SkeletonBlock key={item} className="h-10 w-full rounded-md" />
                  ))}
                </div>
                <div className="mt-6 space-y-3">
                  {Array.from({ length: 4 }, (_, item) => (
                    <SkeletonBlock key={item} className="h-4 w-4/5" />
                  ))}
                </div>
                <SkeletonBlock className="mt-7 h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
        )}
        {plans.isError && (
          <div className="mt-10 rounded-2xl border border-red-400/30 bg-red-500/5 p-8 text-center">
            <div className="font-bold text-red-600">Subscription plans could not be loaded.</div>
            <button
              type="button"
              onClick={() => void plans.refetch()}
              className="mt-4 rounded-lg border border-(--border-subtle) bg-(--surface-card) px-4 py-2 text-sm font-bold"
            >
              Try again
            </button>
          </div>
        )}

        <div className={plans.isLoading ? 'hidden' : 'mt-10 grid gap-5 lg:grid-cols-3'}>
          {plans.data?.map((plan) => {
            const amount = billingCycle === 'annual' ? plan.annualAmount : plan.monthlyAmount;
            const isCurrent = current.data?.planId === plan.id;
            const limits = isCurrent && current.data ? current.data.limits : plan.limits;
            return (
              <article
                key={plan.id}
                className={`relative rounded-2xl border p-6 ${plan.highlighted ? 'border-(--brand-500) bg-[rgba(184,76,43,0.05)] shadow-lg' : 'border-(--border-subtle) bg-(--surface-page)'}`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-6 rounded-full bg-(--brand-500) px-3 py-1 text-[10px] font-bold uppercase text-white">
                    Most popular
                  </span>
                )}
                <Sparkles size={22} className="text-(--brand-500)" />
                <h2 className="mt-4 text-2xl font-bold">{plan.name}</h2>
                <p className="mt-2 min-h-12 text-sm text-(--text-secondary)">{plan.description}</p>
                <div className="mt-6">
                  <span className="font-editorial text-4xl font-bold">{formatPrice(amount)}</span>
                  {amount > 0 && (
                    <span className="text-sm text-(--text-secondary)">
                      {' '}
                      / {billingCycle === 'annual' ? 'year' : 'month'}
                    </span>
                  )}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                  <Limit label="Total trackers" value={limits.maxTrackers} />
                  <Limit label="Trackers / month" value={limits.trackerGenerationsPerMonth} />
                  <Limit label="Lessons / day" value={limits.lessonGenerationsPerDay} />
                  <Limit label="Mock tests / month" value={limits.mockTestGenerationsPerMonth} />
                  <Limit label="AI tutor / day" value={limits.aiTutorRequestsPerDay} />
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-sm">
                      <Check size={17} className="shrink-0 text-[#52c58c]" /> {feature}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={
                    plan.id === 'free' || isCurrent || createOrder.isPending || verify.isPending
                  }
                  onClick={() => void purchase(plan)}
                  className={`mt-7 w-full rounded-xl px-4 py-3 text-sm font-bold ${plan.highlighted ? 'bg-(--brand-500) text-white' : 'border border-(--border-subtle) bg-(--surface-card)'} disabled:cursor-not-allowed disabled:opacity-55`}
                >
                  {isCurrent
                    ? 'Current plan'
                    : plan.id === 'free'
                      ? 'Included for everyone'
                      : createOrder.isPending
                        ? 'Starting checkout…'
                        : `Choose ${plan.name}`}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

function Limit({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-(--surface-muted) p-2">
      <div className="font-bold">{value === 0 ? 'Unlimited' : value.toLocaleString()}</div>
      <div className="mt-0.5 text-[10px] text-(--text-secondary)">{label}</div>
    </div>
  );
}
