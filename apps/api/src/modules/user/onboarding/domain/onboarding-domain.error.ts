export class OnboardingDomainError extends Error {
  readonly code: string;
  readonly isOperational = true;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'OnboardingDomainError';
    this.code = code;
  }
}
