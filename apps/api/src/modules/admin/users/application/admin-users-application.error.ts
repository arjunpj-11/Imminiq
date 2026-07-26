import type { ErrorKind } from '../../../../shared/errors/error-kind';
import { AdminUsersDomainError } from '../domain/admin-users-domain.error';

export type AdminUsersApplicationErrorCode =
  'USER_NOT_FOUND' | 'SELF_STATUS_CHANGE' | 'PROTECTED_ADMIN' | 'APPEAL_CONFLICT';

export class AdminUsersApplicationError extends AdminUsersDomainError {
  readonly kind: ErrorKind;
  private constructor(kind: ErrorKind, code: AdminUsersApplicationErrorCode, message: string) {
    super(code, message);
    this.kind = kind;
    this.name = 'AdminUsersApplicationError';
  }
  static userNotFound() {
    return new AdminUsersApplicationError('missing-resource', 'USER_NOT_FOUND', 'User not found');
  }
  static selfStatusChange() {
    return new AdminUsersApplicationError(
      'invalid-input',
      'SELF_STATUS_CHANGE',
      'You cannot change your own status'
    );
  }
  static protectedAdmin(message: string) {
    return new AdminUsersApplicationError('forbidden', 'PROTECTED_ADMIN', message);
  }
  static appealConflict() {
    return new AdminUsersApplicationError(
      'conflict',
      'APPEAL_CONFLICT',
      'Appeal was not found, already resolved, or is owned by another administrator'
    );
  }
}
