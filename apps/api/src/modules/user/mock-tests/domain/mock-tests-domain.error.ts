export class MockTestsDomainError extends Error {
  readonly code: string;
  readonly isOperational = true;
  readonly publicMessage: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'MockTestsDomainError';
    this.code = code;
    this.publicMessage = message;

    const errorWithCapture = Error as typeof Error & {
      captureStackTrace?: (target: object) => void;
    };
    errorWithCapture.captureStackTrace?.(this);
  }
}
