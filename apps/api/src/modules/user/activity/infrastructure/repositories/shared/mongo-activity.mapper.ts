import {
  UserActivityEntity,
  type ActivityDetails,
} from '../../../domain/entities/user-activity.entity';
import { ActivityDomainError } from '../../../domain/activity-domain.error';
import type {
  MongoIdLike,
  MongoUserActivityRecord,
  MongooseObjectLike,
} from './mongo-activity.types';

export class MongoActivityMapper {
  toPlainRecord<T>(document: MongooseObjectLike<T>): T {
    return document.toObject();
  }

  toId(value: MongoIdLike | string): string {
    return typeof value === 'string' ? value : value.toString();
  }

  toOptionalId(value?: MongoIdLike | string | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    return this.toId(value);
  }

  toEntity(record: MongoUserActivityRecord | null): UserActivityEntity | null {
    if (!record) {
      return null;
    }

    return new UserActivityEntity({
      id: this.toId(record._id),
      userId: this.toId(record.userId),

      category: record.category,
      type: record.type,

      title: record.title,
      subtitle: record.subtitle ?? '',

      xpAwarded: Math.max(0, record.xpAwarded ?? 0),
      xpBucket: record.xpBucket ?? 'none',
      coinsAwarded: Math.max(0, record.coinsAwarded ?? 0),

      eventKey: record.eventKey,

      trackerId: this.toOptionalId(record.trackerId),
      topicId: this.toOptionalId(record.topicId),
      subtopicId: this.toOptionalId(record.subtopicId),
      mockTestId: this.toOptionalId(record.mockTestId),
      attemptId: this.toOptionalId(record.attemptId),
      sourceUserId: this.toOptionalId(record.sourceUserId),

      details: this.toDetails(record.details),

      occurredAt: record.occurredAt,
      deletedAt: record.deletedAt ?? null,

      ...(record.createdAt !== undefined ? { createdAt: record.createdAt } : {}),

      ...(record.updatedAt !== undefined ? { updatedAt: record.updatedAt } : {}),
    });
  }

  toEntityOrThrow(record: MongoUserActivityRecord | null): UserActivityEntity {
    const entity = this.toEntity(record);

    if (!entity) {
      throw new ActivityDomainError('ACTIVITY_MAPPING_FAILED', 'Failed to map user activity');
    }

    return entity;
  }

  private toDetails(details?: MongoUserActivityRecord['details']): ActivityDetails {
    if (!details) {
      return {};
    }

    return {
      ...(details.scorePercentage !== undefined
        ? {
            scorePercentage: details.scorePercentage,
          }
        : {}),

      ...(details.totalQuestions !== undefined
        ? {
            totalQuestions: details.totalQuestions,
          }
        : {}),

      ...(details.correctAnswers !== undefined
        ? {
            correctAnswers: details.correctAnswers,
          }
        : {}),

      ...(details.durationSeconds !== undefined
        ? {
            durationSeconds: details.durationSeconds,
          }
        : {}),

      ...(details.previousLevel !== undefined
        ? {
            previousLevel: details.previousLevel,
          }
        : {}),

      ...(details.currentLevel !== undefined
        ? {
            currentLevel: details.currentLevel,
          }
        : {}),

      ...(details.milestoneValue !== undefined
        ? {
            milestoneValue: details.milestoneValue,
          }
        : {}),

      ...(details.previousRank !== undefined
        ? {
            previousRank: details.previousRank,
          }
        : {}),

      ...(details.currentRank !== undefined
        ? {
            currentRank: details.currentRank,
          }
        : {}),

      ...(details.difficulty !== undefined
        ? {
            difficulty: details.difficulty,
          }
        : {}),
    };
  }
}
