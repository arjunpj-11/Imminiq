import type { AdminPage } from '../../shared';

export interface IAdminSubscriptionItemDTO {
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
}

export interface IAdminPlanLimitsDTO {
  maxTrackers: number;
  trackerGenerationsPerMonth: number;
  lessonGenerationsPerDay: number;
  mockTestGenerationsPerMonth: number;
  aiTutorRequestsPerDay: number;
}

export interface IAdminSubscriptionPlanDTO {
  planId: 'free' | 'pro' | 'premium';
  limits: IAdminPlanLimitsDTO;
  updatedAt: Date | null;
}

export interface IAdminSubscriptionOverviewDTO {
  metrics: {
    totalRevenue: number;
    subscriptionsBought: number;
    activePremiumSubscriptions: number;
    monthlyRecurringRevenue: number;
  };
  planBreakdown: Array<{ plan: string; count: number; revenue: number }>;
  revenueByMonth: Array<{ month: string; revenue: number; subscriptions: number }>;
  subscriptions: AdminPage<IAdminSubscriptionItemDTO>;
  plans: IAdminSubscriptionPlanDTO[];
}
