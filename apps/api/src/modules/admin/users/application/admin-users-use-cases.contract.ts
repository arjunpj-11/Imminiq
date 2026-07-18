import type { IListAdminUsersUseCase } from './use-cases/list-admin-users.usecase';
import type { IGetAdminUserDetailUseCase } from './use-cases/get-admin-user-detail.usecase';
import type { ISetAdminUserStatusUseCase } from './use-cases/set-admin-user-status.usecase';
import type { ISendAdminUserMessageUseCase } from './use-cases/send-admin-user-message.usecase';
import type { IListAdminUserAppealsUseCase } from './use-cases/list-admin-user-appeals.usecase';
import type { IUpdateAdminUserAppealUseCase } from './use-cases/update-admin-user-appeal.usecase';
import type { IRevokeAdminUserSessionUseCase } from './use-cases/revoke-admin-user-session.usecase';
import type { IUpdateAdminUserRoleUseCase } from './use-cases/update-admin-user-role.usecase';
import type { ISetAdminActionPasswordUseCase } from './use-cases/set-admin-action-password.usecase';

export type AdminUsersUseCases = {
  notes: import('./admin-user-notes.service').IAdminUserNotesService;
  exports: import('../../../../shared/admin').IAdminExportService;
  privacyRequests: import('./admin-data-privacy-request.service').IAdminDataPrivacyRequestService;
  list: IListAdminUsersUseCase;
  getDetail: IGetAdminUserDetailUseCase;
  setStatus: ISetAdminUserStatusUseCase;
  sendMessage: ISendAdminUserMessageUseCase;
  listAppeals: IListAdminUserAppealsUseCase;
  updateAppeal: IUpdateAdminUserAppealUseCase;
  revokeSession: IRevokeAdminUserSessionUseCase;
  updateRole: IUpdateAdminUserRoleUseCase;
  setActionPassword: ISetAdminActionPasswordUseCase;
};
