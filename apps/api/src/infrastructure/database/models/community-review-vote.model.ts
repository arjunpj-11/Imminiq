import mongoose, { Document, Schema } from 'mongoose'

export type CommunityReviewVoteChoice = 'pass' | 'fail'

export interface ICommunityReviewVoteDocument extends Document {
  submissionId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  choice: CommunityReviewVoteChoice
  reason?: string | null
  rewardCoins: number
  createdAt: Date
  updatedAt: Date
}

const communityReviewVoteSchema = new Schema<ICommunityReviewVoteDocument>(
  {
    submissionId: {
      type: Schema.Types.ObjectId,
      ref: 'CommunityVerificationSubmission',
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    choice: {
      type: String,
      enum: ['pass', 'fail'],
      required: true,
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null,
    },

    rewardCoins: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'community_review_votes',
  },
)

communityReviewVoteSchema.index(
  { submissionId: 1, userId: 1 },
  { unique: true },
)
communityReviewVoteSchema.index({ userId: 1, createdAt: -1 })
communityReviewVoteSchema.index({ rewardCoins: -1 })

export const CommunityReviewVote =
  mongoose.models.CommunityReviewVote ||
  mongoose.model<ICommunityReviewVoteDocument>(
    'CommunityReviewVote',
    communityReviewVoteSchema,
  )
