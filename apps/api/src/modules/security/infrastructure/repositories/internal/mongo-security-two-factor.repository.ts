import { TwoFactorAuth } from '../../../../../infrastructure/database/models/two-factor-auth.model';
import type {
  ActivateTwoFactorInput,
  SavePendingTwoFactorSetupInput,
} from '../../../domain/repositories/security-two-factor.repository.interface';
import { MongoSecurityBaseRepository } from '../shared/mongo-security-base.repository';
import { MongoSecurityErrorMapper } from '../shared/mongo-security-error.mapper';
import { MongoSecurityMapper } from '../shared/mongo-security.mapper';
import type { MongoTwoFactorRecord } from '../shared/mongo-security.types';

export class MongoSecurityTwoFactorRepository extends MongoSecurityBaseRepository {
  constructor(private readonly _mapper = new MongoSecurityMapper()) {
    super();
  }

  async findTwoFactorByUserId(userId: string) {
    return this.execute('TWO_FACTOR_LOOKUP_FAILED', 'Failed to read two-factor auth', async () => {
      const twoFactor = await TwoFactorAuth.findOne({
        userId,
        deletedAt: null,
      }).lean<MongoTwoFactorRecord>();

      return this._mapper.toTwoFactorEntity(twoFactor);
    });
  }

  async findTwoFactorWithSecret(userId: string) {
    return this.execute(
      'TWO_FACTOR_LOOKUP_FAILED',
      'Failed to read two-factor auth with secret',
      async () => {
        const twoFactor = await TwoFactorAuth.findOne({
          userId,
          deletedAt: null,
        })
          .select('+totpSecretEncrypted')
          .lean<MongoTwoFactorRecord>();

        return this._mapper.toTwoFactorEntity(twoFactor);
      }
    );
  }

  async savePendingTwoFactorSetup(input: SavePendingTwoFactorSetupInput) {
    return this.execute(
      'TWO_FACTOR_SETUP_SAVE_FAILED',
      'Failed to save pending two-factor setup',
      async () => {
        const twoFactor = await TwoFactorAuth.findOneAndUpdate(
          {
            userId: input.userId,
            deletedAt: null,
          },
          {
            $set: {
              userId: input.userId,
              status: 'pending',
              totpSecretEncrypted: input.data.encryptedSecret,
              issuer: input.data.issuer,
              accountLabel: input.data.accountLabel,
              qrCodeUri: input.data.qrCodeUri,
              backupCodes: [],
            },
          },
          {
            upsert: true,
            returnDocument: 'after',
            setDefaultsOnInsert: true,
          }
        )
          .select('+totpSecretEncrypted')
          .lean<MongoTwoFactorRecord>();

        return this._mapper.toTwoFactorEntity(twoFactor);
      },
      MongoSecurityErrorMapper.mapDuplicateSecurityRecordError
    );
  }

  async activateTwoFactor(input: ActivateTwoFactorInput) {
    return this.execute(
      'TWO_FACTOR_ACTIVATE_FAILED',
      'Failed to activate two-factor auth',
      async () => {
        const twoFactor = await TwoFactorAuth.findOneAndUpdate(
          {
            userId: input.userId,
            status: 'pending',
            deletedAt: null,
          },
          {
            $set: {
              status: 'active',
              enabledAt: new Date(),
              backupCodes: input.backupCodes,
            },
          },
          {
            returnDocument: 'after',
          }
        )
          .select('+totpSecretEncrypted')
          .lean<MongoTwoFactorRecord>();

        return this._mapper.toTwoFactorEntity(twoFactor);
      }
    );
  }

  async disableTwoFactor(userId: string) {
    return this.execute(
      'TWO_FACTOR_DISABLE_FAILED',
      'Failed to disable two-factor auth',
      async () => {
        const twoFactor = await TwoFactorAuth.findOneAndUpdate(
          {
            userId,
            status: 'active',
            deletedAt: null,
          },
          {
            $set: {
              status: 'disabled',
              disabledAt: new Date(),
              backupCodes: [],
            },
            $unset: {
              totpSecretEncrypted: '',
              qrCodeUri: '',
            },
          },
          {
            returnDocument: 'after',
          }
        ).lean<MongoTwoFactorRecord>();

        return this._mapper.toTwoFactorEntity(twoFactor);
      }
    );
  }
}

export const mongoSecurityTwoFactorRepository = new MongoSecurityTwoFactorRepository();
