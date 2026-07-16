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
export type AdminTrackersComposition = { useCases: AdminTrackersUseCases };

export const createAdminTrackersComposition = (): AdminTrackersComposition => {
  const mapper = new AdminTrackersMapper();
  return {
    useCases: {
      list: new ListAdminTrackersUseCase(mongoAdminTrackersRepository, mapper),
      listPublished: new ListAdminPublishedTrackersUseCase(mongoAdminTrackersRepository, mapper),
      likePublished: new LikeAdminPublishedTrackerUseCase(mongoAdminTrackersRepository, mapper),
      ratePublished: new RateAdminPublishedTrackerUseCase(mongoAdminTrackersRepository, mapper),
      getDetail: new GetAdminTrackerDetailUseCase(mongoAdminTrackersRepository, mapper),
      listReports: new ListAdminTrackerReportsUseCase(mongoAdminTrackersRepository),
      updateReport: new UpdateAdminTrackerReportUseCase(mongoAdminTrackersRepository),
      updateLifecycle: new UpdateAdminTrackerLifecycleUseCase(
        mongoAdminTrackersRepository,
        nodemailerAdminTrackerEmailProvider
      ),
    },
  };
};
import type { AdminTrackersUseCases } from './application/admin-trackers-use-cases.contract';
