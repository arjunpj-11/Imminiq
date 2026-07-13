export type CommunityTrackerReviewEntityProps = {
  id: string;
  trackerId: string;
  userId: string;
  authorName: string;
  authorInitials: string;
  authorAvatarUrl?: string | null;
  rating: number;
  comment: string;
  helpfulCount: number;
  helpfulByMe: boolean;
  isMine: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export class CommunityTrackerReviewEntity {
  readonly id: string;
  readonly trackerId: string;
  readonly userId: string;
  readonly authorName: string;
  readonly authorInitials: string;
  readonly authorAvatarUrl?: string | null;
  readonly rating: number;
  readonly comment: string;
  readonly helpfulCount: number;
  readonly helpfulByMe: boolean;
  readonly isMine: boolean;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;

  constructor(props: CommunityTrackerReviewEntityProps) {
    this.id = props.id;
    this.trackerId = props.trackerId;
    this.userId = props.userId;
    this.authorName = props.authorName;
    this.authorInitials = props.authorInitials;
    this.authorAvatarUrl = props.authorAvatarUrl ?? null;
    this.rating = props.rating;
    this.comment = props.comment;
    this.helpfulCount = props.helpfulCount;
    this.helpfulByMe = props.helpfulByMe;
    this.isMine = props.isMine;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}
