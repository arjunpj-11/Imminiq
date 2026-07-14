import type {
  AdminSubscriptionOverview,
  AdminSubscriptionPlan,
} from '../domain/entities/admin-subscription.entity';
import type {
  AdminSubscriptionOverviewDTO,
  AdminSubscriptionPlanDTO,
} from './admin-subscriptions.dto';

export interface IAdminSubscriptionsMapper {
  toOverviewDTO(entity: AdminSubscriptionOverview): AdminSubscriptionOverviewDTO;
  toPlanDTO(entity: AdminSubscriptionPlan): AdminSubscriptionPlanDTO;
}

export class AdminSubscriptionsMapper implements IAdminSubscriptionsMapper {
  toPlanDTO(entity: AdminSubscriptionPlan): AdminSubscriptionPlanDTO {
    return { ...entity, limits: { ...entity.limits } };
  }

  toOverviewDTO(entity: AdminSubscriptionOverview): AdminSubscriptionOverviewDTO {
    return {
      metrics: { ...entity.metrics },
      planBreakdown: entity.planBreakdown.map((item) => ({ ...item })),
      revenueByMonth: entity.revenueByMonth.map((item) => ({ ...item })),
      subscriptions: {
        ...entity.subscriptions,
        items: entity.subscriptions.items.map((item) => ({ ...item })),
        pagination: { ...entity.subscriptions.pagination },
        ...(entity.subscriptions.stats ? { stats: { ...entity.subscriptions.stats } } : {}),
      },
      plans: entity.plans.map((plan) => this.toPlanDTO(plan)),
    };
  }
}
