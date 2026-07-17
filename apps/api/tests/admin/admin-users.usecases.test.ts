import { describe, expect, it, vi } from 'vitest';

import { AdminUsersApplicationError } from '../../src/modules/admin/users/application/admin-users-application.error';
import { GetAdminUserDetailUseCase } from '../../src/modules/admin/users/application/use-cases/get-admin-user-detail.usecase';
import { SetAdminUserStatusUseCase } from '../../src/modules/admin/users/application/use-cases/set-admin-user-status.usecase';
import type { IAdminUsersMapper } from '../../src/modules/admin/users/application/admin-users.mapper';
import type { AdminUserEntity } from '../../src/modules/admin/users/domain/entities/admin-user.entity';
import type { IAdminUsersRepository } from '../../src/modules/admin/users/domain/repositories/admin-users.repository.interface';
import type { IAdminUserEmailProvider } from '../../src/modules/admin/users/domain/services/admin-user-email-provider.interface';
import { SendAdminUserMessageUseCase } from '../../src/modules/admin/users/application/use-cases/send-admin-user-message.usecase';
import { adminUserMessageSchema, adminUserStatusSchema } from '../../src/modules/admin/users/presentation/admin-users.schema';

const userId = '64b000000000000000000001';
const actorId = '64b000000000000000000002';

const makeUser = (overrides: Partial<AdminUserEntity> = {}): AdminUserEntity => ({
  id: userId,
  fullName: 'Test User',
  username: 'test_user',
  email: 'user@example.test',
  role: 'user',
  status: 'active',
  emailVerified: true,
  phoneVerified: false,
  isPremium: false,
  coins: 0,
  xp: 0,
  level: 1,
  streakCount: 0,
  lastActiveAt: new Date(),
  createdAt: new Date(),
  provider: 'local',
  ...overrides,
});

const makeRepository = (user: AdminUserEntity | null = makeUser()): IAdminUsersRepository => ({
  list: vi.fn(),
  findDetailById: vi.fn(),
  findById: vi.fn().mockResolvedValue(user),
  updateStatus: vi.fn().mockResolvedValue(undefined),
  revokeSessions: vi.fn().mockResolvedValue(undefined),
  recordStatusChange: vi.fn().mockResolvedValue(undefined),
  recordAdminMessage: vi.fn().mockResolvedValue(undefined),
});

const makeEmailProvider = (): IAdminUserEmailProvider => ({
  queueStatusEmail: vi.fn().mockResolvedValue(undefined),
  queueDirectMessage: vi.fn().mockResolvedValue(undefined),
});

const meta = {
  ipAddress: '127.0.0.1',
  userAgent: 'test',
  reason: 'Repeated automated spam was confirmed by the moderation team.',
  reasonCode: 'spam_or_abuse',
  notifyEmail: true,
};

describe('SetAdminUserStatusUseCase', () => {
  it('blocks a user, revokes sessions, and records the actor', async () => {
    const repository = makeRepository();
    const emailProvider = makeEmailProvider();
    const useCase = new SetAdminUserStatusUseCase(repository, emailProvider);
    await expect(
      useCase.execute(
        userId,
        'blocked',
        { userId: actorId, role: 'admin' },
        meta
      )
    ).resolves.toEqual({ userId, status: 'blocked', emailQueued: true });
    expect(repository.updateStatus).toHaveBeenCalledWith(userId, 'blocked', {
      actorId,
      reason: meta.reason,
      reasonCode: meta.reasonCode,
    });
    expect(repository.revokeSessions).toHaveBeenCalledWith(userId);
    expect(repository.recordStatusChange).toHaveBeenCalledWith(
      expect.objectContaining({ actorId, userId, previousStatus: 'active', status: 'blocked' })
    );
    expect(emailProvider.queueStatusEmail).toHaveBeenCalled();
  });

  it('revokes sessions when suspending and not when restoring', async () => {
    const suspendedRepository = makeRepository();
    await new SetAdminUserStatusUseCase(suspendedRepository, makeEmailProvider()).execute(
      userId,
      'paused',
      { userId: actorId, role: 'admin' },
      meta
    );
    expect(suspendedRepository.revokeSessions).toHaveBeenCalledWith(userId);

    const repository = makeRepository(makeUser({ status: 'blocked' }));
    await new SetAdminUserStatusUseCase(repository, makeEmailProvider()).execute(
      userId,
      'active',
      { userId: actorId, role: 'admin' },
      { ...meta, reason: 'The appeal was reviewed and account access can now be restored.' }
    );
    expect(repository.revokeSessions).not.toHaveBeenCalled();
  });

  it('rejects self status changes', async () => {
    const repository = makeRepository();
    await expect(
      new SetAdminUserStatusUseCase(repository, makeEmailProvider()).execute(
        userId,
        'blocked',
        { userId, role: 'admin' },
        meta
      )
    ).rejects.toMatchObject({ code: 'SELF_STATUS_CHANGE', kind: 'invalid-input' });
  });

  it('protects superadmins and protects admins from non-superadmins', async () => {
    const superRepository = makeRepository(makeUser({ role: 'superadmin' }));
    await expect(
      new SetAdminUserStatusUseCase(superRepository, makeEmailProvider()).execute(
        userId,
        'blocked',
        { userId: actorId, role: 'superadmin' },
        meta
      )
    ).rejects.toBeInstanceOf(AdminUsersApplicationError);
    const adminRepository = makeRepository(makeUser({ role: 'admin' }));
    await expect(
      new SetAdminUserStatusUseCase(adminRepository, makeEmailProvider()).execute(
        userId,
        'blocked',
        { userId: actorId, role: 'admin' },
        meta
      )
    ).rejects.toMatchObject({ code: 'PROTECTED_ADMIN', kind: 'forbidden' });
  });

  it('returns not found without attempting a write', async () => {
    const repository = makeRepository(null);
    await expect(
      new SetAdminUserStatusUseCase(repository, makeEmailProvider()).execute(
        userId,
        'blocked',
        { userId: actorId, role: 'admin' },
        meta
      )
    ).rejects.toMatchObject({ code: 'USER_NOT_FOUND', kind: 'missing-resource' });
    expect(repository.updateStatus).not.toHaveBeenCalled();
  });
});

describe('SendAdminUserMessageUseCase', () => {
  it('records an in-app message and queues optional email', async () => {
    const repository = makeRepository();
    const emailProvider = makeEmailProvider();
    await expect(
      new SendAdminUserMessageUseCase(repository, emailProvider).execute(
        userId,
        {
          subject: 'Account review update',
          message: 'We completed the review you requested and no action is required.',
          notifyEmail: true,
        },
        { userId: actorId, role: 'admin' },
        { ipAddress: '127.0.0.1', userAgent: 'test' }
      )
    ).resolves.toEqual({ userId, emailQueued: true });
    expect(repository.recordAdminMessage).toHaveBeenCalledWith(
      expect.objectContaining({ actorId, userId, subject: 'Account review update' })
    );
    expect(emailProvider.queueDirectMessage).toHaveBeenCalled();
  });

  it('validates status explanations and direct messages', () => {
    expect(() =>
      adminUserStatusSchema.parse({
        status: 'paused',
        reasonCode: 'security_risk',
        reason: 'too short',
        notifyEmail: true,
      })
    ).toThrow();
    expect(
      adminUserMessageSchema.parse({
        subject: 'Important update',
        message: 'Please review the latest account notification.',
      })
    ).toMatchObject({ notifyEmail: true });
  });
});

describe('GetAdminUserDetailUseCase', () => {
  it('rejects malformed identifiers before querying the repository', async () => {
    const repository = makeRepository();
    const mapper = {} as IAdminUsersMapper;
    await expect(
      new GetAdminUserDetailUseCase(repository, mapper).execute('not-an-object-id')
    ).rejects.toMatchObject({ code: 'INVALID_USER_ID' });
    expect(repository.findDetailById).not.toHaveBeenCalled();
  });
});
