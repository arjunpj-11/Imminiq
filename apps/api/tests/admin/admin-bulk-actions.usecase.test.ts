import { describe, expect, it, vi } from 'vitest';

import { BulkUpdateAdminMockTestLifecycleUseCase } from '../../src/modules/admin/mock-tests/application/use-cases/bulk-update-admin-mock-test-lifecycle.usecase';
import type { IUpdateAdminMockTestLifecycleUseCase } from '../../src/modules/admin/mock-tests/application/use-cases/update-admin-mock-test-lifecycle.usecase';
import type { IAdminMockTestsRepository } from '../../src/modules/admin/mock-tests/domain/repositories/admin-mock-tests.repository.interface';
import { BulkUpdateAdminTrackerLifecycleUseCase } from '../../src/modules/admin/trackers/application/use-cases/bulk-update-admin-tracker-lifecycle.usecase';
import type { IUpdateAdminTrackerLifecycleUseCase } from '../../src/modules/admin/trackers/application/use-cases/update-admin-tracker-lifecycle.usecase';
import type { IAdminTrackersRepository } from '../../src/modules/admin/trackers/domain/repositories/admin-trackers.repository.interface';
import { BulkSetAdminUserStatusUseCase } from '../../src/modules/admin/users/application/use-cases/bulk-set-admin-user-status.usecase';
import type { ISetAdminUserStatusUseCase } from '../../src/modules/admin/users/application/use-cases/set-admin-user-status.usecase';
import type { IAdminUsersRepository } from '../../src/modules/admin/users/domain/repositories/admin-users.repository.interface';

const adminActor = {
  userId: 'admin-id',
  role: 'admin' as const,
  ipAddress: '127.0.0.1',
  userAgent: 'test',
};

describe('admin bulk action use cases', () => {
  it('previews tracker eligibility without executing lifecycle changes', async () => {
    const repository = {
      getDetail: vi.fn().mockImplementation(async (id: string) => (id === 'found' ? { id } : null)),
    } satisfies Pick<IAdminTrackersRepository, 'getDetail'>;
    const updateLifecycle = {
      execute: vi.fn(),
    } satisfies IUpdateAdminTrackerLifecycleUseCase;

    await expect(
      new BulkUpdateAdminTrackerLifecycleUseCase(repository, updateLifecycle).execute(
        {
          ids: ['found', 'missing'],
          preview: true,
          action: 'suspend',
          reasonCode: 'other',
          reason: 'A sufficiently detailed moderation reason',
          notifyOwner: true,
        },
        adminActor
      )
    ).resolves.toEqual({
      requested: 2,
      eligible: ['found'],
      blocked: [{ id: 'missing', reason: 'not_found' }],
    });
    expect(updateLifecycle.execute).not.toHaveBeenCalled();
  });

  it('reports each tracker lifecycle outcome independently', async () => {
    const updateLifecycle = {
      execute: vi
        .fn()
        .mockResolvedValueOnce({ id: 'one' })
        .mockRejectedValueOnce(new Error('denied')),
    } as unknown as IUpdateAdminTrackerLifecycleUseCase;
    const repository = { getDetail: vi.fn() } as unknown as Pick<
      IAdminTrackersRepository,
      'getDetail'
    >;

    await expect(
      new BulkUpdateAdminTrackerLifecycleUseCase(repository, updateLifecycle).execute(
        {
          ids: ['one', 'two'],
          preview: false,
          action: 'delete',
          reasonCode: 'other',
          reason: 'A sufficiently detailed moderation reason',
          notifyOwner: false,
        },
        adminActor
      )
    ).resolves.toEqual({
      succeeded: 1,
      failed: 1,
      results: [
        { id: 'one', success: true },
        { id: 'two', success: false, error: 'denied' },
      ],
    });
  });

  it('previews mock-test eligibility through the repository port', async () => {
    const repository = {
      getDetail: vi.fn().mockResolvedValue(null),
    } satisfies Pick<IAdminMockTestsRepository, 'getDetail'>;
    const updateLifecycle = { execute: vi.fn() } as unknown as IUpdateAdminMockTestLifecycleUseCase;

    await expect(
      new BulkUpdateAdminMockTestLifecycleUseCase(repository, updateLifecycle).execute(
        {
          ids: ['missing'],
          preview: true,
          action: 'suspend',
          reasonCode: 'other',
          reason: 'A sufficiently detailed moderation reason',
          notifyOwner: true,
        },
        adminActor
      )
    ).resolves.toEqual({
      requested: 1,
      eligible: [],
      blocked: [{ id: 'missing', reason: 'not_found' }],
    });
  });

  it('blocks self-actions and missing users during a bulk preview', async () => {
    const repository = {
      findById: vi.fn().mockImplementation(async (id: string) =>
        id === 'target' || id === adminActor.userId ? { id } : null
      ),
    } satisfies Pick<IAdminUsersRepository, 'findById'>;
    const setStatus = { execute: vi.fn() } as unknown as ISetAdminUserStatusUseCase;

    await expect(
      new BulkSetAdminUserStatusUseCase(repository, setStatus).execute(
        {
          userIds: ['target', adminActor.userId, 'missing'],
          preview: true,
          status: 'blocked',
          reasonCode: 'other',
          reason: 'A sufficiently detailed moderation reason',
          notifyEmail: true,
        },
        adminActor,
        { ipAddress: adminActor.ipAddress, userAgent: adminActor.userAgent }
      )
    ).resolves.toEqual({
      requested: 3,
      eligible: ['target'],
      blocked: [
        { id: adminActor.userId, reason: 'self_action' },
        { id: 'missing', reason: 'not_found' },
      ],
    });
    expect(setStatus.execute).not.toHaveBeenCalled();
  });
});
