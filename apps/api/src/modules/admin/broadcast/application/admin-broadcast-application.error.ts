export class AdminBroadcastApplicationError extends Error {
  readonly statusCode: number;
  readonly code: string;

  private constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'AdminBroadcastApplicationError';
    this.statusCode = statusCode;
    this.code = code;
  }

  static disabled() {
    return new AdminBroadcastApplicationError(
      409,
      'BROADCASTS_DISABLED',
      'Broadcasts are disabled in admin settings'
    );
  }
}
