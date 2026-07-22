import type { AdminPage } from '../../../../shared/admin';
import type {
  AdminPlanLimitField,
  AdminSubscriptionPlanInput,
} from '../domain/entities/admin-subscription.entity';

export type AdminSubscriptionPlanUpdateInputDTO = {
  plan: AdminSubscriptionPlanInput;
  propagateLimitFields: AdminPlanLimitField[];
};

export interface AdminSubscriptionItemDTO {
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

export interface AdminPlanLimitsDTO {
  maxTrackers: number;
  trackerGenerationsPerMonth: number;
  lessonGenerationsPerDay: number;
  mockTestGenerationsPerMonth: number;
  aiTutorRequestsPerDay: number;
}

export interface AdminSubscriptionPlanDTO {
  planId: 'free' | 'pro' | 'premium';
  name: string;
  description: string;
  monthlyAmount: number;
  annualAmount: number;
  currency: 'INR';
  features: string[];
  highlighted: boolean;
  limits: AdminPlanLimitsDTO;
  updatedAt: Date | null;
}

export interface AdminSubscriptionOverviewDTO {
  metrics: {
    totalRevenue: number;
    subscriptionsBought: number;
    activePremiumSubscriptions: number;
    monthlyRecurringRevenue: number;
  };
  planBreakdown: Array<{ plan: string; count: number; revenue: number }>;
  revenueByMonth: Array<{ month: string; revenue: number; subscriptions: number }>;
  subscriptions: AdminPage<AdminSubscriptionItemDTO>;
  plans: AdminSubscriptionPlanDTO[];
}
