import type { ErrorKind } from '../../../../shared/errors/error-kind';
export class AdminSupportTicketsApplicationError extends Error {
  readonly kind: ErrorKind;
  readonly code: string;

  private constructor(kind: ErrorKind, code: string, message: string) {
    super(message);
    this.kind = kind;
    this.code = code;
  }

  static notFound() {
    return new AdminSupportTicketsApplicationError(
      'missing-resource',
      'SUPPORT_TICKET_NOT_FOUND',
      'Support ticket not found'
    );
  }
}
