import type { AdminPage } from '../../../../shared/admin';
import type {
  AdminTrackerReview,
  AdminTrackerReviewConsensusResult,
  AdminTrackerReviewStatusResult,
} from '../domain/entities/admin-tracker-review.entity';
import type {
  AdminPublishedTracker,
  AdminPublishedTrackerEngagementResult,
  AdminTracker,
  AdminTrackerDetail,
} from '../domain/entities/admin-tracker.entity';
import type {
  AdminPublishedTrackerDTO,
  AdminPublishedTrackerEngagementResultDTO,
  AdminTrackerDTO,
  AdminTrackerDetailDTO,
  AdminTrackerReviewConsensusResultDTO,
  AdminTrackerReviewDTO,
  AdminTrackerReviewStatusResultDTO,
} from './admin-trackers.dto';

export interface IAdminTrackersMapper {
  toDTO(entity: AdminTracker): AdminTrackerDTO;
  toDetailDTO(entity: AdminTrackerDetail): AdminTrackerDetailDTO;
  toPublishedDTO(entity: AdminPublishedTracker): AdminPublishedTrackerDTO;
  toEngagementResultDTO(
    result: AdminPublishedTrackerEngagementResult
  ): AdminPublishedTrackerEngagementResultDTO;
  toPageDTO(page: AdminPage<AdminTracker>): AdminPage<AdminTrackerDTO>;
  toPublishedPageDTO(page: AdminPage<AdminPublishedTracker>): AdminPage<AdminPublishedTrackerDTO>;
  toReviewPageDTO(page: AdminPage<AdminTrackerReview>): AdminPage<AdminTrackerReviewDTO>;
  toReviewStatusResultDTO(
    result: AdminTrackerReviewStatusResult
  ): AdminTrackerReviewStatusResultDTO;
  toReviewConsensusResultDTO(
    result: AdminTrackerReviewConsensusResult
  ): AdminTrackerReviewConsensusResultDTO;
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

  toReviewPageDTO(page: AdminPage<AdminTrackerReview>): AdminPage<AdminTrackerReviewDTO> {
    return this.mapPage(page, (item) => ({ ...item }));
  }

  toReviewStatusResultDTO(
    result: AdminTrackerReviewStatusResult
  ): AdminTrackerReviewStatusResultDTO {
    return { ...result };
  }

  toReviewConsensusResultDTO(
    result: AdminTrackerReviewConsensusResult
  ): AdminTrackerReviewConsensusResultDTO {
    return { ...result };
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
