import type { AdminActor, AdminListQuery, AdminPage } from '../../../../../shared/admin';
import type {
  AdminTracker,
  AdminTrackerDetail,
  AdminPublishedTracker,
  AdminPublishedTrackerEngagementResult,
  AdminTrackerReport,
  AdminTrackerLifecycleInput,
  AdminTrackerLifecycleResult,
  AdminTrackerReportUpdateInput,
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
  listReports(query: AdminListQuery): Promise<AdminPage<AdminTrackerReport>>;
  updateReport(
    id: string,
    input: AdminTrackerReportUpdateInput,
    actor: AdminActor
  ): Promise<AdminTrackerReport | null>;
  updateLifecycle(
    id: string,
    input: AdminTrackerLifecycleInput,
    actor: AdminActor
  ): Promise<AdminTrackerLifecycleResult | null>;
}
