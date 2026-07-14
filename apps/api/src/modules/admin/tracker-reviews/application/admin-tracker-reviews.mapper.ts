import type { AdminPage } from '../../shared';
import type {
  AdminTrackerReview,
  AdminTrackerReviewConsensusResult,
  AdminTrackerReviewStatusResult,
} from '../domain/entities/admin-tracker-review.entity';
import type {
  IAdminTrackerReviewConsensusResultDTO,
  IAdminTrackerReviewDTO,
  IAdminTrackerReviewStatusResultDTO,
} from './admin-tracker-reviews.dto';

export interface IAdminTrackerReviewsMapper {
  toDTO(entity: AdminTrackerReview): IAdminTrackerReviewDTO;
  toStatusResultDTO(result: AdminTrackerReviewStatusResult): IAdminTrackerReviewStatusResultDTO;
  toConsensusResultDTO(
    result: AdminTrackerReviewConsensusResult
  ): IAdminTrackerReviewConsensusResultDTO;
  toPageDTO(page: AdminPage<AdminTrackerReview>): AdminPage<IAdminTrackerReviewDTO>;
}

export class AdminTrackerReviewsMapper implements IAdminTrackerReviewsMapper {
  toDTO(entity: AdminTrackerReview): IAdminTrackerReviewDTO {
    return { ...entity };
  }
  toStatusResultDTO(result: AdminTrackerReviewStatusResult): IAdminTrackerReviewStatusResultDTO {
    return { ...result };
  }
  toConsensusResultDTO(
    result: AdminTrackerReviewConsensusResult
  ): IAdminTrackerReviewConsensusResultDTO {
    return { ...result };
  }
  toPageDTO(page: AdminPage<AdminTrackerReview>): AdminPage<IAdminTrackerReviewDTO> {
    return {
      ...page,
      items: page.items.map((item) => this.toDTO(item)),
      pagination: { ...page.pagination },
      ...(page.stats ? { stats: { ...page.stats } } : {}),
    };
  }
}
