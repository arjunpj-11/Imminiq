import type {
  AdminSubscriptionOverview,
  AdminSubscriptionQuery,
} from '../../domain/entities/admin-subscription.entity';
import type { IAdminSubscriptionsRepository } from '../../domain/repositories/admin-subscriptions.repository.interface';

export interface IGetAdminSubscriptionOverviewUseCase {
  execute(query: AdminSubscriptionQuery): Promise<AdminSubscriptionOverview>;
}

export class GetAdminSubscriptionOverviewUseCase
  implements IGetAdminSubscriptionOverviewUseCase
{
  constructor(private readonly repository: IAdminSubscriptionsRepository) {}

  execute(query: AdminSubscriptionQuery): Promise<AdminSubscriptionOverview> {
    return this.repository.getOverview(query);
  }
}
