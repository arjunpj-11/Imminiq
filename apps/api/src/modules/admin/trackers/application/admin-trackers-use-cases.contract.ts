import type { IGetAdminTrackerDetailUseCase } from './use-cases/get-admin-tracker-detail.usecase';
import type { ILikeAdminPublishedTrackerUseCase } from './use-cases/like-admin-published-tracker.usecase';
import type { IListAdminPublishedTrackersUseCase } from './use-cases/list-admin-published-trackers.usecase';
import type { IListAdminTrackersUseCase } from './use-cases/list-admin-trackers.usecase';
import type { IRateAdminPublishedTrackerUseCase } from './use-cases/rate-admin-published-tracker.usecase';
import type { IListAdminTrackerReportsUseCase } from './use-cases/list-admin-tracker-reports.usecase';
import type { IUpdateAdminTrackerReportUseCase } from './use-cases/update-admin-tracker-report.usecase';
import type { IUpdateAdminTrackerLifecycleUseCase } from './use-cases/update-admin-tracker-lifecycle.usecase';
import type { AdminTrackerReviewsUseCases } from './admin-tracker-reviews';

export type AdminTrackersUseCases = {
  exports: import('../../shared/application').IAdminExportService;
  contentAppeals: import('../../shared/application').IAdminContentAppealService;
  list: IListAdminTrackersUseCase;
  listPublished: IListAdminPublishedTrackersUseCase;
  likePublished: ILikeAdminPublishedTrackerUseCase;
  ratePublished: IRateAdminPublishedTrackerUseCase;
  getDetail: IGetAdminTrackerDetailUseCase;
  listReports: IListAdminTrackerReportsUseCase;
  updateReport: IUpdateAdminTrackerReportUseCase;
  updateLifecycle: IUpdateAdminTrackerLifecycleUseCase;
  reviews: AdminTrackerReviewsUseCases;
  versions: import('./admin-tracker-version.service').IAdminTrackerVersionService;
};
