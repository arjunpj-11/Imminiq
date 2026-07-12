import { redis } from '../../config/redis'

const PENDING_REGISTRATION_PREFIX = 'pending-registration'

const keyFor = (identifier: string) => {
  return `${PENDING_REGISTRATION_PREFIX}:${identifier.trim().toLowerCase()}`
}

export const pendingRegistrationCache = {
  async save(
    identifier: string,
    serializedRegistration: string,
    ttlSeconds: number
  ): Promise<void> {
    await redis.set(
      keyFor(identifier),
      serializedRegistration,
      'EX',
      ttlSeconds
    )
  },

  async get(identifier: string): Promise<string | null> {
    return redis.get(keyFor(identifier))
  },

  async exists(identifier: string): Promise<boolean> {
    return (await redis.exists(keyFor(identifier))) === 1
  },

  async delete(identifier: string): Promise<void> {
    await redis.del(keyFor(identifier))
  },
}
