import type { IListAdminBroadcastsUseCase } from './use-cases/list-admin-broadcasts.usecase';
import type { ISendAdminBroadcastUseCase } from './use-cases/send-admin-broadcast.usecase';

export type AdminBroadcastUseCases = {
  list: IListAdminBroadcastsUseCase;
  send: ISendAdminBroadcastUseCase;
};
