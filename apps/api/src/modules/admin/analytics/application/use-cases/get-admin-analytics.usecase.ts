import type { AdminAnalytics } from '../../domain/admin-analytics.entity'
import type { IAdminAnalyticsRepository } from '../../domain/repositories/admin-analytics.repository.interface'
export interface IGetAdminAnalyticsUseCase { execute(days: number): Promise<AdminAnalytics> }
export class GetAdminAnalyticsUseCase implements IGetAdminAnalyticsUseCase { constructor(private readonly repository: IAdminAnalyticsRepository) {} execute(days: number) { return this.repository.get(days) } }
