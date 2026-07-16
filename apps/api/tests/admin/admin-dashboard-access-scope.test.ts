import { describe, expect, it, vi } from 'vitest';

import { AdminDashboardMapper } from '../../src/modules/admin/dashboard/application/admin-dashboard.mapper';
import { GetAdminDashboardUseCase } from '../../src/modules/admin/dashboard/application/use-cases/get-admin-dashboard.usecase';
import type { IAdminDashboardRepository } from '../../src/modules/admin/dashboard/domain/repositories/admin-dashboard.repository.interface';

const overview = {
  metrics: {
    totalUsers: 120,
    verifiedUsers: 110,
    unverifiedUsers: 10,
    activeToday: 45,
    blockedUsers: 3,
    suspendedUsers: 2,
    totalTrackers: 80,
    openQuestionReports: 7,
    reviewingQuestionReports: 2,
    urgentSupportTickets: 1,
    suspendedMockTests: 4,
    openTrackerReports: 5,
    suspendedTrackers: 2,
    overdueQuestionReports: 3,
    overdueTrackerReports: 1,
  },
  generatedAt: new Date(),
  weeklyActivity: [1, 2, 3, 4, 5, 6, 7],
  recentActivity: [
    {
      id: 'user-event',
      action: 'admin_user_blocked',
      module: 'admin.users',
      severity: 'warning',
      createdAt: new Date(),
      user: { fullName: 'Sensitive User', username: 'sensitive' },
    },
    {
      id: 'moderation-event',
      action: 'admin_mock_test_suspended',
      module: 'admin.mock-tests',
      severity: 'warning',
      createdAt: new Date(),
      user: { fullName: 'Content Owner', username: 'owner' },
    },
  ],
};

const createUseCase = () =>
  new GetAdminDashboardUseCase(
    { getOverview: vi.fn().mockResolvedValue(overview) } as IAdminDashboardRepository,
    new AdminDashboardMapper()
  );

describe('admin dashboard access scope', () => {
  it('redacts user-management metrics and activity for moderators', async () => {
    const result = await createUseCase().execute('moderator');

    expect(result.accessScope).toBe('moderation');
    expect(result.metrics).toMatchObject({
      totalUsers: 0,
      verifiedUsers: 0,
      unverifiedUsers: 0,
      activeToday: 0,
      blockedUsers: 0,
    });
    expect(result.recentActivity.map((item) => item.id)).toEqual(['moderation-event']);
  });

  it('keeps the complete operational view for administrators', async () => {
    const result = await createUseCase().execute('admin');

    expect(result.accessScope).toBe('full');
    expect(result.metrics.totalUsers).toBe(120);
    expect(result.recentActivity).toHaveLength(2);
  });
});
