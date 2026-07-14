import { describe, expect, it } from 'vitest';

import {
  PLATFORM_POLICY_DEFAULTS,
  resolvePlatformPolicy,
  type PlatformPolicy,
} from '../../src/shared/platform-policy';
import { adminSettingsSchema } from '../../src/modules/admin/settings/presentation/admin-settings.schema';

describe('admin-managed platform policy', () => {
  it('fills missing legacy settings from the code fallback without mutating it', () => {
    const resolved = resolvePlatformPolicy({
      activity: { weeklyXpTarget: 8_000 },
    } as Partial<PlatformPolicy>);

    expect(resolved.activity).toEqual({
      weeklyXpTarget: 8_000,
      dailyGoalRewardXp: PLATFORM_POLICY_DEFAULTS.activity.dailyGoalRewardXp,
    });
    expect(resolved.community).toEqual(PLATFORM_POLICY_DEFAULTS.community);

    resolved.community.reviewRewardCoins = 999;
    expect(PLATFORM_POLICY_DEFAULTS.community.reviewRewardCoins).toBe(50);
  });

  it('rejects unsafe policy values at the admin boundary', () => {
    expect(() =>
      adminSettingsSchema.parse({
        maintenanceMode: false,
        allowBroadcasts: true,
        supportEmail: 'support@imminiq.com',
        auditRetentionDays: 365,
        productPolicy: {
          ...PLATFORM_POLICY_DEFAULTS,
          community: {
            ...PLATFORM_POLICY_DEFAULTS.community,
            verificationRequiredVotes: 51,
          },
        },
      })
    ).toThrow();
  });
});
