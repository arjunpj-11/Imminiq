import { Types } from "mongoose";

import { TrackerDomainError } from "../../../domain/tracker-domain.error";
import type {
  SubtopicWithProgressRecord,
  TopicWithProgressRecord,
} from "../../../domain/trackers.types";
import type {
  MongoLessonVisualizationRecord,
  MongoQuery,
  MongoSortOrder,
  MongoSubtopicContentRecord,
  MongoSubtopicProgressRecord,
  MongoTopicContentRecord,
  MongoTopicProgressRecord,
  MongoTrackerSortBy,
  StreakIntensityLevel,
} from "./mongo-tracker.types";

export class MongoTrackerMapper {
  toDomainRecord<T>(value: unknown): T {
    return this.normalizePersistenceValue(value) as T
  }

  private normalizePersistenceValue(value: unknown): unknown {
    if (value instanceof Types.ObjectId) {
      return value.toHexString()
    }

    if (value instanceof Date || value === null || value === undefined) {
      return value
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.normalizePersistenceValue(item))
    }

    if (typeof value === 'object') {
      const document = value as { toObject?: () => unknown }
      const plainValue = typeof document.toObject === 'function'
        ? document.toObject()
        : value

      return Object.fromEntries(
        Object.entries(plainValue as Record<string, unknown>).map(([key, item]) => [
          key,
          this.normalizePersistenceValue(item),
        ]),
      )
    }

    return value
  }

  toObjectId(value: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new TrackerDomainError(
        "INVALID_OBJECT_ID",
        "Invalid tracker identifier",
      );
    }

    return new Types.ObjectId(value);
  }

  asMongoFilter(query: MongoQuery): never {
    return query as never;
  }

  asMongoUpdate(update: Record<string, unknown>): never {
    return update as never;
  }

  asMongoCreatePayload(payload: Record<string, unknown>): never {
    return payload as never;
  }

  buildTrackerSort(sortBy: MongoTrackerSortBy): Record<string, MongoSortOrder> {
    if (sortBy === "createdAt") return { createdAt: -1 };
    if (sortBy === "progress") return { progressPercent: -1, lastActiveAt: -1 };
    if (sortBy === "title") return { title: 1 };

    return { lastActiveAt: -1, updatedAt: -1 };
  }

  getUtcDayStart(date = new Date()): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }

  getPreviousUtcDayStart(date: Date): Date {
    const previous = new Date(date);
    previous.setUTCDate(previous.getUTCDate() - 1);

    return previous;
  }

  getIntensityLevel(activityCount: number): StreakIntensityLevel {
    if (activityCount <= 0) return "none";
    if (activityCount < 3) return "low";
    if (activityCount < 6) return "medium";

    return "high";
  }

  toSubtopicWithProgress(
    subtopic: MongoSubtopicContentRecord,
    progress?: MongoSubtopicProgressRecord | null,
  ): SubtopicWithProgressRecord {
    const defaultStatus = subtopic.isLocked ? "locked" : "available";

    return {
      _id: subtopic._id.toHexString(),
      trackerId: subtopic.trackerId.toHexString(),
      topicId: subtopic.topicId.toHexString(),
      parentSubtopicId: subtopic.parentSubtopicId?.toHexString() ?? null,
      title: subtopic.title,
      description: subtopic.description,
      order: subtopic.order,
      depth: subtopic.depth,
      isLocked: Boolean(subtopic.isLocked),
      estimatedMinutes: subtopic.estimatedMinutes || 0,
      status: (progress?.status ??
        defaultStatus) as SubtopicWithProgressRecord["status"],
      isUnlocked: progress ? Boolean(progress.isUnlocked) : !subtopic.isLocked,
      progressPercent: progress?.progressPercent ?? 0,
      completedAt: progress?.completedAt ?? null,
    };
  }

  toTopicWithProgress(
    topic: MongoTopicContentRecord,
    progress?: MongoTopicProgressRecord | null,
  ): TopicWithProgressRecord {
    return {
      ...topic,
      _id: topic._id.toHexString(),
      status: progress?.status ?? "active",
      progressPercent: progress?.progressPercent ?? 0,
    } as TopicWithProgressRecord;
  }

  toLessonVisualizationView(doc: MongoLessonVisualizationRecord | null): {
    html: string;
    visualTitle: string;
    visualDescription: string;
  } | null {
    if (!doc) {
      return null;
    }

    return {
      html: String(doc.html ?? ""),
      visualTitle: String(doc.visualTitle ?? ""),
      visualDescription: String(doc.visualDescription ?? ""),
    };
  }
}
