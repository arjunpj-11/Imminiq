import mongoose, { Schema, model, type InferSchemaType } from 'mongoose';

const userBlockSchema = new Schema(
  {
    blockerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    blockedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    collection: 'user_blocks',
  }
);

userBlockSchema.index(
  { blockerUserId: 1, blockedUserId: 1 },
  {
    unique: true,
    name: 'unique_active_user_block',
    partialFilterExpression: { deletedAt: null },
  }
);

export type UserBlockDocument = InferSchemaType<typeof userBlockSchema>;

export const UserBlock: mongoose.Model<UserBlockDocument> =
  (mongoose.models.UserBlock as mongoose.Model<UserBlockDocument> | undefined) ??
  model<UserBlockDocument>('UserBlock', userBlockSchema);
