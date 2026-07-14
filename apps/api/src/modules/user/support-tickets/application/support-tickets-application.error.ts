import { SupportTicketsDomainError } from '../domain/support-tickets-domain.error';

export class SupportTicketsApplicationError extends SupportTicketsDomainError {
  readonly statusCode: number;

  private constructor(statusCode: number, code: string, message: string) {
    super(code, message);
    this.name = 'SupportTicketsApplicationError';
    this.statusCode = statusCode;
  }

  static creationFailed(): SupportTicketsApplicationError {
    return new SupportTicketsApplicationError(
      500,
      'SUPPORT_TICKET_CREATION_FAILED',
      'We could not create your support ticket. Please try again.'
    );
  }
}
