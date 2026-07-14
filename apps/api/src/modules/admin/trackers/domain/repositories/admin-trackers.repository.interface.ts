import type { AdminActor, AdminListQuery, AdminPage } from '../../../shared/domain';
import type {
  AdminTracker,
  AdminTrackerDeleteResult,
  AdminTrackerDetail,
  AdminPublishedTracker,
  AdminPublishedTrackerEngagementResult,
} from '../entities/admin-tracker.entity';
export interface IAdminTrackersRepository {
  list(query: AdminListQuery): Promise<AdminPage<AdminTracker>>;
  listPublished(
    query: AdminListQuery,
    actor: AdminActor
  ): Promise<AdminPage<AdminPublishedTracker>>;
  likePublished(
    id: string,
    actor: AdminActor
  ): Promise<AdminPublishedTrackerEngagementResult | null>;
  ratePublished(
    id: string,
    rating: number,
    actor: AdminActor
  ): Promise<AdminPublishedTrackerEngagementResult | null>;
  getDetail(id: string): Promise<AdminTrackerDetail | null>;
  delete(id: string, actor: AdminActor): Promise<AdminTrackerDeleteResult | null>;
}
