import { retiredRefreshTokenCache } from '../../../../infrastructure/cache/retired-refresh-token.cache';
import type {
  RetiredRefreshTokenRecord,
  IRetiredRefreshTokenStore,
} from '../../domain/services/retired-refresh-token-store.interface';

export class RedisRetiredRefreshTokenStore implements IRetiredRefreshTokenStore {
  async findByRawToken(refreshToken: string): Promise<RetiredRefreshTokenRecord | null> {
    return retiredRefreshTokenCache.findByRawToken(refreshToken);
  }

  async retire(data: {
    refreshTokenHash: string;
    userId: string;
    sessionId: string;
    expiresAt: Date;
  }): Promise<void> {
    await retiredRefreshTokenCache.retire(data);
  }
}

export const redisRetiredRefreshTokenStore = new RedisRetiredRefreshTokenStore();
