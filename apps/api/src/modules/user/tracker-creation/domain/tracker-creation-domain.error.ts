export class TrackerCreationDomainError extends Error {
  readonly code: string;
  readonly isOperational = true;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'TrackerCreationDomainError';
    this.code = code;
  }
}
