import { describe, expect, it } from 'vitest';

import {
  getTemporaryAdminNavItem,
  getTemporaryUserNavItem,
} from '../../src/lib/current-page-navigation';

describe('temporary current-page navigation', () => {
  it('adds user pages that are not represented in the standard navigation', () => {
    expect(getTemporaryUserNavItem('/profile', '?tab=posts', '#latest')).toEqual({
      label: 'Profile',
      to: '/profile?tab=posts#latest',
    });
    expect(getTemporaryUserNavItem('/notifications')).toEqual({
      label: 'Notifications',
      to: '/notifications',
    });
    expect(getTemporaryUserNavItem('/chat', '?view=chats')).toEqual({
      label: 'Social',
      to: '/chat?view=chats',
    });
  });

  it('does not duplicate a standard item for one of its child pages', () => {
    expect(getTemporaryUserNavItem('/trackers/published')).toBeNull();
    expect(getTemporaryUserNavItem('/mock-tests/test-123')).toBeNull();
    expect(getTemporaryAdminNavItem('/admin/users/user-123')).toBeNull();
  });

  it('never creates a temporary settings item', () => {
    expect(getTemporaryUserNavItem('/settings/privacy')).toBeNull();
    expect(getTemporaryAdminNavItem('/admin/settings')).toBeNull();
  });

  it('supports future admin pages that have no registered navigation item', () => {
    expect(getTemporaryAdminNavItem('/admin/reports')).toEqual({
      label: 'Reports',
      to: '/admin/reports',
    });
  });
});
