import { describe, expect, it } from 'vitest';

import { ADMIN_ROUTE_ROLES, canAccessAdminRoute } from '../../../src/routes/config/admin-access';

describe('admin route access policy', () => {
  it('allows moderators only into content and support sections', () => {
    expect(canAccessAdminRoute(ADMIN_ROUTE_ROLES.dashboard, 'moderator')).toBe(true);
    expect(canAccessAdminRoute(ADMIN_ROUTE_ROLES.trackers, 'moderator')).toBe(true);
    expect(canAccessAdminRoute(ADMIN_ROUTE_ROLES.mockTests, 'moderator')).toBe(true);
    expect(canAccessAdminRoute(ADMIN_ROUTE_ROLES.supportTickets, 'moderator')).toBe(true);
    expect(canAccessAdminRoute(ADMIN_ROUTE_ROLES.users, 'moderator')).toBe(false);
    expect(canAccessAdminRoute(ADMIN_ROUTE_ROLES.settings, 'moderator')).toBe(false);
  });

  it('allows admins and superadmins into privileged sections', () => {
    for (const role of ['admin', 'superadmin'] as const) {
      expect(canAccessAdminRoute(ADMIN_ROUTE_ROLES.users, role)).toBe(true);
      expect(canAccessAdminRoute(ADMIN_ROUTE_ROLES.analytics, role)).toBe(true);
      expect(canAccessAdminRoute(ADMIN_ROUTE_ROLES.systemHealth, role)).toBe(true);
      expect(canAccessAdminRoute(ADMIN_ROUTE_ROLES.settings, role)).toBe(true);
    }
  });

  it('denies ordinary users and missing roles', () => {
    expect(canAccessAdminRoute(ADMIN_ROUTE_ROLES.dashboard, 'user')).toBe(false);
    expect(canAccessAdminRoute(ADMIN_ROUTE_ROLES.dashboard)).toBe(false);
  });
});
