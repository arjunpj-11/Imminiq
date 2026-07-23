import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), 'src/modules/admin', relativePath), 'utf8').replace(
    /\s+/g,
    ' '
  );

describe('admin mutation step-up route policy', () => {
  it.each([
    [
      'broadcast/presentation/admin-broadcast.routes.ts',
      /router\.post\([^;]*requirePrivilegedMfa[^;]*controller\.send/,
    ],
    [
      'support-tickets/presentation/admin-support-tickets.routes.ts',
      /router\.patch\([^;]*requirePrivilegedMfa[^;]*controller\.update/,
    ],
    [
      'users/presentation/admin-users.routes.ts',
      /router\.post\(ADMIN_USERS_ROUTE_PATHS\.NOTES, requirePrivilegedMfa/,
    ],
    [
      'users/presentation/admin-users.routes.ts',
      /router\.delete\(ADMIN_USERS_ROUTE_PATHS\.NOTE_DETAIL, requirePrivilegedMfa/,
    ],
    [
      'users/presentation/admin-users.routes.ts',
      /router\.put\(ADMIN_USERS_ROUTE_PATHS\.TAGS, requirePrivilegedMfa/,
    ],
    [
      'users/presentation/admin-users.routes.ts',
      /router\.post\(ADMIN_USERS_ROUTE_PATHS\.MESSAGE, requirePrivilegedMfa/,
    ],
    [
      'users/presentation/admin-users.routes.ts',
      /ADMIN_USERS_ROUTE_PATHS\.ACTION_PASSWORD, requireSuperAdmin, requirePrivilegedMfa/,
    ],
    [
      'trackers/presentation/admin-trackers.routes.ts',
      /ADMIN_TRACKERS_ROUTE_PATHS\.REVIEW_CONSENSUS, requireAdminPermission\('content:moderate'\), requirePrivilegedMfa/,
    ],
    [
      'trackers/presentation/admin-trackers.routes.ts',
      /ADMIN_TRACKERS_ROUTE_PATHS\.REVIEW_STATUS, requireAdminPermission\('content:moderate'\), requirePrivilegedMfa/,
    ],
  ])('%s keeps the required action-password middleware', (file, policy) => {
    expect(source(file)).toMatch(policy as RegExp);
  });
});
