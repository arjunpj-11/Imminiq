import { SettingsDomainError } from '../../domain/errors/settings-domain.error'
import type { ErrorMapper } from './mongo-settings-error.mapper'

export abstract class MongoSettingsBaseRepository {
  protected async execute<T>(
    code: string,
    message: string,
    operation: () => Promise<T>,
    mapError?: ErrorMapper,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof SettingsDomainError) {
        throw error
      }

      const mappedError = mapError?.(error)

      if (mappedError) {
        throw mappedError
      }

      throw new SettingsDomainError(code, message)
    }
  }
}