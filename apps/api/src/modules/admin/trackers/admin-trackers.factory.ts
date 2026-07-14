import { DeleteAdminTrackerUseCase } from './application/use-cases/delete-admin-tracker.usecase';
import { GetAdminTrackerDetailUseCase } from './application/use-cases/get-admin-tracker-detail.usecase';
import { LikeAdminPublishedTrackerUseCase } from './application/use-cases/like-admin-published-tracker.usecase';
import { ListAdminPublishedTrackersUseCase } from './application/use-cases/list-admin-published-trackers.usecase';
import { ListAdminTrackersUseCase } from './application/use-cases/list-admin-trackers.usecase';
import { RateAdminPublishedTrackerUseCase } from './application/use-cases/rate-admin-published-tracker.usecase';
import { mongoAdminTrackersRepository } from './infrastructure/repositories/mongo-admin-trackers.repository';
import { nodemailerAdminTrackerEmailProvider } from './infrastructure/providers/nodemailer-admin-tracker-email.provider';
export type AdminTrackersComposition = { useCases: AdminTrackersUseCases };

export const createAdminTrackersComposition = (): AdminTrackersComposition => ({
  useCases: {
    list: new ListAdminTrackersUseCase(mongoAdminTrackersRepository),
    listPublished: new ListAdminPublishedTrackersUseCase(mongoAdminTrackersRepository),
    likePublished: new LikeAdminPublishedTrackerUseCase(mongoAdminTrackersRepository),
    ratePublished: new RateAdminPublishedTrackerUseCase(mongoAdminTrackersRepository),
    getDetail: new GetAdminTrackerDetailUseCase(mongoAdminTrackersRepository),
    delete: new DeleteAdminTrackerUseCase(
      mongoAdminTrackersRepository,
      nodemailerAdminTrackerEmailProvider
    ),
  },
});
import type { AdminTrackersUseCases } from './application/admin-trackers-use-cases.contract';
