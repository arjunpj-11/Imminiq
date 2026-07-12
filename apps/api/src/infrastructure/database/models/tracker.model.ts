import mongoose, { Document, Schema } from 'mongoose'

export type TrackerLevel = 'beginner' | 'intermediate' | 'advanced'

export type TrackerVisibility = 'private' | 'public' | 'unlisted'

export type TrackerStatus = 'draft' | 'active' | 'archived'

export type TrackerVerificationStatus = 'pending' | 'verified' | 'rejected'

export interface ITrackerDocument extends Document {
  ownerId: mongoose.Types.ObjectId

  title: string
  slug: string
  description: string

  category: string
  field: string
  goal: string

  level: TrackerLevel

  tags: string[]
  allowClone: boolean
  sourceTrackerId?: mongoose.Types.ObjectId | null

  visibility: TrackerVisibility
  status: TrackerStatus

  verificationStatus?: TrackerVerificationStatus | null
  verifiedAt?: Date | null

  isAIGenerated: boolean
  aiJobId?: mongoose.Types.ObjectId

  coverImageUrl?: string

  topicsCount: number
  subtopicsCount: number

  cloneCount: number
  likeCount: number
  saveCount: number

  progressPercent: number

  ratingAverage: number
  ratingCount: number

  publishedAt?: Date
  deletedAt?: Date | null

  createdAt: Date
  updatedAt: Date
}

const trackerSchema = new Schema<ITrackerDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    category: {
      type: String,
      default: 'general',
      trim: true,
    },

    field: {
      type: String,
      default: '',
      trim: true,
    },

    goal: {
      type: String,
      default: '',
      trim: true,
    },

    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },

    tags: {
      type: [String],
      default: [],
      set: (tags: unknown[]) =>
        Array.isArray(tags)
          ? tags
              .map((tag) => String(tag).trim().toLowerCase())
              .filter(Boolean)
          : [],
    },

    allowClone: {
      type: Boolean,
      default: true,
    },

    sourceTrackerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tracker',
      default: null,
    },

    visibility: {
      type: String,
      enum: ['private', 'public', 'unlisted'],
      default: 'private',
    },

    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },

    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: null,
      index: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    isAIGenerated: {
      type: Boolean,
      default: false,
    },

    aiJobId: {
      type: Schema.Types.ObjectId,
      ref: 'AIGenerationJob',
    },

    coverImageUrl: {
      type: String,
      default: '',
      trim: true,
    },

    topicsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    subtopicsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    cloneCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    saveCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    publishedAt: {
      type: Date,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

trackerSchema.index({ ownerId: 1, status: 1 })
trackerSchema.index({ visibility: 1, status: 1 })
trackerSchema.index({ visibility: 1, publishedAt: -1 })
trackerSchema.index({ field: 1 })
trackerSchema.index({ category: 1 })
trackerSchema.index({ level: 1 })
trackerSchema.index({ tags: 1 })
trackerSchema.index({ sourceTrackerId: 1 })
trackerSchema.index({ verificationStatus: 1, visibility: 1 })
trackerSchema.index(
  { ownerId: 1, sourceTrackerId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      sourceTrackerId: { $type: 'objectId' },
      deletedAt: null,
    },
  },
)

export const Tracker =
  mongoose.models.Tracker || mongoose.model<ITrackerDocument>('Tracker', trackerSchema)
