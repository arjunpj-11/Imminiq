export class FriendsDomainError extends Error {
  readonly code: string;
  readonly isOperational = true;

  constructor(code: string, message: string) {
    super(message);
    this.name = "FriendsDomainError";
    this.code = code;

    const errorConstructor = Error as ErrorConstructor & {
      captureStackTrace?: (target: object) => void;
    };

    errorConstructor.captureStackTrace?.(this);
  }
}
