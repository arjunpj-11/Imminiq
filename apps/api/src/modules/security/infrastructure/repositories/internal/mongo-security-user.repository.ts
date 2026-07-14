import { User } from '../../../../../infrastructure/database/models/user.model';
import type {
  ConfirmPendingEmailChangeInput,
  SavePendingEmailChangeInput,
  ScheduleAccountDeletionInput,
  UpdateSecurityPasswordHashInput,
} from '../../../domain/repositories/security-user.repository.interface';
import { MongoSecurityBaseRepository } from '../shared/mongo-security-base.repository';
import { MongoSecurityErrorMapper } from '../shared/mongo-security-error.mapper';
import { MongoSecurityNormalizer } from '../shared/mongo-security-normalizer';
import { MongoSecurityMapper } from '../shared/mongo-security.mapper';
import type { MongoSecurityUserRecord } from '../shared/mongo-security.types';

export class MongoSecurityUserRepository extends MongoSecurityBaseRepository {
  constructor(private readonly _mapper = new MongoSecurityMapper()) {
    super();
  }

  async findUserById(userId: string) {
    return this.execute('SECURITY_USER_LOOKUP_FAILED', 'Failed to read security user', async () => {
      const user = await User.findOne({
        _id: userId,
        deletedAt: null,
      })
        .select('+passwordHash')
        .lean<MongoSecurityUserRecord>();

      return this._mapper.toSecurityUserEntity(user);
    });
  }

  async emailExists(email: string): Promise<boolean> {
    return this.execute(
      'SECURITY_EMAIL_LOOKUP_FAILED',
      'Failed to check security email',
      async () => {
        const user = await User.exists({
          email: MongoSecurityNormalizer.email(email),
          deletedAt: null,
        });

        return Boolean(user);
      }
    );
  }

  async findUserByPendingEmailTokenHash(tokenHash: string) {
    return this.execute(
      'PENDING_EMAIL_LOOKUP_FAILED',
      'Failed to read user by pending email token',
      async () => {
        const user = await User.findOne({
          pendingEmailChangeTokenHash: tokenHash,
          pendingEmailChangeExpiresAt: {
            $gt: new Date(),
          },
          pendingEmail: {
            $ne: null,
          },
          deletedAt: null,
        })
          .select('+passwordHash +pendingEmailChangeTokenHash')
          .lean<MongoSecurityUserRecord>();

        return this._mapper.toSecurityUserEntity(user);
      }
    );
  }

  async savePendingEmailChange(input: SavePendingEmailChangeInput) {
    return this.execute(
      'PENDING_EMAIL_SAVE_FAILED',
      'Failed to save pending email change',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: input.userId,
            deletedAt: null,
          },
          {
            $set: {
              pendingEmail: MongoSecurityNormalizer.email(input.data.pendingEmail),
              pendingEmailChangeTokenHash: input.data.tokenHash,
              pendingEmailChangeExpiresAt: input.data.expiresAt,
              pendingEmailChangeRequestedAt: new Date(),
            },
          },
          {
            returnDocument: 'after',
          }
        )
          .select('+passwordHash')
          .lean<MongoSecurityUserRecord>();

        return this._mapper.toSecurityUserEntity(user);
      },
      MongoSecurityErrorMapper.mapDuplicateSecurityRecordError
    );
  }

  async confirmPendingEmailChange(input: ConfirmPendingEmailChangeInput) {
    return this.execute(
      'PENDING_EMAIL_CONFIRM_FAILED',
      'Failed to confirm pending email change',
      async () => {
        const normalizedEmail = MongoSecurityNormalizer.email(input.pendingEmail);

        const user = await User.findOneAndUpdate(
          {
            _id: input.userId,
            pendingEmail: normalizedEmail,
            deletedAt: null,
          },
          {
            $set: {
              email: normalizedEmail,
              emailVerified: true,
            },
            $unset: {
              pendingEmail: '',
              pendingEmailChangeTokenHash: '',
              pendingEmailChangeExpiresAt: '',
              pendingEmailChangeRequestedAt: '',
            },
          },
          {
            returnDocument: 'after',
          }
        )
          .select('+passwordHash')
          .lean<MongoSecurityUserRecord>();

        return this._mapper.toSecurityUserEntity(user);
      },
      MongoSecurityErrorMapper.mapDuplicateSecurityRecordError
    );
  }

  async clearPendingEmailChange(userId: string) {
    return this.execute(
      'PENDING_EMAIL_CLEAR_FAILED',
      'Failed to clear pending email change',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: userId,
            deletedAt: null,
          },
          {
            $unset: {
              pendingEmail: '',
              pendingEmailChangeTokenHash: '',
              pendingEmailChangeExpiresAt: '',
              pendingEmailChangeRequestedAt: '',
            },
          },
          {
            returnDocument: 'after',
          }
        )
          .select('+passwordHash')
          .lean<MongoSecurityUserRecord>();

        return this._mapper.toSecurityUserEntity(user);
      }
    );
  }

  async updatePasswordHash(input: UpdateSecurityPasswordHashInput) {
    return this.execute('PASSWORD_UPDATE_FAILED', 'Failed to update password hash', async () => {
      const user = await User.findOneAndUpdate(
        {
          _id: input.userId,
          deletedAt: null,
        },
        {
          $set: {
            passwordHash: input.passwordHash,
            passwordChangedAt: new Date(),
          },
        },
        {
          returnDocument: 'after',
        }
      )
        .select('+passwordHash')
        .lean<MongoSecurityUserRecord>();

      return this._mapper.toSecurityUserEntity(user);
    });
  }

  async scheduleAccountDeletion(input: ScheduleAccountDeletionInput) {
    return this.execute(
      'ACCOUNT_DELETION_SCHEDULE_FAILED',
      'Failed to schedule account deletion',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: input.userId,
            deletedAt: null,
          },
          {
            $set: {
              status: 'deactivated',
              deletionRequestedAt: new Date(),
              scheduledDeletionAt: input.scheduledDeletionAt,
              deactivatedAt: new Date(),
            },
          },
          {
            returnDocument: 'after',
          }
        )
          .select('+passwordHash')
          .lean<MongoSecurityUserRecord>();

        return this._mapper.toSecurityUserEntity(user);
      }
    );
  }
}

export const mongoSecurityUserRepository = new MongoSecurityUserRepository();
