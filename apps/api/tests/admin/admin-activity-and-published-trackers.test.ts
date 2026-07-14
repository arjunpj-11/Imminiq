import { describe, expect, it, vi } from 'vitest';

import { adminAnalyticsQuerySchema } from '../../src/modules/admin/analytics/presentation/admin-analytics.schema';
import { adminAuditLogsQuerySchema } from '../../src/modules/admin/audit-logs/presentation/admin-audit-logs.schema';
import { LikeAdminPublishedTrackerUseCase } from '../../src/modules/admin/trackers/application/use-cases/like-admin-published-tracker.usecase';
import { RateAdminPublishedTrackerUseCase } from '../../src/modules/admin/trackers/application/use-cases/rate-admin-published-tracker.usecase';
import type { IAdminTrackersRepository } from '../../src/modules/admin/trackers/domain/repositories/admin-trackers.repository.interface';
import { adminPublishedTrackerRatingSchema } from '../../src/modules/admin/trackers/presentation/admin-trackers.schema';
import { AdminTrackersMapper } from '../../src/modules/admin/trackers/application/admin-trackers.mapper';

describe('admin report date filters', () => {
  it('supports the four-day activity preset and custom dates', () => {
    expect(adminAnalyticsQuerySchema.parse({ days: '4' }).days).toBe(4);
    expect(
      adminAnalyticsQuerySchema.parse({ from: '2026-07-01', to: '2026-07-14' })
    ).toMatchObject({ from: '2026-07-01', to: '2026-07-14' });
  });

  it('rejects reversed audit and activity date ranges', () => {
    expect(() =>
      adminAuditLogsQuerySchema.parse({ from: '2026-07-14', to: '2026-07-01' })
    ).toThrow();
    expect(() =>
      adminAnalyticsQuerySchema.parse({ from: '2026-07-14', to: '2026-07-01' })
    ).toThrow();
  });
});

describe('published tracker administration', () => {
  const actor = {
    userId: '64b000000000000000000001',
    role: 'admin' as const,
    ipAddress: '127.0.0.1',
    userAgent: 'test',
  };

  it('accepts only whole-number ratings from one to five', () => {
    expect(adminPublishedTrackerRatingSchema.parse({ rating: 5 })).toEqual({ rating: 5 });
    expect(() => adminPublishedTrackerRatingSchema.parse({ rating: 0 })).toThrow();
    expect(() => adminPublishedTrackerRatingSchema.parse({ rating: 4.5 })).toThrow();
  });

  it('delegates canonical likes and ratings with the administrator actor', async () => {
    const engagement = {
      id: 'tracker-id',
      likeCount: 10,
      ratingAverage: 4.5,
      ratingCount: 2,
      adminLiked: true,
      adminRating: 5,
    };
    const repository = {
      list: vi.fn(),
      listPublished: vi.fn(),
      likePublished: vi.fn().mockResolvedValue(engagement),
      ratePublished: vi.fn().mockResolvedValue(engagement),
      getDetail: vi.fn(),
      delete: vi.fn(),
    } as unknown as IAdminTrackersRepository;
    const mapper = new AdminTrackersMapper();
    const likeUseCase = new LikeAdminPublishedTrackerUseCase(repository, mapper);
    const rateUseCase = new RateAdminPublishedTrackerUseCase(repository, mapper);

    await expect(likeUseCase.execute('tracker-id', actor)).resolves.toEqual(engagement);
    await expect(rateUseCase.execute('tracker-id', 5, actor)).resolves.toEqual(engagement);
    expect(repository.likePublished).toHaveBeenCalledWith('tracker-id', actor);
    expect(repository.ratePublished).toHaveBeenCalledWith('tracker-id', 5, actor);
  });

  it('maps a missing published tracker to a safe not-found error', async () => {
    const repository = {
      list: vi.fn(),
      listPublished: vi.fn(),
      likePublished: vi.fn().mockResolvedValue(null),
      ratePublished: vi.fn(),
      getDetail: vi.fn(),
      delete: vi.fn(),
    } as unknown as IAdminTrackersRepository;

    await expect(
      new LikeAdminPublishedTrackerUseCase(repository, new AdminTrackersMapper()).execute(
        'missing-id',
        actor
      )
    ).rejects.toMatchObject({ statusCode: 404, code: 'PUBLISHED_TRACKER_NOT_FOUND' });
  });
});
