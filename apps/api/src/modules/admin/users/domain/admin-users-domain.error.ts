export class AdminUsersDomainError extends Error {
  constructor(
    readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'AdminUsersDomainError';
  }
}
