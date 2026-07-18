import type mongoose from 'mongoose';

import type { ActivityTimeRange } from '../../../domain/activity.types';
import type { ActivityCategory } from '../../../domain/value-objects/activity-category.vo';

export class MongoActivityFilterBuilder {
  static activeByUser(userId: mongoose.Types.ObjectId): Record<string, unknown> {
    return {
      userId,
      deletedAt: null,
    };
  }

  static dateRange(range: ActivityTimeRange): Record<string, Date> {
    return {
      $gte: range.start,
      $lt: range.end,
    };
  }

  static feed(input: {
    userId: mongoose.Types.ObjectId;
    categories?: ActivityCategory[];
    beforeOccurredAt?: Date;
    beforeId?: mongoose.Types.ObjectId;
  }): Record<string, unknown> {
    return {
      ...this.activeByUser(input.userId),

      ...(input.categories && input.categories.length > 0
        ? {
            category: {
              $in: input.categories,
            },
          }
        : {}),

      ...(input.beforeOccurredAt && input.beforeId
        ? {
            $or: [
              {
                occurredAt: {
                  $lt: input.beforeOccurredAt,
                },
              },
              {
                occurredAt: input.beforeOccurredAt,
                _id: {
                  $lt: input.beforeId,
                },
              },
            ],
          }
        : {}),
    };
  }
}
