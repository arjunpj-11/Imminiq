import { OnboardingDomainError } from '../../domain/errors/onboarding-domain.error'
import type { ErrorMapper } from './mongo-onboarding-error.mapper'

export abstract class MongoOnboardingBaseRepository {
  protected async execute<T>(
    code: string,
    message: string,
    operation: () => Promise<T>,
    mapError?: ErrorMapper,
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof OnboardingDomainError) {
        throw error
      }

      const mappedError = mapError?.(error)

      if (mappedError) {
        throw mappedError
      }

      throw new OnboardingDomainError(code, message)
    }
  }
}