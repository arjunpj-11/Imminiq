import type { AdminSubscriptionQuery } from '../../domain/entities/admin-subscription.entity';
import type { IAdminSubscriptionsRepository } from '../../domain/repositories/admin-subscriptions.repository.interface';
import type { IAdminSubscriptionOverviewDTO } from '../admin-subscriptions.dto';
import type { IAdminSubscriptionsMapper } from '../admin-subscriptions.mapper';

export interface IGetAdminSubscriptionOverviewUseCase {
  execute(query: AdminSubscriptionQuery): Promise<IAdminSubscriptionOverviewDTO>;
}

export class GetAdminSubscriptionOverviewUseCase
  implements IGetAdminSubscriptionOverviewUseCase
{
  constructor(
    private readonly repository: IAdminSubscriptionsRepository,
    private readonly mapper: IAdminSubscriptionsMapper
  ) {}

  async execute(query: AdminSubscriptionQuery): Promise<IAdminSubscriptionOverviewDTO> {
    return this.mapper.toOverviewDTO(await this.repository.getOverview(query));
  }
}
