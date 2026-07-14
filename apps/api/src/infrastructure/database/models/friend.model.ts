import mongoose, { Schema, model, type InferSchemaType } from 'mongoose';

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
      validate: {
        validator(this: { userId?: mongoose.Types.ObjectId }, value: mongoose.Types.ObjectId) {
          return !this.userId || this.userId.toString() !== value.toString();
        },
        message: 'A user cannot be their own friend',
      },
    },

    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
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
    collection: 'friends',
  }
);

// One active directional relationship may exist only once.
// Accepted friendships are stored in both directions: A -> B and B -> A.
friendSchema.index(
  {
    userId: 1,
    friendId: 1,
  },
  {
    unique: true,
    name: 'unique_active_friend_relationship',
    partialFilterExpression: {
      deletedAt: null,
    },
  }
);

friendSchema.index({
  userId: 1,
  status: 1,
  deletedAt: 1,
  createdAt: -1,
});

friendSchema.index({
  friendId: 1,
  status: 1,
  deletedAt: 1,
});

export type FriendDocument = InferSchemaType<typeof friendSchema>;

export const Friend: mongoose.Model<FriendDocument> =
  (mongoose.models.Friend as mongoose.Model<FriendDocument> | undefined) ??
  model<FriendDocument>('Friend', friendSchema);
