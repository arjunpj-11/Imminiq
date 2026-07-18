import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { User } from '../../src/infrastructure/database/models/user.model';
import { SetAdminActionPasswordUseCase } from '../../src/modules/admin/users/application/use-cases/set-admin-action-password.usecase';
import type { AdminUserEntity } from '../../src/modules/admin/users/domain/entities/admin-user.entity';
import type { IAdminUsersRepository } from '../../src/modules/admin/users/domain/repositories/admin-users.repository.interface';
import type { IAdminPasswordHasher } from '../../src/modules/admin/users/domain/services/admin-password-hasher.interface';
import { bcryptSecurityPasswordHasher } from '../../src/modules/security/infrastructure/services/bcrypt-security-password-hasher.service';
import { createRequirePrivilegedMfa } from '../../src/shared/middlewares/admin.middleware';
import { securityAttemptCache } from '../../src/infrastructure/cache/security-attempt.cache';
import { securityAuditLogger } from '../../src/infrastructure/security/security-audit-logger';
import {
  createMockRequest,
  createMockResponse,
  createNext,
  firstNextError,
} from '../helpers/middleware-test-helpers';

const adminId = '64b000000000000000000001';
const superAdminId = '64b000000000000000000002';
const requirePrivilegedMfa = createRequirePrivilegedMfa(bcryptSecurityPasswordHasher);

const admin = (overrides: Partial<AdminUserEntity> = {}): AdminUserEntity => ({
  id: adminId,
  fullName: 'Admin User',
  username: 'admin_user',
  role: 'admin',
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
  provider: 'google',
  adminActionPasswordConfigured: true,
  adminActionPasswordSetAt: new Date(),
  ...overrides,
});

describe('admin action password protection', () => {
  beforeEach(() => {
    vi.spyOn(securityAttemptCache, 'isBlocked').mockResolvedValue(false);
    vi.spyOn(securityAttemptCache, 'clear').mockResolvedValue();
    vi.spyOn(securityAttemptCache, 'recordFailure').mockResolvedValue({
      blocked: false,
      attempts: 1,
      remainingAttempts: 4,
    });
    vi.spyOn(securityAuditLogger, 'record').mockResolvedValue();
  });
  afterEach(() => vi.restoreAllMocks());

  it('accepts the assigned password for a protected admin action', async () => {
    vi.spyOn(User, 'findOne').mockReturnValue({
      select: () => Promise.resolve({ adminActionPasswordHash: 'stored-hash' }),
    } as never);
    vi.spyOn(bcryptSecurityPasswordHasher, 'compare').mockResolvedValue(true);
    const next = createNext();
    const request = createMockRequest({
      user: { userId: adminId, role: 'admin' },
      headers: { 'x-admin-action-password': 'private-password-123' },
    } as never);

    await requirePrivilegedMfa(request, createMockResponse() as never, next);

    expect(bcryptSecurityPasswordHasher.compare).toHaveBeenCalledWith(
      'private-password-123',
      'stored-hash'
    );
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects an incorrect password without exposing the stored hash', async () => {
    vi.spyOn(User, 'findOne').mockReturnValue({
      select: () => Promise.resolve({ adminActionPasswordHash: 'stored-hash' }),
    } as never);
    vi.spyOn(bcryptSecurityPasswordHasher, 'compare').mockResolvedValue(false);
    const next = createNext();
    const request = createMockRequest({
      user: { userId: adminId, role: 'admin' },
      headers: { 'x-admin-action-password': 'wrong-password' },
    } as never);

    await requirePrivilegedMfa(request, createMockResponse() as never, next);

    expect(firstNextError(next)).toMatchObject({
      statusCode: 403,
      code: 'ADMIN_ACTION_PASSWORD_INVALID',
    });
  });

  it('allows the superadmin recovery authority without an action password', async () => {
    const find = vi.spyOn(User, 'findOne');
    const cacheLookup = vi.mocked(securityAttemptCache.isBlocked);
    const next = createNext();
    const request = createMockRequest({
      user: { userId: superAdminId, role: 'superadmin' },
    } as never);

    await requirePrivilegedMfa(request, createMockResponse() as never, next);

    expect(find).not.toHaveBeenCalled();
    expect(cacheLookup).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it('blocks verification before password comparison when the admin is locked out', async () => {
    vi.mocked(securityAttemptCache.isBlocked).mockResolvedValue(true);
    vi.spyOn(securityAttemptCache, 'getRetryAfterSeconds').mockResolvedValue(300);
    const compare = vi.spyOn(bcryptSecurityPasswordHasher, 'compare');
    const next = createNext();
    const request = createMockRequest({
      user: { userId: adminId, role: 'admin' },
      headers: { 'x-admin-action-password': 'private-password-123' },
    } as never);

    await requirePrivilegedMfa(request, createMockResponse() as never, next);

    expect(compare).not.toHaveBeenCalled();
    expect(firstNextError(next)).toMatchObject({
      statusCode: 429,
      code: 'ADMIN_ACTION_PASSWORD_BLOCKED',
    });
    expect(securityAuditLogger.record).toHaveBeenCalledWith(
      expect.objectContaining({ eventType: 'admin_action_password_blocked', outcome: 'blocked' })
    );
  });
});

describe('SetAdminActionPasswordUseCase', () => {
  it('hashes the password before saving it for the selected admin', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(admin()),
      setAdminActionPassword: vi
        .fn()
        .mockResolvedValue(admin({ adminActionPasswordSetAt: new Date('2026-07-17') })),
    } as unknown as IAdminUsersRepository;
    const hasher = {
      hash: vi.fn().mockResolvedValue('bcrypt-hash'),
      compare: vi.fn(),
    } as IAdminPasswordHasher;
    const useCase = new SetAdminActionPasswordUseCase(repository, hasher);

    await expect(
      useCase.execute(adminId, 'private-password-123', superAdminId, {
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
      })
    ).resolves.toMatchObject({ userId: adminId, configured: true });
    expect(hasher.hash).toHaveBeenCalledWith('private-password-123');
    expect(repository.setAdminActionPassword).toHaveBeenCalledWith(
      adminId,
      'bcrypt-hash',
      expect.objectContaining({ actorId: superAdminId })
    );
  });

  it('does not assign action passwords to ordinary users', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(admin({ role: 'user' })),
    } as unknown as IAdminUsersRepository;
    const hasher = { hash: vi.fn(), compare: vi.fn() } as IAdminPasswordHasher;

    await expect(
      new SetAdminActionPasswordUseCase(repository, hasher).execute(
        adminId,
        'private-password-123',
        superAdminId,
        { ipAddress: '127.0.0.1', userAgent: 'vitest' }
      )
    ).rejects.toMatchObject({ code: 'PROTECTED_ADMIN', kind: 'forbidden' });
    expect(hasher.hash).not.toHaveBeenCalled();
  });
});
