import type { AdminBroadcastUseCases } from './application/admin-broadcast-use-cases.contract';
import { ListAdminBroadcastsUseCase } from './application/use-cases/list-admin-broadcasts.usecase';
import { SendAdminBroadcastUseCase } from './application/use-cases/send-admin-broadcast.usecase';
import { mongoAdminBroadcastRepository } from './infrastructure/repositories/mongo-admin-broadcast.repository';
export type AdminBroadcastComposition = { useCases: AdminBroadcastUseCases };

export const createAdminBroadcastComposition = (): AdminBroadcastComposition => ({
  useCases: {
    list: new ListAdminBroadcastsUseCase(mongoAdminBroadcastRepository),
    send: new SendAdminBroadcastUseCase(mongoAdminBroadcastRepository),
  },
});
