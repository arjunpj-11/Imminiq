export type SubscriptionOrderDTO = {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  planName: string;
};

export type SubscriptionPlanLimitsDTO = {
  maxTrackers: number;
  trackerGenerationsPerMonth: number;
  lessonGenerationsPerDay: number;
  mockTestGenerationsPerMonth: number;
  aiTutorRequestsPerDay: number;
};

export type SubscriptionPlanDTO = {
  id: 'free' | 'pro' | 'premium';
  name: string;
  description: string;
  monthlyAmount: number;
  annualAmount: number;
  currency: 'INR';
  features: string[];
  limits: SubscriptionPlanLimitsDTO;
  highlighted: boolean;
};

export type UserSubscriptionDTO = {
  id: string;
  planId: 'pro' | 'premium';
  planName: string;
  billingCycle: 'monthly' | 'annual';
  amount: number;
  currency: 'INR';
  status: string;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  limits: SubscriptionPlanLimitsDTO;
};
