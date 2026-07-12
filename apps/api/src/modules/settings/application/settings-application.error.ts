import { SettingsDomainError } from '../domain/settings-domain.error'

export type SettingsApplicationErrorCode = 'SETTINGS_NOT_FOUND'

export class SettingsApplicationError extends SettingsDomainError {
  readonly statusCode: number

  private constructor(
    statusCode: number,
    code: SettingsApplicationErrorCode,
    message: string,
  ) {
    super(code, message)
    this.name = 'SettingsApplicationError'
    this.statusCode = statusCode
  }

  static notFound(): SettingsApplicationError {
    return new SettingsApplicationError(
      404,
      'SETTINGS_NOT_FOUND',
      'Settings not found',
    )
  }
}

export const isSettingsApplicationError = (
  error: unknown,
): error is SettingsApplicationError => error instanceof SettingsApplicationError
