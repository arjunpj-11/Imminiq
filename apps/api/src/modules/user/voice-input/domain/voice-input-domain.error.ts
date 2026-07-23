export class VoiceInputDomainError extends Error {
  readonly code: string;
  readonly isOperational = true;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'VoiceInputDomainError';
    this.code = code;
    Error.captureStackTrace?.(this, VoiceInputDomainError);
  }
}
