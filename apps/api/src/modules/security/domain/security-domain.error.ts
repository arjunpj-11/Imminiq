export class SecurityDomainError extends Error {
  readonly code: string;
  readonly isOperational = true;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'SecurityDomainError';
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
