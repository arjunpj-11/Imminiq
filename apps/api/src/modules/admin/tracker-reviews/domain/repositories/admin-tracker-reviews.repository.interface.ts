import type { AdminActor, AdminListQuery, AdminPage } from '../../../shared'
import type { AdminTrackerReview, AdminTrackerReviewStatusResult } from '../admin-tracker-review.entity'
export interface IAdminTrackerReviewsRepository { list(query: AdminListQuery): Promise<AdminPage<AdminTrackerReview>>; resolve(id: string, status: string, actor: AdminActor): Promise<AdminTrackerReviewStatusResult> }
