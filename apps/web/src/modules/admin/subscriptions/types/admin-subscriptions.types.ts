import type { AdminPageData } from "../../shared";

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
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    subscriptions: number;
  }>;
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
export type AdminPlanLimitField = keyof AdminPlanLimits;
export type AdminSubscriptionPlan = {
  planId: "free" | "pro" | "premium";
  name: string;
  description: string;
  monthlyAmount: number;
  annualAmount: number;
  currency: "INR";
  features: string[];
  highlighted: boolean;
  limits: AdminPlanLimits;
  updatedAt: string | null;
};

export type AdminSubscriptionPlanInput = Omit<
  AdminSubscriptionPlan,
  "planId" | "updatedAt"
>;
export type AdminSubscriptionPlanUpdateInput = {
  plan: AdminSubscriptionPlanInput;
  propagateLimitFields: AdminPlanLimitField[];
};
