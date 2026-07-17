import type { ErrorKind } from '../../../../shared/errors/error-kind';
import { SupportTicketsDomainError } from '../domain/support-tickets-domain.error';

export class SupportTicketsApplicationError extends SupportTicketsDomainError {
  readonly kind: ErrorKind;

  private constructor(kind: ErrorKind, code: string, message: string) {
    super(code, message);
    this.name = 'SupportTicketsApplicationError';
    this.kind = kind;
  }

  static creationFailed(): SupportTicketsApplicationError {
    return new SupportTicketsApplicationError(
      'internal',
      'SUPPORT_TICKET_CREATION_FAILED',
      'We could not create your support ticket. Please try again.'
    );
  }
}
