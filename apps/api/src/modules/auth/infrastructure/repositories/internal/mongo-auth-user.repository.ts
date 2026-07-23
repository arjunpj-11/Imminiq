import { User } from '../../../../../infrastructure/database/models/user.model';
import type {
  CreateAuthUserInput,
  CreateOAuthUserInput,
  UpdateAuthProfileInput,
  UpdateAuthUserInput,
} from '../../../domain/repositories/auth-user.repository.interface';
import { MongoAuthBaseRepository } from '../shared/mongo-auth-base.repository';
import { MongoAuthErrorMapper } from '../shared/mongo-auth-error.mapper';
import { MongoAuthMapper } from '../shared/mongo-auth.mapper';
import { MongoAuthNormalizer } from '../shared/mongo-auth-normalizer';
import type { MongoAuthUserRecord, MongoOAuthAuthUserRecord } from '../shared/mongo-auth.types';
import type { MongoAuthProfileProvisioner } from './mongo-auth-profile.provisioner';
import { mongoAuthProfileProvisioner } from './mongo-auth-profile.provisioner';

export class MongoAuthUserRepository extends MongoAuthBaseRepository {
  constructor(
    private readonly _mapper = new MongoAuthMapper(),
    private readonly _profileProvisioner: MongoAuthProfileProvisioner = mongoAuthProfileProvisioner
  ) {
    super();
  }

  async findByEmail(email: string) {
    return this.execute('AUTH_USER_READ_FAILED', 'Failed to read auth user by email', async () => {
      const user = await User.findOne({
        email: MongoAuthNormalizer.email(email),
        deletedAt: null,
      })
        .select('+passwordHash')
        .lean<MongoAuthUserRecord>();

      return this._mapper.toAuthUserEntity(user);
    });
  }

  async findByPhone(phone: string) {
    return this.execute('AUTH_USER_READ_FAILED', 'Failed to read auth user by phone', async () => {
      const user = await User.findOne({
        phone: MongoAuthNormalizer.phone(phone),
        deletedAt: null,
      })
        .select('+passwordHash')
        .lean<MongoAuthUserRecord>();

      return this._mapper.toAuthUserEntity(user);
    });
  }

  async findByIdentifier(identifier: string) {
    return this.execute(
      'AUTH_USER_READ_FAILED',
      'Failed to read auth user by identifier',
      async () => {
        const value = identifier.trim();
        const isEmail = value.includes('@');

        const user = await User.findOne({
          ...(isEmail
            ? { email: MongoAuthNormalizer.email(value) }
            : { phone: MongoAuthNormalizer.phone(value) }),
          deletedAt: null,
        })
          .select('+passwordHash')
          .lean<MongoAuthUserRecord>();

        return this._mapper.toAuthUserEntity(user);
      }
    );
  }

  async findById(id: string) {
    return this.execute('AUTH_USER_READ_FAILED', 'Failed to read auth user by id', async () => {
      const user = await User.findOne({
        _id: id,
        deletedAt: null,
      })
        .select('+passwordHash')
        .lean<MongoAuthUserRecord>();

      return this._mapper.toAuthUserEntity(user);
    });
  }

  async findByUsername(username: string) {
    return this.execute(
      'AUTH_USER_READ_FAILED',
      'Failed to read auth user by username',
      async () => {
        const user = await User.findOne({
          username: MongoAuthNormalizer.username(username),
          deletedAt: null,
        }).lean<MongoAuthUserRecord>();

        return this._mapper.toAuthUserEntity(user);
      }
    );
  }

  async emailExists(email: string) {
    return this.execute('AUTH_USER_READ_FAILED', 'Failed to check email availability', async () =>
      Boolean(
        await User.exists({
          email: MongoAuthNormalizer.email(email),
          deletedAt: null,
        })
      )
    );
  }

  async phoneExists(phone: string) {
    return this.execute('AUTH_USER_READ_FAILED', 'Failed to check phone availability', async () =>
      Boolean(
        await User.exists({
          phone: MongoAuthNormalizer.phone(phone),
          deletedAt: null,
        })
      )
    );
  }

  async usernameExists(username: string) {
    return this.execute(
      'AUTH_USER_READ_FAILED',
      'Failed to check username availability',
      async () =>
        Boolean(
          await User.exists({
            username: MongoAuthNormalizer.username(username),
            deletedAt: null,
          })
        )
    );
  }

  async createUser(data: CreateAuthUserInput) {
    return this.execute(
      'AUTH_USER_WRITE_FAILED',
      'Failed to create auth user',
      async () => {
        const user = await User.create({
          fullName: MongoAuthNormalizer.text(data.fullName),
          ...(data.email ? { email: MongoAuthNormalizer.email(data.email) } : {}),
          ...(data.phone ? { phone: MongoAuthNormalizer.phone(data.phone) } : {}),
          username: MongoAuthNormalizer.username(data.username),
          passwordHash: data.passwordHash,
          provider: 'local',
          emailVerified: data.emailVerified ?? false,
          phoneVerified: data.phoneVerified ?? false,
        });

        return this._mapper.toAuthUserEntityOrThrow(
          this._mapper.toPlainRecord<MongoAuthUserRecord>(user)
        );
      },
      MongoAuthErrorMapper.mapDuplicateUserError
    );
  }

  async createOAuthUser(data: CreateOAuthUserInput) {
    return this.execute(
      'AUTH_USER_WRITE_FAILED',
      'Failed to create OAuth user',
      async () => {
        const normalizedEmail = MongoAuthNormalizer.email(data.email);

        const existingUser = await User.findOne({
          email: normalizedEmail,
        })
          .select('+passwordHash')
          .lean<MongoOAuthAuthUserRecord>();

        if (existingUser) {
          const updatedUser = await User.findByIdAndUpdate(
            existingUser._id,
            {
              $set: {
                fullName: existingUser.fullName || MongoAuthNormalizer.text(data.fullName),
                avatarUrl: existingUser.avatarUrl || data.avatarUrl,
                provider: existingUser.provider || data.provider,
                providerId: existingUser.providerId || data.providerId,
                emailVerified: true,
                deletedAt: null,
              },
            },
            {
              returnDocument: 'after',
            }
          )
            .select('+passwordHash')
            .lean<MongoAuthUserRecord>();

          if (updatedUser) {
            await this._profileProvisioner.ensureProfile(updatedUser);

            return this._mapper.toAuthUserEntityOrThrow(updatedUser);
          }
        }

        const user = await User.create({
          fullName: MongoAuthNormalizer.text(data.fullName),
          email: normalizedEmail,
          username: MongoAuthNormalizer.username(data.username),
          ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
          provider: data.provider,
          providerId: data.providerId,
          emailVerified: true,
          phoneVerified: false,
          passwordHash: null,
        });

        const plainUser = this._mapper.toPlainRecord<MongoAuthUserRecord>(user);

        await this._profileProvisioner.ensureProfile(plainUser);

        return this._mapper.toAuthUserEntityOrThrow(plainUser);
      },
      MongoAuthErrorMapper.mapDuplicateUserError
    );
  }

  async updateProfile(id: string, data: UpdateAuthProfileInput) {
    return this.execute(
      'AUTH_USER_WRITE_FAILED',
      'Failed to update auth profile',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: id,
            deletedAt: null,
          },
          {
            $set: {
              ...(data.fullName ? { fullName: MongoAuthNormalizer.text(data.fullName) } : {}),
              ...(data.username ? { username: MongoAuthNormalizer.username(data.username) } : {}),
              ...(data.avatarUrl ? { avatarUrl: data.avatarUrl } : {}),
            },
          },
          {
            returnDocument: 'after',
          }
        ).lean<MongoAuthUserRecord>();

        return this._mapper.toAuthUserEntity(user);
      },
      MongoAuthErrorMapper.mapDuplicateUserError
    );
  }

  async updateUser(id: string, data: UpdateAuthUserInput) {
    return this.execute(
      'AUTH_USER_WRITE_FAILED',
      'Failed to update auth user',
      async () => {
        const update = this.buildUserUpdate(data);

        if (Object.keys(update.$set).length === 0) {
          const user = await User.findOne({
            _id: id,
            deletedAt: null,
          }).lean<MongoAuthUserRecord>();

          return this._mapper.toAuthUserEntity(user);
        }

        const user = await User.findOneAndUpdate(
          {
            _id: id,
            deletedAt: null,
          },
          update,
          {
            returnDocument: 'after',
          }
        ).lean<MongoAuthUserRecord>();

        return this._mapper.toAuthUserEntity(user);
      },
      MongoAuthErrorMapper.mapDuplicateUserError
    );
  }

  async markEmailVerified(id: string) {
    return this.execute('AUTH_USER_WRITE_FAILED', 'Failed to mark email verified', async () => {
      const user = await User.findOneAndUpdate(
        {
          _id: id,
          deletedAt: null,
        },
        {
          $set: {
            emailVerified: true,
          },
        },
        {
          returnDocument: 'after',
        }
      ).lean<MongoAuthUserRecord>();

      if (user) {
        await this._profileProvisioner.ensureProfile(user);
      }

      return this._mapper.toAuthUserEntity(user);
    });
  }

  async markPhoneVerified(id: string) {
    return this.execute('AUTH_USER_WRITE_FAILED', 'Failed to mark phone verified', async () => {
      const user = await User.findOneAndUpdate(
        {
          _id: id,
          deletedAt: null,
        },
        {
          $set: {
            phoneVerified: true,
          },
        },
        {
          returnDocument: 'after',
        }
      ).lean<MongoAuthUserRecord>();

      if (user) {
        await this._profileProvisioner.ensureProfile(user);
      }

      return this._mapper.toAuthUserEntity(user);
    });
  }

  async updatePasswordHash(id: string, passwordHash: string) {
    return this.execute('AUTH_USER_WRITE_FAILED', 'Failed to update password hash', async () => {
      const user = await User.findOneAndUpdate(
        {
          _id: id,
          deletedAt: null,
        },
        {
          $set: {
            passwordHash,
          },
        },
        {
          returnDocument: 'after',
        }
      ).lean<MongoAuthUserRecord>();

      return this._mapper.toAuthUserEntity(user);
    });
  }

  async updateLastActive(id: string) {
    return this.execute('AUTH_USER_WRITE_FAILED', 'Failed to update last active time', async () => {
      const user = await User.findOneAndUpdate(
        {
          _id: id,
          deletedAt: null,
        },
        {
          $set: {
            lastActiveAt: new Date(),
          },
        },
        {
          returnDocument: 'after',
        }
      ).lean<MongoAuthUserRecord>();

      return this._mapper.toAuthUserEntity(user);
    });
  }

  async cancelScheduledDeletionIfRecoverable(id: string) {
    return this.execute(
      'AUTH_USER_WRITE_FAILED',
      'Failed to cancel scheduled account deletion',
      async () => {
        const user = await User.findOneAndUpdate(
          {
            _id: id,
            status: 'deactivated',
            deletedAt: null,
            scheduledDeletionAt: {
              $gt: new Date(),
            },
          },
          {
            $set: {
              status: 'active',
            },
            $unset: {
              deletionRequestedAt: '',
              scheduledDeletionAt: '',
            },
          },
          {
            returnDocument: 'after',
          }
        ).lean<MongoAuthUserRecord>();

        return this._mapper.toAuthUserEntity(user);
      }
    );
  }

  async deleteUserById(id: string) {
    return this.execute('AUTH_USER_DELETE_FAILED', 'Failed to delete auth user', async () => {
      const user = await User.findByIdAndDelete(id).lean<MongoAuthUserRecord>();

      return this._mapper.toAuthUserEntity(user);
    });
  }

  private buildUserUpdate(data: UpdateAuthUserInput): {
    $set: Record<string, unknown>;
  } {
    const $set: Record<string, unknown> = {};

    if (data.fullName !== undefined) {
      $set.fullName = MongoAuthNormalizer.text(data.fullName);
    }

    if (data.email !== undefined) {
      $set.email = MongoAuthNormalizer.email(data.email);
    }

    if (data.phone !== undefined) {
      $set.phone = MongoAuthNormalizer.phone(data.phone);
    }

    if (data.username !== undefined) {
      $set.username = MongoAuthNormalizer.username(data.username);
    }

    if (data.avatarUrl !== undefined) {
      $set.avatarUrl = data.avatarUrl;
    }

    if (data.passwordHash !== undefined) {
      $set.passwordHash = data.passwordHash;
    }

    if (data.emailVerified !== undefined) {
      $set.emailVerified = data.emailVerified;
    }

    if (data.phoneVerified !== undefined) {
      $set.phoneVerified = data.phoneVerified;
    }

    if (data.onboardingCompleted !== undefined) {
      $set.onboardingCompleted = data.onboardingCompleted;
    }

    if (data.lastActiveAt !== undefined) {
      $set.lastActiveAt = data.lastActiveAt;
    }

    if (data.status !== undefined) {
      $set.status = data.status;
    }

    if (data.scheduledDeletionAt !== undefined) {
      $set.scheduledDeletionAt = data.scheduledDeletionAt;
    }

    return {
      $set,
    };
  }
}

export const mongoAuthUserRepository = new MongoAuthUserRepository();
