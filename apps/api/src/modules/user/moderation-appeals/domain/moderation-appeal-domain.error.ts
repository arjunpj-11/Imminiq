export class ModerationAppealDomainError extends Error {
  readonly code: string;
  readonly isOperational = true;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'ModerationAppealDomainError';
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
