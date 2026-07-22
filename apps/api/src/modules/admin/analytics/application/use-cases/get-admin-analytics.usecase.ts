import type { AdminAnalyticsRange } from '../../domain/entities/admin-analytics.entity';
import type { IAdminAnalyticsRepository } from '../../domain/repositories/admin-analytics.repository.interface';
import type { AdminAnalyticsDTO } from '../admin-analytics.dto';
import type { IAdminAnalyticsMapper } from '../admin-analytics.mapper';
export interface IGetAdminAnalyticsUseCase {
  execute(range: AdminAnalyticsRange): Promise<AdminAnalyticsDTO>;
}
export class GetAdminAnalyticsUseCase implements IGetAdminAnalyticsUseCase {
  constructor(
    private readonly _repository: IAdminAnalyticsRepository,
    private readonly _mapper: IAdminAnalyticsMapper
  ) {}
  async execute(range: AdminAnalyticsRange): Promise<AdminAnalyticsDTO> {
    return this._mapper.toDTO(await this._repository.get(range));
  }
}
