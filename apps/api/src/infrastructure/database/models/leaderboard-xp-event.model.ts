import mongoose, { Document, Schema } from 'mongoose'

export interface ILeaderboardXpEventDocument extends Document {
  userId: mongoose.Types.ObjectId
  section: 'students' | 'trainers'
  amount: number
  source: string
  idempotencyKey: string
  sourceEntityId?: string
  occurredAt: Date
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const leaderboardXpEventSchema = new Schema<ILeaderboardXpEventDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    section: {
      type: String,
      enum: ['students', 'trainers'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: 'XP amount must be an integer',
      },
    },
    source: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    idempotencyKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    sourceEntityId: {
      type: String,
      trim: true,
      maxlength: 160,
      default: undefined,
    },
    occurredAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  {
    timestamps: true,
  },
)

leaderboardXpEventSchema.index(
  {
    idempotencyKey: 1,
  },
  {
    unique: true,
  },
)

leaderboardXpEventSchema.index({
  section: 1,
  occurredAt: 1,
  userId: 1,
})

leaderboardXpEventSchema.index({
  userId: 1,
  section: 1,
  occurredAt: -1,
})

export const LeaderboardXpEvent =
  mongoose.models.LeaderboardXpEvent ||
  mongoose.model<ILeaderboardXpEventDocument>(
    'LeaderboardXpEvent',
    leaderboardXpEventSchema,
  )
