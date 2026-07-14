export class SupportTicketsDomainError extends Error {
  readonly code: string;
  readonly isOperational = true;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'SupportTicketsDomainError';
    this.code = code;
    Error.captureStackTrace?.(this, SupportTicketsDomainError);
  }
}
