type StackTraceConstructor = new (code: string, message: string) => Error;

export class SettingsDomainError extends Error {
  readonly code: string;
  readonly isOperational = true;

  constructor(code: string, message: string) {
    super(message);

    this.name = 'SettingsDomainError';
    this.code = code;

    const stackTraceError = Error as ErrorConstructor & {
      captureStackTrace?: (targetObject: object, constructorOpt?: StackTraceConstructor) => void;
    };

    stackTraceError.captureStackTrace?.(this, SettingsDomainError);
  }
}
