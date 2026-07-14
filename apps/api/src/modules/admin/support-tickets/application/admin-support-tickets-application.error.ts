export class AdminSupportTicketsApplicationError extends Error {
  readonly statusCode: number;
  readonly code: string;

  private constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }

  static notFound() {
    return new AdminSupportTicketsApplicationError(
      404,
      'SUPPORT_TICKET_NOT_FOUND',
      'Support ticket not found'
    );
  }
}
