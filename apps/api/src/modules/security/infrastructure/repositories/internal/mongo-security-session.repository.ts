import { AuthToken } from '../../../../../infrastructure/database/models/auth-token.model'
import type { RevokeSecuritySessionInput } from '../../../domain/repositories/security-session.repository.interface'
import { MongoSecurityBaseRepository } from '../shared/mongo-security-base.repository'
import { MongoSecurityMapper } from '../shared/mongo-security.mapper'
import type { MongoSecuritySessionRecord } from '../shared/mongo-security.types'

export class MongoSecuritySessionRepository extends MongoSecurityBaseRepository {
  constructor(private readonly _mapper = new MongoSecurityMapper()) {
    super()
  }

  async findActiveSessions(userId: string) {
    return this.execute(
      'SESSION_LOOKUP_FAILED',
      'Failed to read active security sessions',
      async () => {
        const sessions = await AuthToken.find({
          userId,
          revokedAt: null,
          expiresAt: {
            $gt: new Date(),
          },
          deletedAt: null,
        })
          .sort({
            updatedAt: -1,
          })
          .lean<MongoSecuritySessionRecord[]>()

        return sessions.map((session) =>
          this._mapper.toSecuritySessionEntity(session),
        )
      },
    )
  }

  async findCurrentSessionByRefreshTokenHash(refreshTokenHash: string) {
    return this.execute(
      'CURRENT_SESSION_LOOKUP_FAILED',
      'Failed to read current refresh token session',
      async () => {
        const session = await AuthToken.findOne({
          refreshTokenHash,
          revokedAt: null,
          expiresAt: {
            $gt: new Date(),
          },
          deletedAt: null,
        }).lean<MongoSecuritySessionRecord>()

        return session ? this._mapper.toSecuritySessionEntity(session) : null
      },
    )
  }

  async revokeSessionById(input: RevokeSecuritySessionInput) {
    return this.execute(
      'SESSION_REVOKE_FAILED',
      'Failed to revoke security session',
      async () => {
        const session = await AuthToken.findOneAndUpdate(
          {
            _id: input.sessionId,
            userId: input.userId,
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
          },
        ).lean<MongoSecuritySessionRecord>()

        return session ? this._mapper.toSecuritySessionEntity(session) : null
      },
    )
  }

  async revokeAllSessions(userId: string): Promise<void> {
    await this.execute(
      'SESSIONS_REVOKE_FAILED',
      'Failed to revoke all security sessions',
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
          },
        )
      },
    )
  }
}

export const mongoSecuritySessionRepository =
  new MongoSecuritySessionRepository()
