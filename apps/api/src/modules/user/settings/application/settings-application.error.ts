import type { ErrorKind } from '../../../../shared/errors/error-kind';
import { SettingsDomainError } from '../domain/settings-domain.error';

export type SettingsApplicationErrorCode = 'SETTINGS_NOT_FOUND';

export class SettingsApplicationError extends SettingsDomainError {
  readonly kind: ErrorKind;

  private constructor(kind: ErrorKind, code: SettingsApplicationErrorCode, message: string) {
    super(code, message);
    this.name = 'SettingsApplicationError';
    this.kind = kind;
  }

  static notFound(): SettingsApplicationError {
    return new SettingsApplicationError('missing-resource', 'SETTINGS_NOT_FOUND', 'Settings not found');
  }
}

export const isSettingsApplicationError = (error: unknown): error is SettingsApplicationError =>
  error instanceof SettingsApplicationError;
