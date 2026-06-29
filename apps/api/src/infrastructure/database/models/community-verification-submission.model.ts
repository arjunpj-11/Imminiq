import mongoose, { Document, Schema } from 'mongoose'

export type CommunityVerificationSubmissionStatus =
  | 'open'
  | 'closed'
  | 'approved'
  | 'rejected'
  | 'expired'

export type CommunityVerificationConsensusChoice = 'pass' | 'fail'

export interface ICommunityVerificationSubmission extends Document {
  trackerId: mongoose.Types.ObjectId
  ownerId: mongoose.Types.ObjectId

  title: string
  category: string
  excerpt: string

  passVotes: number
  failVotes: number
  requiredVotes: number
  progress: number

  status: CommunityVerificationSubmissionStatus
  urgent: boolean
  consensusChoice?: CommunityVerificationConsensusChoice | null

  expiresAt?: Date | null
  deletedAt?: Date | null

  createdAt: Date
  updatedAt: Date
}

const communityVerificationSubmissionSchema =
  new Schema<ICommunityVerificationSubmission>(
    {
      trackerId: {
        type: Schema.Types.ObjectId,
        ref: 'Tracker',
        required: true,
        index: true,
      },

      ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
      },

      title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 160,
      },

      category: {
        type: String,
        default: 'general',
        trim: true,
        lowercase: true,
        index: true,
      },

      excerpt: {
        type: String,
        default: '',
        trim: true,
        maxlength: 280,
      },

      passVotes: {
        type: Number,
        default: 0,
        min: 0,
      },

      failVotes: {
        type: Number,
        default: 0,
        min: 0,
      },

      requiredVotes: {
        type: Number,
        default: 10,
        min: 1,
      },

      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

      status: {
        type: String,
        enum: ['open', 'closed', 'approved', 'rejected', 'expired'],
        default: 'open',
        index: true,
      },

      urgent: {
        type: Boolean,
        default: false,
        index: true,
      },

      consensusChoice: {
        type: String,
        enum: ['pass', 'fail'],
        default: null,
      },

      expiresAt: {
        type: Date,
        default: null,
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
      collection: 'community_verification_submissions',
    },
  )

communityVerificationSubmissionSchema.index({ status: 1, expiresAt: 1 })
communityVerificationSubmissionSchema.index({ ownerId: 1, status: 1 })
communityVerificationSubmissionSchema.index({ category: 1, status: 1 })

communityVerificationSubmissionSchema.index(
  { trackerId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: 'open',
      deletedAt: null,
    },
  },
)

export const CommunityVerificationSubmission =
  mongoose.models.CommunityVerificationSubmission ||
  mongoose.model<ICommunityVerificationSubmission>(
    'CommunityVerificationSubmission',
    communityVerificationSubmissionSchema,
  )