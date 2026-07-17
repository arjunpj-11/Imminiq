import type { ErrorKind } from '../../../../shared/errors/error-kind';
export class AdminBroadcastApplicationError extends Error {
  readonly kind: ErrorKind;
  readonly code: string;

  private constructor(kind: ErrorKind, code: string, message: string) {
    super(message);
    this.name = 'AdminBroadcastApplicationError';
    this.kind = kind;
    this.code = code;
  }

  static disabled() {
    return new AdminBroadcastApplicationError(
      'conflict',
      'BROADCASTS_DISABLED',
      'Broadcasts are disabled in admin settings'
    );
  }
}
