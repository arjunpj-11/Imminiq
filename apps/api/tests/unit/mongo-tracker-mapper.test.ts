import { Types } from 'mongoose';
import { describe, expect, it } from 'vitest';

import { MongoTrackerMapper } from '../../src/modules/user/trackers/infrastructure/repositories/shared/mongo-tracker.mapper';

describe('MongoTrackerMapper', () => {
  it('normalizes persistence identifiers before records cross the boundary', () => {
    const identifier = new Types.ObjectId();
    const mapper = new MongoTrackerMapper();

    const result = mapper.toDomainRecord<{
      _id: string;
      related: Array<{ _id: string }>;
    }>({
      _id: identifier,
      related: [{ _id: identifier }],
    });

    expect(result).toEqual({
      _id: identifier.toHexString(),
      related: [{ _id: identifier.toHexString() }],
    });
  });
});
