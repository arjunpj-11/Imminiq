import type { AdminPage } from '../../shared';
import type {
  AdminPublishedTracker,
  AdminPublishedTrackerEngagementResult,
  AdminTracker,
  AdminTrackerDeleteResult,
  AdminTrackerDetail,
} from '../domain/entities/admin-tracker.entity';
import type {
  IAdminPublishedTrackerDTO,
  IAdminPublishedTrackerEngagementResultDTO,
  IAdminTrackerDTO,
  IAdminTrackerDeleteResultDTO,
  IAdminTrackerDetailDTO,
} from './admin-trackers.dto';

export interface IAdminTrackersMapper {
  toDTO(entity: AdminTracker): IAdminTrackerDTO;
  toDetailDTO(entity: AdminTrackerDetail): IAdminTrackerDetailDTO;
  toDeleteResultDTO(result: AdminTrackerDeleteResult): IAdminTrackerDeleteResultDTO;
  toPublishedDTO(entity: AdminPublishedTracker): IAdminPublishedTrackerDTO;
  toEngagementResultDTO(
    result: AdminPublishedTrackerEngagementResult
  ): IAdminPublishedTrackerEngagementResultDTO;
  toPageDTO(page: AdminPage<AdminTracker>): AdminPage<IAdminTrackerDTO>;
  toPublishedPageDTO(
    page: AdminPage<AdminPublishedTracker>
  ): AdminPage<IAdminPublishedTrackerDTO>;
}

export class AdminTrackersMapper implements IAdminTrackersMapper {
  toDTO(entity: AdminTracker): IAdminTrackerDTO {
    return { ...entity };
  }
  toDetailDTO(entity: AdminTrackerDetail): IAdminTrackerDetailDTO {
    return {
      ...entity,
      topics: entity.topics.map((topic) => ({
        ...topic,
        subtopics: topic.subtopics.map((subtopic) => ({ ...subtopic })),
      })),
    };
  }
  toDeleteResultDTO(result: AdminTrackerDeleteResult): IAdminTrackerDeleteResultDTO {
    return { ...result };
  }
  toPublishedDTO(entity: AdminPublishedTracker): IAdminPublishedTrackerDTO {
    return { ...entity };
  }
  toEngagementResultDTO(
    result: AdminPublishedTrackerEngagementResult
  ): IAdminPublishedTrackerEngagementResultDTO {
    return { ...result };
  }
  toPageDTO(page: AdminPage<AdminTracker>): AdminPage<IAdminTrackerDTO> {
    return this.mapPage(page, (item) => this.toDTO(item));
  }
  toPublishedPageDTO(
    page: AdminPage<AdminPublishedTracker>
  ): AdminPage<IAdminPublishedTrackerDTO> {
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
