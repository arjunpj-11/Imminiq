import type { AdminListQuery, AdminPage } from '../../shared';

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
  startsAt: Date | null;
  endsAt: Date | null;
  purchasedAt: Date;
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
  subscriptions: AdminPage<AdminSubscriptionItem>;
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
  updatedAt: Date | null;
};

export type AdminSubscriptionQuery = AdminListQuery;
