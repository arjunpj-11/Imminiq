export class UsersDomainError extends Error {
  readonly code: string;
  readonly isOperational = true;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'UsersDomainError';
    this.code = code;

    const errorWithCapture = Error as typeof Error & {
      captureStackTrace?: (target: object, constructor?: typeof UsersDomainError) => void;
    };

    errorWithCapture.captureStackTrace?.(this, UsersDomainError);
  }
}
