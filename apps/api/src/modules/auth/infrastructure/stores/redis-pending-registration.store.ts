import { pendingRegistrationCache } from '../../../../infrastructure/cache/pending-registration.cache'
import type {
  IPendingRegistrationStore,
  PendingRegistration,
} from '../../domain/services/pending-registration-store.interface'

export class RedisPendingRegistrationStore
  implements IPendingRegistrationStore {
  async save(
    identifier: string,
    registration: PendingRegistration,
    ttlSeconds: number
  ): Promise<void> {
    await pendingRegistrationCache.save(
      identifier,
      JSON.stringify(registration),
      ttlSeconds
    )
  }

  async get(identifier: string): Promise<PendingRegistration | null> {
    const serializedRegistration = await pendingRegistrationCache.get(identifier)

    if (!serializedRegistration) return null

    try {
      const registration: unknown = JSON.parse(serializedRegistration)

      if (this.isPendingRegistration(registration)) {
        return registration
      }
    } catch {
      // Corrupt cache entries are treated as expired pending registrations.
    }

    await pendingRegistrationCache.delete(identifier)
    return null
  }

  exists(identifier: string): Promise<boolean> {
    return pendingRegistrationCache.exists(identifier)
  }

  delete(identifier: string): Promise<void> {
    return pendingRegistrationCache.delete(identifier)
  }

  private isPendingRegistration(value: unknown): value is PendingRegistration {
    if (!value || typeof value !== 'object') return false

    const registration = value as Record<string, unknown>
    const hasEmail = typeof registration.email === 'string'
    const hasPhone = typeof registration.phone === 'string'

    return (
      typeof registration.fullName === 'string' &&
      typeof registration.passwordHash === 'string' &&
      hasEmail !== hasPhone
    )
  }
}

export const redisPendingRegistrationStore =
  new RedisPendingRegistrationStore()
