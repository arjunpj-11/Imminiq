import type { ErrorKind } from '../../../../shared/errors/error-kind';
import type { AdminActor, AdminListQuery, AdminPage } from '../../../../shared/admin';
import type {
  AdminTrackerReview,
  AdminTrackerReviewConsensusChoice,
  AdminTrackerReviewConsensusResult,
  AdminTrackerReviewStatusResult,
} from '../domain/entities/admin-tracker-review.entity';
import type { IAdminTrackerReviewsRepository } from '../domain/repositories/admin-tracker-reviews.repository.interface';

export type AdminTrackerReviewDTO = AdminTrackerReview;
export type AdminTrackerReviewStatusResultDTO = AdminTrackerReviewStatusResult;
export type AdminTrackerReviewConsensusResultDTO = AdminTrackerReviewConsensusResult;

export class AdminTrackerReviewsApplicationError extends Error {
  readonly kind: ErrorKind;
  readonly code: string;
  private constructor(kind: ErrorKind, code: string, message: string) {
    super(message);
    this.name = 'AdminTrackerReviewsApplicationError';
    this.kind = kind;
    this.code = code;
  }
  static notFound() {
    return new AdminTrackerReviewsApplicationError('missing-resource', 'TRACKER_REVIEW_NOT_FOUND', 'Tracker review not found');
  }
  static notOpen() {
    return new AdminTrackerReviewsApplicationError('conflict', 'TRACKER_REVIEW_NOT_OPEN', 'Consensus can only be changed while a review is open');
  }
}

export class AdminTrackerReviewsMapper {
  toPageDTO(page: AdminPage<AdminTrackerReview>): AdminPage<AdminTrackerReviewDTO> {
    return { ...page, items: page.items.map((item) => ({ ...item })), pagination: { ...page.pagination }, ...(page.stats ? { stats: { ...page.stats } } : {}) };
  }
  toStatusResultDTO(result: AdminTrackerReviewStatusResult): AdminTrackerReviewStatusResultDTO { return { ...result }; }
  toConsensusResultDTO(result: AdminTrackerReviewConsensusResult): AdminTrackerReviewConsensusResultDTO { return { ...result }; }
}

export interface IListAdminTrackerReviewsUseCase { execute(query: AdminListQuery): Promise<AdminPage<AdminTrackerReviewDTO>>; }
export class ListAdminTrackerReviewsUseCase implements IListAdminTrackerReviewsUseCase {
  constructor(private readonly repository: IAdminTrackerReviewsRepository, private readonly mapper: AdminTrackerReviewsMapper) {}
  async execute(query: AdminListQuery) { return this.mapper.toPageDTO(await this.repository.list(query)); }
}

export interface IAddAdminTrackerReviewConsensusUseCase {
  execute(id: string, choice: AdminTrackerReviewConsensusChoice, actor: AdminActor): Promise<AdminTrackerReviewConsensusResultDTO>;
}
export class AddAdminTrackerReviewConsensusUseCase implements IAddAdminTrackerReviewConsensusUseCase {
  constructor(private readonly repository: IAdminTrackerReviewsRepository, private readonly mapper: AdminTrackerReviewsMapper) {}
  async execute(id: string, choice: AdminTrackerReviewConsensusChoice, actor: AdminActor) {
    const result = await this.repository.addConsensusVote(id, choice, actor);
    if (result.kind === 'not_found') throw AdminTrackerReviewsApplicationError.notFound();
    if (result.kind === 'not_open') throw AdminTrackerReviewsApplicationError.notOpen();
    return this.mapper.toConsensusResultDTO(result.value);
  }
}

export interface IResolveAdminTrackerReviewUseCase {
  execute(id: string, status: string, actor: AdminActor): Promise<AdminTrackerReviewStatusResultDTO>;
}
export class ResolveAdminTrackerReviewUseCase implements IResolveAdminTrackerReviewUseCase {
  constructor(private readonly repository: IAdminTrackerReviewsRepository, private readonly mapper: AdminTrackerReviewsMapper) {}
  async execute(id: string, status: string, actor: AdminActor) {
    const result = await this.repository.resolve(id, status, actor);
    if (!result) throw AdminTrackerReviewsApplicationError.notFound();
    return this.mapper.toStatusResultDTO(result);
  }
}

export type AdminTrackerReviewsUseCases = {
  list: IListAdminTrackerReviewsUseCase;
  addConsensus: IAddAdminTrackerReviewConsensusUseCase;
  resolve: IResolveAdminTrackerReviewUseCase;
};
