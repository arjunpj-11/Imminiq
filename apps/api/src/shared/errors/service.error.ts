import type { ErrorKind } from './error-kind';

/**
 * Transport-independent failure raised by an outbound adapter or shared service.
 * Delivery layers decide how the semantic kind is represented (HTTP, jobs, CLI, etc.).
 */
export class ServiceError extends Error {
  constructor(
    readonly kind: ErrorKind,
    readonly code: string,
    message: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'ServiceError';
  }

  static invalidInput(code: string, message: string): ServiceError {
    return new ServiceError('invalid-input', code, message);
  }

  static dependencyFailure(code: string, message: string, cause?: unknown): ServiceError {
    return new ServiceError('dependency-failure', code, message, { cause });
  }

  static dependencyUnavailable(code: string, message: string, cause?: unknown): ServiceError {
    return new ServiceError('dependency-unavailable', code, message, { cause });
  }
}

export const invalidServiceInput = (message: string, code: string): ServiceError =>
  ServiceError.invalidInput(code, message);

export const dependencyFailure = (message: string, code: string): ServiceError =>
  ServiceError.dependencyFailure(code, message);

export const dependencyUnavailable = (
  message: string,
  code: string,
  cause?: unknown
): ServiceError => ServiceError.dependencyUnavailable(code, message, cause);

