import type { AdminActor, AdminListQuery, AdminPage } from '../../../shared';
import type {
  AdminTracker,
  AdminTrackerDeleteResult,
  AdminTrackerDetail,
} from '../admin-tracker.entity';
export interface IAdminTrackersRepository {
  list(query: AdminListQuery): Promise<AdminPage<AdminTracker>>;
  getDetail(id: string): Promise<AdminTrackerDetail | null>;
  delete(id: string, actor: AdminActor): Promise<AdminTrackerDeleteResult>;
}
