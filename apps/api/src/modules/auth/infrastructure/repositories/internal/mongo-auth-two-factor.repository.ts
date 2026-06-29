import { TwoFactorAuth } from '../../../../../infrastructure/database/models/two-factor-auth.model'
import { MongoAuthBaseRepository } from '../shared/mongo-auth-base.repository'
import { MongoAuthMapper } from '../shared/mongo-auth.mapper'
import type { MongoTwoFactorAuthRecord } from '../shared/mongo-auth.types'

export class MongoAuthTwoFactorRepository extends MongoAuthBaseRepository {
  constructor(private readonly mapper = new MongoAuthMapper()) {
    super()
  }

  async hasActiveTwoFactor(userId: string) {
    return this.execute(
      'AUTH_TWO_FACTOR_READ_FAILED',
      'Failed to check active two-factor auth',
      async () =>
        Boolean(
          await TwoFactorAuth.exists({
            userId,
            status: 'active',
            deletedAt: null,
          }),
        ),
    )
  }

  async findActiveTwoFactorForLogin(userId: string) {
    return this.execute(
      'AUTH_TWO_FACTOR_READ_FAILED',
      'Failed to read active two-factor auth',
      async () => {
        const twoFactor = await TwoFactorAuth.findOne({
          userId,
          status: 'active',
          deletedAt: null,
        })
          .select('+totpSecretEncrypted +backupCodes +backupCodes.codeHash')
          .lean<MongoTwoFactorAuthRecord>()

        return this.mapper.toTwoFactorAuthEntity(twoFactor)
      },
    )
  }

  async touchTwoFactorLastUsed(userId: string) {
    return this.execute(
      'AUTH_TWO_FACTOR_WRITE_FAILED',
      'Failed to update two-factor last used time',
      async () => {
        const twoFactor = await TwoFactorAuth.findOneAndUpdate(
          {
            userId,
            status: 'active',
            deletedAt: null,
          },
          {
            $set: {
              lastUsedAt: new Date(),
            },
          },
          {
            returnDocument: 'after',
          },
        ).lean<MongoTwoFactorAuthRecord>()

        return this.mapper.toTwoFactorAuthEntity(twoFactor)
      },
    )
  }

  async markBackupCodeUsed(userId: string, backupCodeIndex: number) {
    return this.execute(
      'AUTH_TWO_FACTOR_WRITE_FAILED',
      'Failed to mark backup code used',
      async () => {
        const usedAtPath = `backupCodes.${backupCodeIndex}.usedAt`

        const twoFactor = await TwoFactorAuth.findOneAndUpdate(
          {
            userId,
            status: 'active',
            deletedAt: null,
            [usedAtPath]: null,
          },
          {
            $set: {
              [usedAtPath]: new Date(),
              lastUsedAt: new Date(),
            },
            $inc: {
              backupCodesUsed: 1,
            },
          },
          {
            returnDocument: 'after',
          },
        ).lean<MongoTwoFactorAuthRecord>()

        return this.mapper.toTwoFactorAuthEntity(twoFactor)
      },
    )
  }
}

export const mongoAuthTwoFactorRepository =
  new MongoAuthTwoFactorRepository()
