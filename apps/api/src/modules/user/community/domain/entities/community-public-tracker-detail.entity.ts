import type { CommunityTrackerReviewEntity } from './community-tracker-review.entity';

export type CommunityPublicTrackerSubtopicEntity = {
  id: string;
  topicId: string;
  parentSubtopicId?: string | null;
  title: string;
  description: string;
  order: number;
  depth: number;
  isLocked: boolean;
  estimatedMinutes: number;
};

export type CommunityPublicTrackerTopicEntity = {
  id: string;
  title: string;
  description: string;
  order: number;
  status: string;
  estimatedHours: number;
  subtopics: CommunityPublicTrackerSubtopicEntity[];
};

export type CommunityRatingDistributionEntity = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

export type CommunityRatingSummaryEntity = {
  average: number;
  count: number;
  distribution: CommunityRatingDistributionEntity;
};

export type CommunityPublicTrackerAuthorEntity = {
  id: string;
  name: string;
  username: string;
  initials: string;
  avatarUrl?: string | null;
  role: string;
};

export type CommunityPublicTrackerDetailEntityProps = {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  category: string;
  field: string;
  goal: string;
  level: string;
  tags: string[];
  verified: boolean;
  visibility: string;
  status: string;
  allowClone: boolean;
  inDashboard: boolean;
  clones: number;
  likes: number;
  likedByMe: boolean;
  saves: number;
  topicsCount: number;
  subtopicsCount: number;
  author: CommunityPublicTrackerAuthorEntity;
  topics: CommunityPublicTrackerTopicEntity[];
  ratingSummary: CommunityRatingSummaryEntity;
  reviews: CommunityTrackerReviewEntity[];
  myReview?: CommunityTrackerReviewEntity | null;
  createdAt?: Date;
  publishedAt?: Date | null;
};

export class CommunityPublicTrackerDetailEntity {
  readonly id: string;
  readonly ownerId: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly field: string;
  readonly goal: string;
  readonly level: string;
  readonly tags: string[];
  readonly verified: boolean;
  readonly visibility: string;
  readonly status: string;
  readonly allowClone: boolean;
  readonly inDashboard: boolean;
  readonly clones: number;
  readonly likes: number;
  readonly likedByMe: boolean;
  readonly saves: number;
  readonly topicsCount: number;
  readonly subtopicsCount: number;
  readonly author: CommunityPublicTrackerAuthorEntity;
  readonly topics: CommunityPublicTrackerTopicEntity[];
  readonly ratingSummary: CommunityRatingSummaryEntity;
  readonly reviews: CommunityTrackerReviewEntity[];
  readonly myReview?: CommunityTrackerReviewEntity | null;
  readonly createdAt?: Date;
  readonly publishedAt?: Date | null;

  constructor(props: CommunityPublicTrackerDetailEntityProps) {
    this.id = props.id;
    this.ownerId = props.ownerId;
    this.title = props.title;
    this.description = props.description;
    this.category = props.category;
    this.field = props.field;
    this.goal = props.goal;
    this.level = props.level;
    this.tags = props.tags;
    this.verified = props.verified;
    this.visibility = props.visibility;
    this.status = props.status;
    this.allowClone = props.allowClone;
    this.inDashboard = props.inDashboard;
    this.clones = props.clones;
    this.likes = props.likes;
    this.likedByMe = props.likedByMe;
    this.saves = props.saves;
    this.topicsCount = props.topicsCount;
    this.subtopicsCount = props.subtopicsCount;
    this.author = props.author;
    this.topics = props.topics;
    this.ratingSummary = props.ratingSummary;
    this.reviews = props.reviews;
    this.myReview = props.myReview ?? null;
    this.createdAt = props.createdAt;
    this.publishedAt = props.publishedAt ?? null;
  }
}
