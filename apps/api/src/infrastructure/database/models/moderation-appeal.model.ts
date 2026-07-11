import mongoose, { Document, Schema } from 'mongoose'

export interface ModerationAppealDocument extends Document {
  _id: mongoose.Types.ObjectId

  userId: mongoose.Types.ObjectId
  caseId: string

  identifier: string
  appealReason: string

  status: 'pending' | 'under_review' | 'approved' | 'rejected'

  reviewedBy?: mongoose.Types.ObjectId | null
  reviewNote?: string | null
  reviewedAt?: Date | null

  deletedAt?: Date | null

  createdAt: Date
  updatedAt: Date
}

const moderationAppealSchema = new Schema<ModerationAppealDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    caseId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    identifier: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    appealReason: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },

    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending',
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    reviewNote: {
      type: String,
      trim: true,
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

// ─── INDEXES ─────────────────────────────────────

moderationAppealSchema.index(
  { caseId: 1 },
  {
    unique: true,
  }
)

moderationAppealSchema.index({
  userId: 1,
  status: 1,
})

moderationAppealSchema.index({
  status: 1,
  createdAt: -1,
})

moderationAppealSchema.index({
  reviewedBy: 1,
  reviewedAt: -1,
})

moderationAppealSchema.index({
  deletedAt: 1,
})

export const ModerationAppeal = mongoose.model<ModerationAppealDocument>(
  'ModerationAppeal',
  moderationAppealSchema
)