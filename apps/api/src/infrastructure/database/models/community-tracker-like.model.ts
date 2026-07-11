import mongoose, { Schema } from 'mongoose'

export interface CommunityTrackerLikeDocument {
  trackerId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  deletedAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
}

const communityTrackerLikeSchema = new Schema<CommunityTrackerLikeDocument>(
  {
    trackerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tracker',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'community_tracker_likes',
  },
)

communityTrackerLikeSchema.index(
  {
    trackerId: 1,
    userId: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      deletedAt: null,
    },
  },
)

export const CommunityTrackerLike =
  mongoose.models.CommunityTrackerLike ||
  mongoose.model<CommunityTrackerLikeDocument>(
    'CommunityTrackerLike',
    communityTrackerLikeSchema,
  )