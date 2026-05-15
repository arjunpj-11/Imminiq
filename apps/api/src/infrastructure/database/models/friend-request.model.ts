import mongoose, {
  Schema,
  model,
  type InferSchemaType,
} from 'mongoose'

const friendRequestSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
      index: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 280,
      default: '',
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'friend_requests',
  }
)

friendRequestSchema.index({
  senderId: 1,
  receiverId: 1,
  status: 1,
  deletedAt: 1,
})

export type FriendRequestDocument = InferSchemaType<typeof friendRequestSchema>

export const FriendRequest =
  mongoose.models.FriendRequest || model('FriendRequest', friendRequestSchema)
