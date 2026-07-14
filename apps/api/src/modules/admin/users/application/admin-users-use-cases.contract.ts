import type { IListAdminUsersUseCase } from './use-cases/list-admin-users.usecase';
import type { IGetAdminUserDetailUseCase } from './use-cases/get-admin-user-detail.usecase';
import type { ISetAdminUserStatusUseCase } from './use-cases/set-admin-user-status.usecase';

export type AdminUsersUseCases = {
  list: IListAdminUsersUseCase;
  getDetail: IGetAdminUserDetailUseCase;
  setStatus: ISetAdminUserStatusUseCase;
};
