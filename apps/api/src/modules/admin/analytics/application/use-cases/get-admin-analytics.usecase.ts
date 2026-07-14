import type { AdminAnalyticsRange } from '../../domain/entities/admin-analytics.entity';
import type { IAdminAnalyticsRepository } from '../../domain/repositories/admin-analytics.repository.interface';
import type { IAdminAnalyticsDTO } from '../admin-analytics.dto';
import type { IAdminAnalyticsMapper } from '../admin-analytics.mapper';
export interface IGetAdminAnalyticsUseCase {
  execute(range: AdminAnalyticsRange): Promise<IAdminAnalyticsDTO>;
}
export class GetAdminAnalyticsUseCase implements IGetAdminAnalyticsUseCase {
  constructor(
    private readonly repository: IAdminAnalyticsRepository,
    private readonly mapper: IAdminAnalyticsMapper
  ) {}
  async execute(range: AdminAnalyticsRange): Promise<IAdminAnalyticsDTO> {
    return this.mapper.toDTO(await this.repository.get(range));
  }
}
