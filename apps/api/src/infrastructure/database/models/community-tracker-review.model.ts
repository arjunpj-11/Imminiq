import mongoose, { Document, Schema } from 'mongoose'

export interface CommunityTrackerReviewSchemaFields extends Document {
  trackerId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  rating: number
  comment: string
  helpfulUserIds: mongoose.Types.ObjectId[]
  helpfulCount: number
  deletedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const communityTrackerReviewSchema = new Schema<CommunityTrackerReviewSchemaFields>(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1200,
    },
    helpfulUserIds: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'community_tracker_reviews',
  },
)

communityTrackerReviewSchema.index({ trackerId: 1, createdAt: -1 })
communityTrackerReviewSchema.index({ trackerId: 1, helpfulCount: -1 })
communityTrackerReviewSchema.index({ userId: 1, createdAt: -1 })
communityTrackerReviewSchema.index(
  { trackerId: 1, userId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      deletedAt: null,
    },
  },
)

type CommunityTrackerReviewDocument =
  mongoose.HydratedDocument<CommunityTrackerReviewSchemaFields>

communityTrackerReviewSchema.pre('save', function (
  this: CommunityTrackerReviewDocument,
) {
  this.helpfulCount = Array.isArray(this.helpfulUserIds)
    ? this.helpfulUserIds.length
    : 0
})

export const CommunityTrackerReview =
  mongoose.models.CommunityTrackerReview ||
  mongoose.model<CommunityTrackerReviewSchemaFields>(
    'CommunityTrackerReview',
    communityTrackerReviewSchema,
  )
