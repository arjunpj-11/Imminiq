import { passwordResetSessionCache } from '../../../../infrastructure/cache/password-reset-session.cache'
import type { PasswordResetSessionStoreContract } from '../../domain/services/password-reset-session-store.interface'

export class RedisPasswordResetSessionStore
  implements PasswordResetSessionStoreContract {
  async save(jti: string, userId: string, ttlSeconds: number): Promise<void> {
    await passwordResetSessionCache.save(jti, userId, ttlSeconds)
  }

  async consume(jti: string): Promise<string | null> {
    return passwordResetSessionCache.consume(jti)
  }
}

export const redisPasswordResetSessionStore = new RedisPasswordResetSessionStore()
