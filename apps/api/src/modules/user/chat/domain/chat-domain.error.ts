export class ChatDomainError extends Error {
  readonly code: string;
  readonly isOperational = true;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ChatDomainError';
    this.code = code;
    Error.captureStackTrace?.(this, ChatDomainError);
  }
}
