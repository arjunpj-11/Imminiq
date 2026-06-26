import type { CommunityPublicTrackerDetailEntity } from '../../domain/entities/community-public-tracker-detail.entity'
import type { CommunityTrackerReviewEntity } from '../../domain/entities/community-tracker-review.entity'
import type {
  CommunityPublicTrackerDetailView,
  CommunityTrackerReviewView,
} from '../dtos/community-review.dto'

export interface CommunityReviewMapperContract {
  toReviewView(entity: CommunityTrackerReviewEntity): CommunityTrackerReviewView
  toPublicTrackerDetailView(
    entity: CommunityPublicTrackerDetailEntity,
  ): CommunityPublicTrackerDetailView
}

export class CommunityReviewMapper implements CommunityReviewMapperContract {
  toReviewView(entity: CommunityTrackerReviewEntity): CommunityTrackerReviewView {
    return {
      _id: entity.id,
      trackerId: entity.trackerId,
      userId: entity.userId,
      author: {
        _id: entity.userId,
        name: entity.authorName,
        initials: entity.authorInitials,
        avatarUrl: entity.authorAvatarUrl ?? null,
        role: entity.isMine ? 'You' : 'Community learner',
      },
      rating: entity.rating,
      comment: entity.comment,
      helpfulCount: entity.helpfulCount,
      helpfulByMe: entity.helpfulByMe,
      isMine: entity.isMine,
      createdAt: this.toIso(entity.createdAt),
      updatedAt: this.toIso(entity.updatedAt),
    }
  }

  toPublicTrackerDetailView(
    entity: CommunityPublicTrackerDetailEntity,
  ): CommunityPublicTrackerDetailView {
    return {
      _id: entity.id,
      ownerId: entity.ownerId,
      title: entity.title,
      description: entity.description,
      category: entity.category,
      field: entity.field,
      goal: entity.goal,
      level: entity.level,
      tags: entity.tags,
      verified: entity.verified,
      visibility: entity.visibility,
      status: entity.status,
      allowClone: entity.allowClone,
      inDashboard: entity.inDashboard,
      clones: entity.clones,
      likes: entity.likes,
      likedByMe: entity.likedByMe,
      saves: entity.saves,
      topicsCount: entity.topicsCount,
      subtopicsCount: entity.subtopicsCount,
      author: {
        _id: entity.author.id,
        name: entity.author.name,
        initials: entity.author.initials,
        avatarUrl: entity.author.avatarUrl ?? null,
        role: entity.author.role,
      },
      topics: entity.topics.map((topic) => ({
        _id: topic.id,
        title: topic.title,
        description: topic.description,
        order: topic.order,
        status: topic.status,
        estimatedHours: topic.estimatedHours,
        subtopics: topic.subtopics.map((subtopic) => ({
          _id: subtopic.id,
          topicId: subtopic.topicId,
          parentSubtopicId: subtopic.parentSubtopicId ?? null,
          title: subtopic.title,
          description: subtopic.description,
          order: subtopic.order,
          depth: subtopic.depth,
          isLocked: subtopic.isLocked,
          estimatedMinutes: subtopic.estimatedMinutes,
        })),
      })),
      ratingSummary: {
        average: Number(entity.ratingSummary.average.toFixed(1)),
        count: entity.ratingSummary.count,
        distribution: entity.ratingSummary.distribution,
      },
      reviews: entity.reviews.map((review) => this.toReviewView(review)),
      myReview: entity.myReview ? this.toReviewView(entity.myReview) : null,
      createdAt: this.toIso(entity.createdAt),
      publishedAt: this.toIsoOrNull(entity.publishedAt),
    }
  }

  private toIso(value?: Date): string | undefined {
    return value ? value.toISOString() : undefined
  }

  private toIsoOrNull(value?: Date | null): string | null {
    return value ? value.toISOString() : null
  }
}