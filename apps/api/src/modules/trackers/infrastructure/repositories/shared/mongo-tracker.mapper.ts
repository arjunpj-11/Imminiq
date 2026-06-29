import { Types } from "mongoose";

import { TrackerDomainError } from "../../../domain/errors/tracker-domain.error";
import type {
  SubtopicWithProgressRecord,
  TopicWithProgressRecord,
} from "../../../domain/types/trackers.types";
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
      _id: subtopic._id,
      trackerId: subtopic.trackerId,
      topicId: subtopic.topicId,
      parentSubtopicId: subtopic.parentSubtopicId ?? null,
      title: subtopic.title,
      description: subtopic.description,
      order: subtopic.order,
      depth: subtopic.depth,
      isLocked: subtopic.isLocked,
      estimatedMinutes: subtopic.estimatedMinutes || 0,
      status: (progress?.status ??
        defaultStatus) as SubtopicWithProgressRecord["status"],
      isUnlocked: progress ? Boolean(progress.isUnlocked) : !subtopic.isLocked,
      progressPercent: progress?.progressPercent ?? 0,
      completedAt: progress?.completedAt ?? null,
    } as SubtopicWithProgressRecord;
  }

  toTopicWithProgress(
    topic: MongoTopicContentRecord,
    progress?: MongoTopicProgressRecord | null,
  ): TopicWithProgressRecord {
    return {
      ...topic,
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
