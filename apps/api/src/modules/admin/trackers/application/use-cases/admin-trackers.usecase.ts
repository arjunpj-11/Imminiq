import type { AdminActor, AdminListQuery, AdminPage } from '../../../shared';
import { ApiError } from '../../../../../shared/utils/ApiError';
import type {
  AdminTracker,
  AdminTrackerDeleteResult,
  AdminTrackerDetail,
  AdminPublishedTracker,
  AdminPublishedTrackerEngagementResult,
} from '../../domain/admin-tracker.entity';
import type { IAdminTrackersRepository } from '../../domain/repositories/admin-trackers.repository.interface';
import type { IAdminTrackerEmailProvider } from '../../domain/services/admin-tracker-email-provider.interface';
export interface IAdminTrackersUseCase {
  list(query: AdminListQuery): Promise<AdminPage<AdminTracker>>;
  listPublished(query: AdminListQuery, actor: AdminActor): Promise<AdminPage<AdminPublishedTracker>>;
  likePublished(id: string, actor: AdminActor): Promise<AdminPublishedTrackerEngagementResult>;
  ratePublished(
    id: string,
    rating: number,
    actor: AdminActor
  ): Promise<AdminPublishedTrackerEngagementResult>;
  getDetail(id: string): Promise<AdminTrackerDetail>;
  delete(id: string, actor: AdminActor): Promise<AdminTrackerDeleteResult>;
}
export class AdminTrackersUseCase implements IAdminTrackersUseCase {
  constructor(
    private readonly repository: IAdminTrackersRepository,
    private readonly emailProvider: IAdminTrackerEmailProvider
  ) {}
  list(query: AdminListQuery) {
    return this.repository.list(query);
  }
  listPublished(query: AdminListQuery, actor: AdminActor) {
    return this.repository.listPublished(query, actor);
  }
  likePublished(id: string, actor: AdminActor) {
    return this.repository.likePublished(id, actor);
  }
  ratePublished(id: string, rating: number, actor: AdminActor) {
    return this.repository.ratePublished(id, rating, actor);
  }
  async getDetail(id: string) {
    const tracker = await this.repository.getDetail(id);
    if (!tracker) throw new ApiError(404, 'Tracker not found', 'TRACKER_NOT_FOUND');
    return tracker;
  }
  async delete(id: string, actor: AdminActor) {
    const tracker = await this.getDetail(id);
    if (tracker.ownerEmail)
      await this.emailProvider.sendTrackerDeleted(tracker.ownerEmail, {
        ownerName: tracker.owner,
        trackerTitle: tracker.title,
      });
    return this.repository.delete(id, actor);
  }
}
