import { describe, expect, it, vi } from 'vitest';

import { UpdateAdminMockTestLifecycleUseCase } from '../../src/modules/admin/mock-tests/application/use-cases/update-admin-mock-test-lifecycle.usecase';
import type { IAdminMockTestEmailProvider } from '../../src/modules/admin/mock-tests/domain/services/admin-mock-test-email-provider.interface';
import type { IAdminMockTestsRepository } from '../../src/modules/admin/mock-tests/domain/repositories/admin-mock-tests.repository.interface';
import { adminMockTestLifecycleSchema } from '../../src/modules/admin/mock-tests/presentation/admin-mock-tests.schema';

const actor = {
  userId: 'admin-id',
  role: 'admin' as const,
  ipAddress: '127.0.0.1',
  userAgent: 'test',
};

const input = {
  action: 'delete' as const,
  reasonCode: 'broken_assessment',
  reason: 'The assessment contains multiple invalid questions.',
  notifyOwner: true,
};

describe('admin mock-test moderation', () => {
  it('queues the owner email only after the lifecycle update succeeds', async () => {
    const repository = {
      updateLifecycle: vi.fn().mockResolvedValue({
        id: 'test-id',
        title: 'TypeScript assessment',
        ownerId: 'owner-id',
        owner: 'Owner Name',
        ownerEmail: 'owner@example.com',
        moderationStatus: 'deleted',
        reason: input.reason,
        affectedActiveAttempts: 2,
        updatedAt: new Date('2026-07-16T00:00:00.000Z'),
      }),
    } as unknown as IAdminMockTestsRepository;
    const emailProvider = {
      queueModerationEmail: vi.fn().mockResolvedValue(undefined),
    } satisfies IAdminMockTestEmailProvider;

    const result = await new UpdateAdminMockTestLifecycleUseCase(repository, emailProvider).execute(
      'test-id',
      input,
      actor
    );

    expect(repository.updateLifecycle).toHaveBeenCalledWith('test-id', input, actor);
    expect(emailProvider.queueModerationEmail).toHaveBeenCalledWith({
      to: 'owner@example.com',
      ownerName: 'Owner Name',
      testTitle: 'TypeScript assessment',
      action: 'deleted',
      reason: input.reason,
    });
    expect(result).toMatchObject({
      moderationStatus: 'deleted',
      affectedActiveAttempts: 2,
      notificationQueued: true,
    });
  });

  it('keeps a completed moderation decision successful when email delivery cannot be queued', async () => {
    const repository = {
      updateLifecycle: vi.fn().mockResolvedValue({
        id: 'test-id',
        title: 'TypeScript assessment',
        ownerId: 'owner-id',
        owner: 'Owner Name',
        ownerEmail: 'owner@example.com',
        moderationStatus: 'suspended',
        reason: input.reason,
        affectedActiveAttempts: 0,
        updatedAt: new Date(),
      }),
    } as unknown as IAdminMockTestsRepository;
    const emailProvider = {
      queueModerationEmail: vi.fn().mockRejectedValue(new Error('queue unavailable')),
    } satisfies IAdminMockTestEmailProvider;

    await expect(
      new UpdateAdminMockTestLifecycleUseCase(repository, emailProvider).execute(
        'test-id',
        { ...input, action: 'suspend' },
        actor
      )
    ).resolves.toMatchObject({ moderationStatus: 'suspended', notificationQueued: false });
  });

  it('returns a safe not-found error and does not send email', async () => {
    const repository = {
      updateLifecycle: vi.fn().mockResolvedValue(null),
    } as unknown as IAdminMockTestsRepository;
    const emailProvider = {
      queueModerationEmail: vi.fn(),
    } satisfies IAdminMockTestEmailProvider;

    await expect(
      new UpdateAdminMockTestLifecycleUseCase(repository, emailProvider).execute(
        'missing',
        input,
        actor
      )
    ).rejects.toMatchObject({ kind: 'missing-resource', code: 'MOCK_TEST_NOT_FOUND' });
    expect(emailProvider.queueModerationEmail).not.toHaveBeenCalled();
  });

  it('requires a meaningful explanation for destructive actions', () => {
    expect(() => adminMockTestLifecycleSchema.parse({ ...input, reason: 'too short' })).toThrow();
    expect(adminMockTestLifecycleSchema.parse(input)).toEqual(input);
  });
});
