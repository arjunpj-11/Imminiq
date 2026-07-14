import type {
  RotateAuthSessionInput,
  SaveAuthSessionInput,
} from '../../domain/repositories/auth-session.repository.interface';
import type { IAuthRepository } from '../../domain/repositories/auth.repository.interface';
import type {
  CreateAuthUserInput,
  CreateOAuthUserInput,
  UpdateAuthProfileInput,
  UpdateAuthUserInput,
} from '../../domain/repositories/auth-user.repository.interface';
import {
  MongoAuthSessionRepository,
  mongoAuthSessionRepository,
} from './internal/mongo-auth-session.repository';
import {
  MongoAuthTwoFactorRepository,
  mongoAuthTwoFactorRepository,
} from './internal/mongo-auth-two-factor.repository';
import {
  MongoAuthUserRepository,
  mongoAuthUserRepository,
} from './internal/mongo-auth-user.repository';
import { MongoAuthMapper } from './shared/mongo-auth.mapper';

type MongoAuthRepositoryDependencies = {
  userRepository: MongoAuthUserRepository;
  sessionRepository: MongoAuthSessionRepository;
  twoFactorRepository: MongoAuthTwoFactorRepository;
};

export class MongoAuthRepository implements IAuthRepository {
  private readonly _userRepository: MongoAuthUserRepository;
  private readonly _sessionRepository: MongoAuthSessionRepository;
  private readonly _twoFactorRepository: MongoAuthTwoFactorRepository;

  constructor(
    mapper?: MongoAuthMapper,
    dependencies: Partial<MongoAuthRepositoryDependencies> = {}
  ) {
    this._userRepository =
      dependencies.userRepository ??
      (mapper ? new MongoAuthUserRepository(mapper) : mongoAuthUserRepository);
    this._sessionRepository =
      dependencies.sessionRepository ??
      (mapper ? new MongoAuthSessionRepository(mapper) : mongoAuthSessionRepository);
    this._twoFactorRepository =
      dependencies.twoFactorRepository ??
      (mapper ? new MongoAuthTwoFactorRepository(mapper) : mongoAuthTwoFactorRepository);
  }

  async findByEmail(email: string) {
    return this._userRepository.findByEmail(email);
  }

  async findByPhone(phone: string) {
    return this._userRepository.findByPhone(phone);
  }

  async findByIdentifier(identifier: string) {
    return this._userRepository.findByIdentifier(identifier);
  }

  async findById(id: string) {
    return this._userRepository.findById(id);
  }

  async findByUsername(username: string) {
    return this._userRepository.findByUsername(username);
  }

  async emailExists(email: string) {
    return this._userRepository.emailExists(email);
  }

  async phoneExists(phone: string) {
    return this._userRepository.phoneExists(phone);
  }

  async usernameExists(username: string) {
    return this._userRepository.usernameExists(username);
  }

  async createUser(data: CreateAuthUserInput) {
    return this._userRepository.createUser(data);
  }

  async createOAuthUser(data: CreateOAuthUserInput) {
    return this._userRepository.createOAuthUser(data);
  }

  async updateProfile(id: string, data: UpdateAuthProfileInput) {
    return this._userRepository.updateProfile(id, data);
  }

  async updateUser(id: string, data: UpdateAuthUserInput) {
    return this._userRepository.updateUser(id, data);
  }

  async markEmailVerified(id: string) {
    return this._userRepository.markEmailVerified(id);
  }

  async markPhoneVerified(id: string) {
    return this._userRepository.markPhoneVerified(id);
  }

  async updatePasswordHash(id: string, passwordHash: string) {
    return this._userRepository.updatePasswordHash(id, passwordHash);
  }

  async updateLastActive(id: string) {
    return this._userRepository.updateLastActive(id);
  }

  async cancelScheduledDeletionIfRecoverable(id: string) {
    return this._userRepository.cancelScheduledDeletionIfRecoverable(id);
  }

  async deleteUserById(id: string) {
    return this._userRepository.deleteUserById(id);
  }

  async hasActiveTwoFactor(userId: string) {
    return this._twoFactorRepository.hasActiveTwoFactor(userId);
  }

  async findActiveTwoFactorForLogin(userId: string) {
    return this._twoFactorRepository.findActiveTwoFactorForLogin(userId);
  }

  async touchTwoFactorLastUsed(userId: string) {
    return this._twoFactorRepository.touchTwoFactorLastUsed(userId);
  }

  async markBackupCodeUsed(userId: string, backupCodeIndex: number) {
    return this._twoFactorRepository.markBackupCodeUsed(userId, backupCodeIndex);
  }

  async saveSession(data: SaveAuthSessionInput) {
    return this._sessionRepository.saveSession(data);
  }

  async findSessionByRefreshTokenHash(refreshTokenHash: string) {
    return this._sessionRepository.findSessionByRefreshTokenHash(refreshTokenHash);
  }

  async rotateRefreshTokenInSameSession(data: RotateAuthSessionInput) {
    return this._sessionRepository.rotateRefreshTokenInSameSession(data);
  }

  async findAllUserSessions(userId: string) {
    return this._sessionRepository.findAllUserSessions(userId);
  }

  async revokeSessionByRefreshTokenHash(refreshTokenHash: string) {
    return this._sessionRepository.revokeSessionByRefreshTokenHash(refreshTokenHash);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    return this._sessionRepository.revokeAllUserSessions(userId);
  }

  async revokeSessionById(sessionId: string, userId: string) {
    return this._sessionRepository.revokeSessionById(sessionId, userId);
  }
}

export const mongoAuthRepository = new MongoAuthRepository();
