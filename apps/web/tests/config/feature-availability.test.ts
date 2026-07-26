import { describe, expect, it } from 'vitest';

import {
  FEATURE_AVAILABILITY_DEFAULTS,
  getRequiredFeaturesForPath,
  isPathAvailable,
} from '../../src/config/feature-availability';

describe('feature availability routing', () => {
  it.each([
    ['/trackers', ['trackers']],
    ['/trackers/create', ['trackers', 'trackerCreation']],
    ['/trackers/create/manual', ['trackers', 'trackerCreation']],
    ['/community/tracker-1', ['community']],
    ['/mock-tests/attempts/attempt-1', ['mockTests']],
    ['/chat?view=calls', ['social']],
    ['/activity', ['activity']],
    ['/saved', ['savedItems']],
  ])('maps %s to its required feature policy', (path, expected) => {
    expect(getRequiredFeaturesForPath(path)).toEqual(expected);
  });

  it('blocks a nested page when any required feature is paused', () => {
    expect(
      isPathAvailable('/trackers/create/manual', {
        ...FEATURE_AVAILABILITY_DEFAULTS,
        trackerCreation: false,
      })
    ).toBe(false);
  });

  it('leaves core account and notification pages available', () => {
    const allPaused = Object.fromEntries(
      Object.keys(FEATURE_AVAILABILITY_DEFAULTS).map((feature) => [feature, false])
    ) as typeof FEATURE_AVAILABILITY_DEFAULTS;

    expect(isPathAvailable('/settings/security', allPaused)).toBe(true);
    expect(isPathAvailable('/notifications', allPaused)).toBe(true);
  });
});
