import type { AdminUsersUseCases } from './application/admin-users-use-cases.contract';
import { AdminUsersMapper } from './application/admin-users.mapper';
import { GetAdminUserDetailUseCase } from './application/use-cases/get-admin-user-detail.usecase';
import { ListAdminUsersUseCase } from './application/use-cases/list-admin-users.usecase';
import { SetAdminUserStatusUseCase } from './application/use-cases/set-admin-user-status.usecase';
import { mongoAdminUsersRepository } from './infrastructure/repositories/mongo-admin-users.repository';
import { queuedAdminUserEmailProvider } from './infrastructure/providers/queued-admin-user-email.provider';
import { SendAdminUserMessageUseCase } from './application/use-cases/send-admin-user-message.usecase';
import { ListAdminUserAppealsUseCase } from './application/use-cases/list-admin-user-appeals.usecase';
import { UpdateAdminUserAppealUseCase } from './application/use-cases/update-admin-user-appeal.usecase';
import { RevokeAdminUserSessionUseCase } from './application/use-cases/revoke-admin-user-session.usecase';
import { UpdateAdminUserRoleUseCase } from './application/use-cases/update-admin-user-role.usecase';

export type AdminUsersComposition = { useCases: AdminUsersUseCases };
export const createAdminUsersComposition = (): AdminUsersComposition => {
  const mapper = new AdminUsersMapper();
  return {
    useCases: {
      list: new ListAdminUsersUseCase(mongoAdminUsersRepository, mapper),
      getDetail: new GetAdminUserDetailUseCase(mongoAdminUsersRepository, mapper),
      setStatus: new SetAdminUserStatusUseCase(
        mongoAdminUsersRepository,
        queuedAdminUserEmailProvider
      ),
      sendMessage: new SendAdminUserMessageUseCase(
        mongoAdminUsersRepository,
        queuedAdminUserEmailProvider
      ),
      listAppeals: new ListAdminUserAppealsUseCase(mongoAdminUsersRepository),
      updateAppeal: new UpdateAdminUserAppealUseCase(
        mongoAdminUsersRepository,
        queuedAdminUserEmailProvider
      ),
      revokeSession: new RevokeAdminUserSessionUseCase(mongoAdminUsersRepository),
      updateRole: new UpdateAdminUserRoleUseCase(mongoAdminUsersRepository, mapper),
    },
  };
};
