import type { AdminActor, AdminListQuery, AdminPage } from '../../../shared';
import type {
  AdminTracker,
  AdminTrackerDeleteResult,
  AdminTrackerDetail,
  AdminPublishedTracker,
  AdminPublishedTrackerEngagementResult,
} from '../admin-tracker.entity';
export interface IAdminTrackersRepository {
  list(query: AdminListQuery): Promise<AdminPage<AdminTracker>>;
  listPublished(query: AdminListQuery, actor: AdminActor): Promise<AdminPage<AdminPublishedTracker>>;
  likePublished(id: string, actor: AdminActor): Promise<AdminPublishedTrackerEngagementResult>;
  ratePublished(
    id: string,
    rating: number,
    actor: AdminActor
  ): Promise<AdminPublishedTrackerEngagementResult>;
  getDetail(id: string): Promise<AdminTrackerDetail | null>;
  delete(id: string, actor: AdminActor): Promise<AdminTrackerDeleteResult>;
}
