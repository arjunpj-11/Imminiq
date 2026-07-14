import type { AdminAnalytics } from '../domain/entities/admin-analytics.entity';
import type { AdminAnalyticsDTO } from './admin-analytics.dto';

export interface IAdminAnalyticsMapper {
  toDTO(entity: AdminAnalytics): AdminAnalyticsDTO;
}

export class AdminAnalyticsMapper implements IAdminAnalyticsMapper {
  toDTO(entity: AdminAnalytics): AdminAnalyticsDTO {
    return {
      ...entity,
      metrics: { ...entity.metrics },
      dailyUsers: entity.dailyUsers.map((point) => ({ ...point })),
      dailyActivity: entity.dailyActivity.map((point) => ({ ...point })),
    };
  }
}
