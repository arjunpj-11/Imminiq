import mongoose, {
  Schema,
  model,
  type InferSchemaType,
} from 'mongoose'

const userBadgeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    badgeId: {
      type: Schema.Types.ObjectId,
      ref: 'Badge',
      required: true,
      index: true,
    },
    earnedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'user_badges',
  }
)

userBadgeSchema.index({ userId: 1, badgeId: 1 }, { unique: true })

export type UserBadgeDocument = InferSchemaType<typeof userBadgeSchema>

export const UserBadge =
  mongoose.models.UserBadge || model('UserBadge', userBadgeSchema)
