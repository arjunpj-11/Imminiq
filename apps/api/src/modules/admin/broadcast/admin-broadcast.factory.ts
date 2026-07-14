import { AdminBroadcastsUseCase } from './application/use-cases/admin-broadcasts.usecase';
import { mongoAdminBroadcastRepository } from './infrastructure/repositories/mongo-admin-broadcast.repository';
export const createAdminBroadcastComposition = () => ({
  useCase: new AdminBroadcastsUseCase(mongoAdminBroadcastRepository),
});
