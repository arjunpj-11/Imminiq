import { redis } from '../../config/redis';
import { sha256RefreshTokenHasher } from '../security/sha256-refresh-token-hasher';

const RETIRED_REFRESH_PREFIX = 'retired-refresh-token';

export type RetiredRefreshTokenRecord = {
  userId: string;
  sessionId: string;
};

const keyForHash = (refreshTokenHash: string) => {
  return `${RETIRED_REFRESH_PREFIX}:${refreshTokenHash}`;
};

const secondsUntil = (expiresAt: Date) => {
  const ttlMs = expiresAt.getTime() - Date.now();
  return Math.max(1, Math.ceil(ttlMs / 1000));
};

export const retiredRefreshTokenCache = {
  async retire(data: {
    refreshTokenHash: string;
    userId: string;
    sessionId: string;
    expiresAt: Date;
  }): Promise<void> {
    await redis.set(
      keyForHash(data.refreshTokenHash),
      JSON.stringify({
        userId: data.userId,
        sessionId: data.sessionId,
      }),
      'EX',
      secondsUntil(data.expiresAt)
    );
  },

  async findByRawToken(rawRefreshToken: string): Promise<RetiredRefreshTokenRecord | null> {
    const refreshTokenHash = sha256RefreshTokenHasher.hash(rawRefreshToken);
    const serialized = await redis.get(keyForHash(refreshTokenHash));

    if (!serialized) {
      return null;
    }

    try {
      const parsed = JSON.parse(serialized) as RetiredRefreshTokenRecord;

      if (!parsed.userId || !parsed.sessionId) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  },
};
