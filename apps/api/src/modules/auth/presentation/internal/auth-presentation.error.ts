import type { ErrorKind } from '../../../../shared/errors/error-kind';

export class AuthPresentationError extends Error {
  readonly kind: ErrorKind = 'unauthenticated';

  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'AuthPresentationError';
  }
}
