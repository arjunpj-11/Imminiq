import type { AdminPageData } from '../../admin-api.types';

export type AdminSubscriptionItem = {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  planName: string;
  billingCycle: string;
  amount: number;
  currency: string;
  status: string;
  paymentId: string | null;
  startsAt: string | null;
  endsAt: string | null;
  purchasedAt: string;
};

export type AdminSubscriptionOverview = {
  metrics: {
    totalRevenue: number;
    subscriptionsBought: number;
    activePremiumSubscriptions: number;
    monthlyRecurringRevenue: number;
  };
  planBreakdown: Array<{ plan: string; count: number; revenue: number }>;
  revenueByMonth: Array<{ month: string; revenue: number; subscriptions: number }>;
  subscriptions: AdminPageData<AdminSubscriptionItem>;
  plans: AdminSubscriptionPlan[];
};

export type AdminPlanLimits = {
  maxTrackers: number;
  trackerGenerationsPerMonth: number;
  lessonGenerationsPerDay: number;
  mockTestGenerationsPerMonth: number;
  aiTutorRequestsPerDay: number;
};
export type AdminSubscriptionPlan = {
  planId: 'free' | 'pro' | 'premium';
  limits: AdminPlanLimits;
  updatedAt: string | null;
};
