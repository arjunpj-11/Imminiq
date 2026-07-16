import { describe, expect, it } from 'vitest';

import { MockTestsMapper } from '../../src/modules/user/mock-tests/application/mock-tests.mapper';
import { MockTestEntity } from '../../src/modules/user/mock-tests/domain/entities/mock-test.entity';

const createTestEntity = () =>
  new MockTestEntity({
    _id: 'test-1',
    ownerId: 'user-1',
    title: 'Public test',
    description: 'Mapped test',
    difficulty: 'medium',
    visibility: 'public',
    questionCount: 10,
    timeLimitMinutes: 30,
    passingScore: 60,
    isAIGenerated: false,
    tags: ['typescript'],
    shareToken: 'private-share-capability',
    isShareEnabled: true,
    cloneCount: 0,
    averageScore: 0,
    attemptCount: 0,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  });

describe('mock-test DTO mapping', () => {
  it('removes share capabilities from public test responses', () => {
    const mapper = new MockTestsMapper();
    const result = mapper.toPublicListDto({
      tests: [createTestEntity()],
      total: 1,
    });

    expect(result.total).toBe(1);
    expect(result.tests[0]).not.toHaveProperty('shareToken');
    expect(result.tests[0]).toMatchObject({
      _id: 'test-1',
      title: 'Public test',
    });
  });
});
