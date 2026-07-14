import type {
  AdminSubscriptionOverview,
  AdminSubscriptionPlan,
} from '../domain/entities/admin-subscription.entity';
import type {
  IAdminSubscriptionOverviewDTO,
  IAdminSubscriptionPlanDTO,
} from './admin-subscriptions.dto';

export interface IAdminSubscriptionsMapper {
  toOverviewDTO(entity: AdminSubscriptionOverview): IAdminSubscriptionOverviewDTO;
  toPlanDTO(entity: AdminSubscriptionPlan): IAdminSubscriptionPlanDTO;
}

export class AdminSubscriptionsMapper implements IAdminSubscriptionsMapper {
  toPlanDTO(entity: AdminSubscriptionPlan): IAdminSubscriptionPlanDTO {
    return { ...entity, limits: { ...entity.limits } };
  }

  toOverviewDTO(entity: AdminSubscriptionOverview): IAdminSubscriptionOverviewDTO {
    return {
      metrics: { ...entity.metrics },
      planBreakdown: entity.planBreakdown.map((item) => ({ ...item })),
      revenueByMonth: entity.revenueByMonth.map((item) => ({ ...item })),
      subscriptions: {
        ...entity.subscriptions,
        items: entity.subscriptions.items.map((item) => ({ ...item })),
        pagination: { ...entity.subscriptions.pagination },
        ...(entity.subscriptions.stats
          ? { stats: { ...entity.subscriptions.stats } }
          : {}),
      },
      plans: entity.plans.map((plan) => this.toPlanDTO(plan)),
    };
  }
}
