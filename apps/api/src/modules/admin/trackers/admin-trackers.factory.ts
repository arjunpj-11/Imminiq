import { AdminTrackersUseCase } from './application/use-cases/admin-trackers.usecase';
import { mongoAdminTrackersRepository } from './infrastructure/repositories/mongo-admin-trackers.repository';
import { nodemailerAdminTrackerEmailProvider } from './infrastructure/providers/nodemailer-admin-tracker-email.provider';
export const createAdminTrackersComposition = () => ({
  useCase: new AdminTrackersUseCase(
    mongoAdminTrackersRepository,
    nodemailerAdminTrackerEmailProvider
  ),
});
