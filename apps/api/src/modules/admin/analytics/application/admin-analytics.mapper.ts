import type { AdminAnalytics } from '../domain/entities/admin-analytics.entity';
import type { IAdminAnalyticsDTO } from './admin-analytics.dto';

export interface IAdminAnalyticsMapper {
  toDTO(entity: AdminAnalytics): IAdminAnalyticsDTO;
}

export class AdminAnalyticsMapper implements IAdminAnalyticsMapper {
  toDTO(entity: AdminAnalytics): IAdminAnalyticsDTO {
    return {
      ...entity,
      metrics: { ...entity.metrics },
      dailyUsers: entity.dailyUsers.map((point) => ({ ...point })),
      dailyActivity: entity.dailyActivity.map((point) => ({ ...point })),
    };
  }
}
