import { describe, expect, it, vi } from 'vitest'

import { AdminUsersApplicationError } from '../../src/modules/admin/users/application/admin-users-application.error'
import { GetAdminUserDetailUseCase } from '../../src/modules/admin/users/application/use-cases/get-admin-user-detail.usecase'
import { SetAdminUserStatusUseCase } from '../../src/modules/admin/users/application/use-cases/set-admin-user-status.usecase'
import type { IAdminUsersMapper } from '../../src/modules/admin/users/application/admin-users.mapper'
import type { AdminUserEntity } from '../../src/modules/admin/users/domain/entities/admin-user.entity'
import type { IAdminUsersRepository } from '../../src/modules/admin/users/domain/repositories/admin-users.repository.interface'

const userId = '64b000000000000000000001'
const actorId = '64b000000000000000000002'

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
})

const makeRepository = (user: AdminUserEntity | null = makeUser()): IAdminUsersRepository => ({
  list: vi.fn(),
  findDetailById: vi.fn(),
  findById: vi.fn().mockResolvedValue(user),
  updateStatus: vi.fn().mockResolvedValue(undefined),
  revokeSessions: vi.fn().mockResolvedValue(undefined),
  recordStatusChange: vi.fn().mockResolvedValue(undefined),
})

describe('SetAdminUserStatusUseCase', () => {
  it('blocks a user, revokes sessions, and records the actor', async () => {
    const repository = makeRepository()
    const useCase = new SetAdminUserStatusUseCase(repository)
    await expect(useCase.execute(userId, 'blocked', { userId: actorId, role: 'admin' }, { ipAddress: '127.0.0.1', userAgent: 'test' }))
      .resolves.toEqual({ userId, status: 'blocked' })
    expect(repository.updateStatus).toHaveBeenCalledWith(userId, 'blocked')
    expect(repository.revokeSessions).toHaveBeenCalledWith(userId)
    expect(repository.recordStatusChange).toHaveBeenCalledWith(expect.objectContaining({ actorId, userId, previousStatus: 'active', status: 'blocked' }))
  })

  it('does not revoke sessions when unblocking', async () => {
    const repository = makeRepository(makeUser({ status: 'blocked' }))
    await new SetAdminUserStatusUseCase(repository).execute(userId, 'active', { userId: actorId, role: 'admin' }, { ipAddress: '', userAgent: '' })
    expect(repository.revokeSessions).not.toHaveBeenCalled()
  })

  it('rejects self status changes', async () => {
    const repository = makeRepository()
    await expect(new SetAdminUserStatusUseCase(repository).execute(userId, 'blocked', { userId, role: 'admin' }, { ipAddress: '', userAgent: '' }))
      .rejects.toMatchObject({ code: 'SELF_STATUS_CHANGE', statusCode: 400 })
  })

  it('protects superadmins and protects admins from non-superadmins', async () => {
    const superRepository = makeRepository(makeUser({ role: 'superadmin' }))
    await expect(new SetAdminUserStatusUseCase(superRepository).execute(userId, 'blocked', { userId: actorId, role: 'superadmin' }, { ipAddress: '', userAgent: '' }))
      .rejects.toBeInstanceOf(AdminUsersApplicationError)
    const adminRepository = makeRepository(makeUser({ role: 'admin' }))
    await expect(new SetAdminUserStatusUseCase(adminRepository).execute(userId, 'blocked', { userId: actorId, role: 'admin' }, { ipAddress: '', userAgent: '' }))
      .rejects.toMatchObject({ code: 'PROTECTED_ADMIN', statusCode: 403 })
  })

  it('returns not found without attempting a write', async () => {
    const repository = makeRepository(null)
    await expect(new SetAdminUserStatusUseCase(repository).execute(userId, 'blocked', { userId: actorId, role: 'admin' }, { ipAddress: '', userAgent: '' }))
      .rejects.toMatchObject({ code: 'USER_NOT_FOUND', statusCode: 404 })
    expect(repository.updateStatus).not.toHaveBeenCalled()
  })
})

describe('GetAdminUserDetailUseCase', () => {
  it('rejects malformed identifiers before querying the repository', async () => {
    const repository = makeRepository()
    const mapper = {} as IAdminUsersMapper
    await expect(new GetAdminUserDetailUseCase(repository, mapper).execute('not-an-object-id'))
      .rejects.toMatchObject({ code: 'INVALID_USER_ID' })
    expect(repository.findDetailById).not.toHaveBeenCalled()
  })
})
