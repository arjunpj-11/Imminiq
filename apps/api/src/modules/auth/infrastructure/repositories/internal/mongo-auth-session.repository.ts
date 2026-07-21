import { AuthToken } from '../../../../../infrastructure/database/models/auth-token.model';
import type {
  RotateAuthSessionInput,
  SaveAuthSessionInput,
} from '../../../domain/repositories/auth-session.repository.interface';
import { MongoAuthBaseRepository } from '../shared/mongo-auth-base.repository';
import { MongoAuthMapper } from '../shared/mongo-auth.mapper';
import type { MongoAuthSessionRecord } from '../shared/mongo-auth.types';
import { env } from '../../../../../config/env';

export class MongoAuthSessionRepository extends MongoAuthBaseRepository {
  constructor(private readonly _mapper = new MongoAuthMapper()) {
    super();
  }

  async saveSession(data: SaveAuthSessionInput) {
    return this.execute('AUTH_SESSION_WRITE_FAILED', 'Failed to save auth session', async () => {
      const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_MS);

      const session = await AuthToken.create({
        userId: data.userId,
        refreshTokenHash: data.refreshTokenHash,
        ...(data.device ? { device: data.device } : {}),
        ...(data.ipAddress ? { ipAddress: data.ipAddress } : {}),
        ...(data.userAgent ? { userAgent: data.userAgent } : {}),
        expiresAt,
      });

      return this._mapper.toAuthSessionEntityOrThrow(
        this._mapper.toPlainRecord<MongoAuthSessionRecord>(session)
      );
    });
  }

  async findSessionByRefreshTokenHash(refreshTokenHash: string) {
    return this.execute(
      'AUTH_SESSION_READ_FAILED',
      'Failed to read refresh token session',
      async () => {
        const session = await AuthToken.findOne({
          refreshTokenHash,
          expiresAt: {
            $gt: new Date(),
          },
          revokedAt: null,
          deletedAt: null,
        }).lean<MongoAuthSessionRecord>();

        return this._mapper.toAuthSessionEntity(session);
      }
    );
  }

  async rotateRefreshTokenInSameSession(data: RotateAuthSessionInput) {
    return this.execute(
      'AUTH_SESSION_WRITE_FAILED',
      'Failed to rotate refresh token session',
      async () => {
        const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_MS);
        const sessionMetaUpdate = {
          ...(data.meta?.device ? { device: data.meta.device } : {}),
          ...(data.meta?.ipAddress ? { ipAddress: data.meta.ipAddress } : {}),
          ...(data.meta?.userAgent ? { userAgent: data.meta.userAgent } : {}),
        };

        const session = await AuthToken.findOneAndUpdate(
          {
            _id: data.sessionId,
            refreshTokenHash: data.currentRefreshTokenHash,
            revokedAt: null,
            deletedAt: null,
          },
          {
            $set: {
              refreshTokenHash: data.newRefreshTokenHash,
              expiresAt,
              ...sessionMetaUpdate,
            },
          },
          {
            returnDocument: 'after',
          }
        ).lean<MongoAuthSessionRecord>();

        return this._mapper.toAuthSessionEntity(session);
      }
    );
  }

  async findAllUserSessions(userId: string) {
    return this.execute('AUTH_SESSION_READ_FAILED', 'Failed to read user sessions', async () => {
      const sessions = await AuthToken.find({
        userId,
        expiresAt: {
          $gt: new Date(),
        },
        revokedAt: null,
        deletedAt: null,
      })
        .sort({
          createdAt: -1,
        })
        .lean<MongoAuthSessionRecord[]>();

      return sessions.map((session) => this._mapper.toAuthSessionEntityOrThrow(session));
    });
  }

  async revokeSessionByRefreshTokenHash(refreshTokenHash: string) {
    return this.execute(
      'AUTH_SESSION_WRITE_FAILED',
      'Failed to revoke refresh token session',
      async () => {
        const session = await AuthToken.findOneAndUpdate(
          {
            refreshTokenHash,
            revokedAt: null,
            deletedAt: null,
          },
          {
            $set: {
              revokedAt: new Date(),
            },
          },
          {
            returnDocument: 'after',
          }
        ).lean<MongoAuthSessionRecord>();

        return Boolean(session);
      }
    );
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.execute(
      'AUTH_SESSION_WRITE_FAILED',
      'Failed to revoke all user sessions',
      async () => {
        await AuthToken.updateMany(
          {
            userId,
            revokedAt: null,
            deletedAt: null,
          },
          {
            $set: {
              revokedAt: new Date(),
            },
          }
        );
      }
    );
  }

  async revokeSessionById(sessionId: string, userId: string) {
    return this.execute('AUTH_SESSION_WRITE_FAILED', 'Failed to revoke session', async () => {
      const session = await AuthToken.findOneAndUpdate(
        {
          _id: sessionId,
          userId,
          revokedAt: null,
          deletedAt: null,
        },
        {
          $set: {
            revokedAt: new Date(),
          },
        },
        {
          returnDocument: 'after',
        }
      ).lean<MongoAuthSessionRecord>();

      return this._mapper.toAuthSessionEntity(session);
    });
  }
}

export const mongoAuthSessionRepository = new MongoAuthSessionRepository();
