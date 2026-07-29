import { describe, expect, it } from 'vitest';

import { getRouteName } from '../../../src/components/system/route-experience-metadata';

describe('route experience metadata', () => {
  it.each([
    ['/', 'Imminiq'],
    ['/forgot-password', 'Password recovery'],
    ['/verify-account', 'Verify account'],
    ['/reset-password', 'Reset password'],
    ['/verify-email-change', 'Verify email change'],
    ['/two-factor-challenge', 'Two-step verification'],
    ['/blocked', 'Account restricted'],
    ['/offline', 'Offline'],
    ['/notifications', 'Notifications'],
    ['/saved', 'Saved'],
    ['/verify-and-earn', 'Verify and earn'],
    ['/leaderboard/rewards', 'Leaderboard rewards'],
    ['/trackers/published', 'Published trackers'],
    ['/trackers/tracker-1/manage', 'Manage tracker'],
    ['/trackers/tracker-1/clan', 'Tracker guild'],
    ['/trackers/tracker-1/clan/challenges/challenge-1', 'Guild battle'],
    ['/mock-tests/attempts/attempt-1', 'Mock test attempt'],
    ['/mock-tests/attempts/attempt-1/result', 'Mock test result'],
    ['/admin/support', 'Support tickets · Admin'],
  ])('names %s as %s', (pathname, expectedName) => {
    expect(getRouteName(pathname)).toBe(expectedName);
  });

  it('does not label unknown paths as valid pages by prefix alone', () => {
    expect(getRouteName('/login-pretender')).toBe('Page not found');
    expect(getRouteName('/admin/users/one/extra')).toBe('Page not found');
  });
});
