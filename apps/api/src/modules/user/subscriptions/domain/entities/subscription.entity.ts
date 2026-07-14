export type SubscriptionPlanId = 'free' | 'pro' | 'premium';
export type PaidSubscriptionPlanId = Exclude<SubscriptionPlanId, 'free'>;
export type SubscriptionBillingCycle = 'monthly' | 'annual';

export type SubscriptionPlanLimits = {
  maxTrackers: number;
  trackerGenerationsPerMonth: number;
  lessonGenerationsPerDay: number;
  mockTestGenerationsPerMonth: number;
  aiTutorRequestsPerDay: number;
};

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  description: string;
  monthlyAmount: number;
  annualAmount: number;
  currency: 'INR';
  features: string[];
  limits: SubscriptionPlanLimits;
  highlighted: boolean;
};

export type UserSubscription = {
  id: string;
  planId: PaidSubscriptionPlanId;
  planName: string;
  billingCycle: SubscriptionBillingCycle;
  amount: number;
  currency: 'INR';
  status: string;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  limits: SubscriptionPlanLimits;
};

export type PendingSubscriptionInput = {
  userId: string;
  planId: PaidSubscriptionPlanId;
  planName: string;
  billingCycle: SubscriptionBillingCycle;
  amount: number;
  razorpayOrderId: string;
  limits: SubscriptionPlanLimits;
};

export type PaymentVerificationInput = {
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Core learning tools for getting started.',
    monthlyAmount: 0,
    annualAmount: 0,
    currency: 'INR',
    limits: {
      maxTrackers: 3,
      trackerGenerationsPerMonth: 2,
      lessonGenerationsPerDay: 5,
      mockTestGenerationsPerMonth: 3,
      aiTutorRequestsPerDay: 20,
    },
    highlighted: false,
    features: ['Personal trackers', 'Community access', 'Saved lessons', 'Basic mock tests'],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'More AI capacity and advanced learning insights.',
    monthlyAmount: 49_900,
    annualAmount: 499_900,
    currency: 'INR',
    limits: {
      maxTrackers: 25,
      trackerGenerationsPerMonth: 15,
      lessonGenerationsPerDay: 40,
      mockTestGenerationsPerMonth: 30,
      aiTutorRequestsPerDay: 150,
    },
    highlighted: true,
    features: ['Everything in Free', 'Expanded generation limits', 'Advanced evaluations', 'Unlimited tracker sharing'],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Maximum AI access for intensive learning.',
    monthlyAmount: 99_900,
    annualAmount: 999_900,
    currency: 'INR',
    limits: {
      maxTrackers: 100,
      trackerGenerationsPerMonth: 60,
      lessonGenerationsPerDay: 150,
      mockTestGenerationsPerMonth: 100,
      aiTutorRequestsPerDay: 500,
    },
    highlighted: false,
    features: ['Everything in Pro', 'Maximum request limits', 'Priority generation', 'Premium learning access'],
  },
];

export const getDefaultPlanLimits = (planId: SubscriptionPlanId): SubscriptionPlanLimits => {
  const limits = SUBSCRIPTION_PLANS.find((plan) => plan.id === planId)?.limits;
  if (!limits) throw new Error(`Unknown subscription plan: ${planId}`);
  return { ...limits };
};
