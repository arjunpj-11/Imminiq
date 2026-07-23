export class CallDomainError extends Error {
  readonly code: string;
  readonly isOperational = true;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'CallDomainError';
    this.code = code;
    Error.captureStackTrace?.(this, CallDomainError);
  }
}
