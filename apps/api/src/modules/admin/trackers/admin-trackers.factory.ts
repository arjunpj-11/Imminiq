import type { AdminTrackersUseCases } from './application/admin-trackers-use-cases.contract';
import { BulkUpdateAdminTrackerLifecycleUseCase } from './application/use-cases/bulk-update-admin-tracker-lifecycle.usecase';
import { GetAdminTrackerDetailUseCase } from './application/use-cases/get-admin-tracker-detail.usecase';
import { LikeAdminPublishedTrackerUseCase } from './application/use-cases/like-admin-published-tracker.usecase';
import { ListAdminPublishedTrackersUseCase } from './application/use-cases/list-admin-published-trackers.usecase';
import { ListAdminTrackersUseCase } from './application/use-cases/list-admin-trackers.usecase';
import { RateAdminPublishedTrackerUseCase } from './application/use-cases/rate-admin-published-tracker.usecase';
import { ListAdminTrackerReportsUseCase } from './application/use-cases/list-admin-tracker-reports.usecase';
import { UpdateAdminTrackerReportUseCase } from './application/use-cases/update-admin-tracker-report.usecase';
import { UpdateAdminTrackerLifecycleUseCase } from './application/use-cases/update-admin-tracker-lifecycle.usecase';
import { mongoAdminTrackersRepository } from './infrastructure/repositories/mongo-admin-trackers.repository';
import { nodemailerAdminTrackerEmailProvider } from './infrastructure/providers/nodemailer-admin-tracker-email.provider';
import { AdminTrackersMapper } from './application/admin-trackers.mapper';
import { AddAdminTrackerReviewConsensusUseCase } from './application/use-cases/add-admin-tracker-review-consensus.usecase';
import { ListAdminTrackerReviewsUseCase } from './application/use-cases/list-admin-tracker-reviews.usecase';
import { ResolveAdminTrackerReviewUseCase } from './application/use-cases/resolve-admin-tracker-review.usecase';
import { mongoAdminTrackerReviewsRepository } from './infrastructure/repositories/mongo-admin-tracker-reviews.repository';
import { AdminContentAppealService, AdminExportService } from './infrastructure';
import { AdminTrackerVersionService } from './infrastructure/services/mongo-admin-tracker-version.service';
export type AdminTrackersComposition = { useCases: AdminTrackersUseCases };

export const createAdminTrackersComposition = (): AdminTrackersComposition => {
  const mapper = new AdminTrackersMapper();
  const updateLifecycle = new UpdateAdminTrackerLifecycleUseCase(
    mongoAdminTrackersRepository,
    nodemailerAdminTrackerEmailProvider
  );
  return {
    useCases: {
      exports: new AdminExportService(),
      contentAppeals: new AdminContentAppealService(),
      bulkUpdateLifecycle: new BulkUpdateAdminTrackerLifecycleUseCase(
        mongoAdminTrackersRepository,
        updateLifecycle
      ),
      versions: new AdminTrackerVersionService(),
      list: new ListAdminTrackersUseCase(mongoAdminTrackersRepository, mapper),
      listPublished: new ListAdminPublishedTrackersUseCase(mongoAdminTrackersRepository, mapper),
      likePublished: new LikeAdminPublishedTrackerUseCase(mongoAdminTrackersRepository, mapper),
      ratePublished: new RateAdminPublishedTrackerUseCase(mongoAdminTrackersRepository, mapper),
      getDetail: new GetAdminTrackerDetailUseCase(mongoAdminTrackersRepository, mapper),
      listReports: new ListAdminTrackerReportsUseCase(mongoAdminTrackersRepository),
      updateReport: new UpdateAdminTrackerReportUseCase(mongoAdminTrackersRepository),
      updateLifecycle,
      reviews: {
        list: new ListAdminTrackerReviewsUseCase(mongoAdminTrackerReviewsRepository, mapper),
        addConsensus: new AddAdminTrackerReviewConsensusUseCase(
          mongoAdminTrackerReviewsRepository,
          mapper
        ),
        resolve: new ResolveAdminTrackerReviewUseCase(
          mongoAdminTrackerReviewsRepository,
          mapper
        ),
      },
    },
  };
};
