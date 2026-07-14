import type { AdminAnalytics, AdminAnalyticsRange } from '../../domain/entities/admin-analytics.entity';
import type { IAdminAnalyticsRepository } from '../../domain/repositories/admin-analytics.repository.interface';
export interface IGetAdminAnalyticsUseCase {
  execute(range: AdminAnalyticsRange): Promise<AdminAnalytics>;
}
export class GetAdminAnalyticsUseCase implements IGetAdminAnalyticsUseCase {
  constructor(private readonly repository: IAdminAnalyticsRepository) {}
  execute(range: AdminAnalyticsRange) {
    return this.repository.get(range);
  }
}
