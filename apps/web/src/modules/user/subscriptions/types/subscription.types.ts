export type SubscriptionBillingCycle = 'monthly' | 'annual';
export type SubscriptionPlan = {
  id: 'free' | 'pro' | 'premium';
  name: string;
  description: string;
  monthlyAmount: number;
  annualAmount: number;
  currency: 'INR';
  features: string[];
  limits: SubscriptionPlanLimits;
  highlighted: boolean;
};
export type SubscriptionPlanLimits = {
  maxTrackers: number;
  trackerGenerationsPerMonth: number;
  lessonGenerationsPerDay: number;
  mockTestGenerationsPerMonth: number;
  aiTutorRequestsPerDay: number;
};
export type UserSubscription = {
  id: string;
  planId: 'pro' | 'premium';
  planName: string;
  billingCycle: SubscriptionBillingCycle;
  amount: number;
  currency: 'INR';
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  limits: SubscriptionPlanLimits;
};
export type SubscriptionOrder = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  planName: string;
};
