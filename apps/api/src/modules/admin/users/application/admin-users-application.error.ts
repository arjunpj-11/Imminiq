import { AdminUsersDomainError } from '../domain/admin-users-domain.error';

export type AdminUsersApplicationErrorCode =
  'USER_NOT_FOUND' | 'SELF_STATUS_CHANGE' | 'PROTECTED_ADMIN' | 'APPEAL_CONFLICT';

export class AdminUsersApplicationError extends AdminUsersDomainError {
  readonly statusCode: number;
  private constructor(statusCode: number, code: AdminUsersApplicationErrorCode, message: string) {
    super(code, message);
    this.statusCode = statusCode;
    this.name = 'AdminUsersApplicationError';
  }
  static userNotFound() {
    return new AdminUsersApplicationError(404, 'USER_NOT_FOUND', 'User not found');
  }
  static selfStatusChange() {
    return new AdminUsersApplicationError(
      400,
      'SELF_STATUS_CHANGE',
      'You cannot change your own status'
    );
  }
  static protectedAdmin(message: string) {
    return new AdminUsersApplicationError(403, 'PROTECTED_ADMIN', message);
  }
  static appealConflict() {
    return new AdminUsersApplicationError(
      409,
      'APPEAL_CONFLICT',
      'Appeal was not found, already resolved, or is owned by another administrator'
    );
  }
}
