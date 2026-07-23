import { describe, expect, it, vi } from 'vitest';

import { UpdateAdminTrackerLifecycleUseCase } from '../../src/modules/admin/trackers/application/use-cases/update-admin-tracker-lifecycle.usecase';
import type { IAdminTrackersRepository } from '../../src/modules/admin/trackers/domain/repositories/admin-trackers.repository.interface';
import type { IAdminTrackerEmailProvider } from '../../src/modules/admin/trackers/domain/services/admin-tracker-email-provider.interface';
import { adminTrackerLifecycleSchema } from '../../src/modules/admin/trackers/presentation/admin-trackers.schema';

const actor = {
  userId: 'admin-id',
  role: 'admin' as const,
  ipAddress: '127.0.0.1',
  userAgent: 'test',
};

const input = {
  action: 'suspend' as const,
  reasonCode: 'broken_learning_path',
  reason: 'Several required lessons are missing or point to unrelated material.',
  notifyOwner: true,
};

describe('admin tracker moderation', () => {
  it('persists the decision before queueing the owner email', async () => {
    const repository = {
      updateLifecycle: vi.fn().mockResolvedValue({
        id: 'tracker-id',
        title: 'Backend engineering',
        owner: 'Owner Name',
        ownerEmail: 'owner@example.com',
        moderationStatus: 'suspended',
        reason: input.reason,
        updatedAt: new Date('2026-07-16T00:00:00.000Z'),
      }),
    } as unknown as IAdminTrackersRepository;
    const emailProvider = {
      queueTrackerModeration: vi.fn().mockResolvedValue(undefined),
    } satisfies IAdminTrackerEmailProvider;

    const result = await new UpdateAdminTrackerLifecycleUseCase(repository, emailProvider).execute(
      'tracker-id',
      input,
      actor
    );

    expect(repository.updateLifecycle).toHaveBeenCalledWith('tracker-id', input, actor);
    expect(emailProvider.queueTrackerModeration).toHaveBeenCalledWith({
      to: 'owner@example.com',
      ownerName: 'Owner Name',
      trackerTitle: 'Backend engineering',
      action: 'suspended',
      reason: input.reason,
    });
    expect(result).toMatchObject({ moderationStatus: 'suspended', notificationQueued: true });
  });

  it('does not roll back moderation when the email queue is unavailable', async () => {
    const repository = {
      updateLifecycle: vi.fn().mockResolvedValue({
        id: 'tracker-id',
        title: 'Backend engineering',
        owner: 'Owner Name',
        ownerEmail: 'owner@example.com',
        moderationStatus: 'deleted',
        reason: input.reason,
        updatedAt: new Date(),
      }),
    } as unknown as IAdminTrackersRepository;
    const emailProvider = {
      queueTrackerModeration: vi.fn().mockRejectedValue(new Error('queue unavailable')),
    } satisfies IAdminTrackerEmailProvider;

    await expect(
      new UpdateAdminTrackerLifecycleUseCase(repository, emailProvider).execute(
        'tracker-id',
        { ...input, action: 'delete' },
        actor
      )
    ).resolves.toMatchObject({ moderationStatus: 'deleted', notificationQueued: false });
  });

  it('requires a clear user-facing reason', () => {
    expect(() => adminTrackerLifecycleSchema.parse({ ...input, reason: 'too short' })).toThrow();
    expect(adminTrackerLifecycleSchema.parse(input)).toEqual(input);
  });
});
