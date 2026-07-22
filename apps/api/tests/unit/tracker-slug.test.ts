import { describe, expect, it } from 'vitest';

import { createUniqueTrackerSlug } from '../../src/modules/user/trackers/infrastructure/repositories/shared/tracker-slug';

describe('createUniqueTrackerSlug', () => {
  it('creates a readable slug with a unique tracker id suffix', () => {
    expect(createUniqueTrackerSlug('React & TypeScript', '507f1f77bcf86cd799439011')).toBe(
      'react-typescript-99439011'
    );
  });

  it('supports duplicate and non-latin titles without producing an empty slug', () => {
    expect(createUniqueTrackerSlug('日本語', '507f1f77bcf86cd799439012')).toBe('tracker-99439012');
    expect(createUniqueTrackerSlug('日本語', '507f1f77bcf86cd799439013')).toBe('tracker-99439013');
  });
});
