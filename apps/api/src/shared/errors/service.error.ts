import type { ErrorKind } from './error-kind';

type ServiceErrorOptions = ErrorOptions & {
  publicMessage?: string;
  data?: Record<string, unknown>;
};

/**
 * Transport-independent failure raised by an outbound adapter or shared service.
 * Delivery layers decide how the semantic kind is represented (HTTP, jobs, CLI, etc.).
 */
export class ServiceError extends Error {
  readonly publicMessage?: string;
  readonly data?: Record<string, unknown>;

  constructor(
    readonly kind: ErrorKind,
    readonly code: string,
    message: string,
    options?: ServiceErrorOptions
  ) {
    super(message, options);
    this.name = 'ServiceError';
    this.publicMessage = options?.publicMessage;
    this.data = options?.data;
  }

  static invalidInput(code: string, message: string): ServiceError {
    return new ServiceError('invalid-input', code, message);
  }

  static dependencyFailure(
    code: string,
    message: string,
    cause?: unknown,
    publicMessage?: string
  ): ServiceError {
    return new ServiceError('dependency-failure', code, message, { cause, publicMessage });
  }

  static dependencyUnavailable(
    code: string,
    message: string,
    cause?: unknown,
    publicMessage?: string
  ): ServiceError {
    return new ServiceError('dependency-unavailable', code, message, { cause, publicMessage });
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
