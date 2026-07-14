import type { AdminPage } from '../../shared/domain';
import type {
  AdminPublishedTracker,
  AdminPublishedTrackerEngagementResult,
  AdminTracker,
  AdminTrackerDeleteResult,
  AdminTrackerDetail,
} from '../domain/entities/admin-tracker.entity';
import type {
  AdminPublishedTrackerDTO,
  AdminPublishedTrackerEngagementResultDTO,
  AdminTrackerDTO,
  AdminTrackerDeleteResultDTO,
  AdminTrackerDetailDTO,
} from './admin-trackers.dto';

export interface IAdminTrackersMapper {
  toDTO(entity: AdminTracker): AdminTrackerDTO;
  toDetailDTO(entity: AdminTrackerDetail): AdminTrackerDetailDTO;
  toDeleteResultDTO(result: AdminTrackerDeleteResult): AdminTrackerDeleteResultDTO;
  toPublishedDTO(entity: AdminPublishedTracker): AdminPublishedTrackerDTO;
  toEngagementResultDTO(
    result: AdminPublishedTrackerEngagementResult
  ): AdminPublishedTrackerEngagementResultDTO;
  toPageDTO(page: AdminPage<AdminTracker>): AdminPage<AdminTrackerDTO>;
  toPublishedPageDTO(page: AdminPage<AdminPublishedTracker>): AdminPage<AdminPublishedTrackerDTO>;
}

export class AdminTrackersMapper implements IAdminTrackersMapper {
  toDTO(entity: AdminTracker): AdminTrackerDTO {
    return { ...entity };
  }
  toDetailDTO(entity: AdminTrackerDetail): AdminTrackerDetailDTO {
    return {
      ...entity,
      topics: entity.topics.map((topic) => ({
        ...topic,
        subtopics: topic.subtopics.map((subtopic) => ({ ...subtopic })),
      })),
    };
  }
  toDeleteResultDTO(result: AdminTrackerDeleteResult): AdminTrackerDeleteResultDTO {
    return { ...result };
  }
  toPublishedDTO(entity: AdminPublishedTracker): AdminPublishedTrackerDTO {
    return { ...entity };
  }
  toEngagementResultDTO(
    result: AdminPublishedTrackerEngagementResult
  ): AdminPublishedTrackerEngagementResultDTO {
    return { ...result };
  }
  toPageDTO(page: AdminPage<AdminTracker>): AdminPage<AdminTrackerDTO> {
    return this.mapPage(page, (item) => this.toDTO(item));
  }
  toPublishedPageDTO(page: AdminPage<AdminPublishedTracker>): AdminPage<AdminPublishedTrackerDTO> {
    return this.mapPage(page, (item) => this.toPublishedDTO(item));
  }
  private mapPage<TEntity, TDTO>(
    page: AdminPage<TEntity>,
    mapItem: (item: TEntity) => TDTO
  ): AdminPage<TDTO> {
    return {
      ...page,
      items: page.items.map(mapItem),
      pagination: { ...page.pagination },
      ...(page.stats ? { stats: { ...page.stats } } : {}),
    };
  }
}
