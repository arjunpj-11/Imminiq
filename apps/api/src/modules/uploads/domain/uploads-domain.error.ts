export class UploadsDomainError extends Error {
  readonly code: string;
  readonly isOperational = true;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'UploadsDomainError';
    this.code = code;

    if ('captureStackTrace' in Error) {
      const errorWithCapture = Error as typeof Error & {
        captureStackTrace: (target: object, constructor?: typeof UploadsDomainError) => void;
      };

      errorWithCapture.captureStackTrace(this, UploadsDomainError);
    }
  }
}
