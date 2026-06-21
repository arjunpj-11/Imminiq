import { SettingsDomainError } from '../../domain/errors/settings-domain.error'
import type { MongoDuplicateKeyError } from './mongo-settings.types'

export type ErrorMapper = (error: unknown) => SettingsDomainError | null

export class MongoSettingsErrorMapper {
  static mapDuplicateSettingsRecordError(
    error: unknown,
  ): SettingsDomainError | null {
    if (!MongoSettingsErrorMapper.isDuplicateKeyError(error)) {
      return null
    }

    const keyPattern = MongoSettingsErrorMapper.getKeyPattern(error)

    if (MongoSettingsErrorMapper.hasKey(keyPattern, 'userId')) {
      return new SettingsDomainError(
        'SETTINGS_ALREADY_EXISTS',
        'Settings already exist for this user',
      )
    }

    return new SettingsDomainError(
      'DUPLICATE_SETTINGS_RECORD',
      'Duplicate settings record',
    )
  }

  private static isDuplicateKeyError(
    error: unknown,
  ): error is MongoDuplicateKeyError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as MongoDuplicateKeyError).code === 11000
    )
  }

  private static getKeyPattern(
    error: MongoDuplicateKeyError,
  ): Record<string, unknown> {
    return error.keyPattern && typeof error.keyPattern === 'object'
      ? error.keyPattern
      : {}
  }

  private static hasKey(
    keyPattern: Record<string, unknown>,
    key: string,
  ): boolean {
    return Object.prototype.hasOwnProperty.call(keyPattern, key)
  }
}