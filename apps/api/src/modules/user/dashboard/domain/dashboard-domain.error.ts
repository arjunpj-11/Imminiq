export class DashboardDomainError extends Error {
  readonly code: string;
  readonly isOperational = true;

  constructor(code: string, message: string) {
    super(message);

    this.name = 'DashboardDomainError';
    this.code = code;

    const errorWithCapture = Error as typeof Error & {
      captureStackTrace?: (target: object, constructor?: typeof DashboardDomainError) => void;
    };

    errorWithCapture.captureStackTrace?.(this, DashboardDomainError);
  }
}
