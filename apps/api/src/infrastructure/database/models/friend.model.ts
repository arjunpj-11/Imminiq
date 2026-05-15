import mongoose, {
  Schema,
  model,
  type InferSchemaType,
} from 'mongoose'

const friendSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    friendId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'friends',
  }
)

friendSchema.index({ userId: 1, friendId: 1, deletedAt: 1 })

export type FriendDocument = InferSchemaType<typeof friendSchema>

export const Friend = mongoose.models.Friend || model('Friend', friendSchema)
