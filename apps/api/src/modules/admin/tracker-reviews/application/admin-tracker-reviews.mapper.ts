import type { AdminPage } from '../../shared/domain';
import type {
  AdminTrackerReview,
  AdminTrackerReviewConsensusResult,
  AdminTrackerReviewStatusResult,
} from '../domain/entities/admin-tracker-review.entity';
import type {
  AdminTrackerReviewConsensusResultDTO,
  AdminTrackerReviewDTO,
  AdminTrackerReviewStatusResultDTO,
} from './admin-tracker-reviews.dto';

export interface IAdminTrackerReviewsMapper {
  toDTO(entity: AdminTrackerReview): AdminTrackerReviewDTO;
  toStatusResultDTO(result: AdminTrackerReviewStatusResult): AdminTrackerReviewStatusResultDTO;
  toConsensusResultDTO(
    result: AdminTrackerReviewConsensusResult
  ): AdminTrackerReviewConsensusResultDTO;
  toPageDTO(page: AdminPage<AdminTrackerReview>): AdminPage<AdminTrackerReviewDTO>;
}

export class AdminTrackerReviewsMapper implements IAdminTrackerReviewsMapper {
  toDTO(entity: AdminTrackerReview): AdminTrackerReviewDTO {
    return { ...entity };
  }
  toStatusResultDTO(result: AdminTrackerReviewStatusResult): AdminTrackerReviewStatusResultDTO {
    return { ...result };
  }
  toConsensusResultDTO(
    result: AdminTrackerReviewConsensusResult
  ): AdminTrackerReviewConsensusResultDTO {
    return { ...result };
  }
  toPageDTO(page: AdminPage<AdminTrackerReview>): AdminPage<AdminTrackerReviewDTO> {
    return {
      ...page,
      items: page.items.map((item) => this.toDTO(item)),
      pagination: { ...page.pagination },
      ...(page.stats ? { stats: { ...page.stats } } : {}),
    };
  }
}
