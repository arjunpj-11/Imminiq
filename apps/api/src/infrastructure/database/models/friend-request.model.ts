import mongoose, { Schema, model, type InferSchemaType } from "mongoose";

const friendRequestSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      validate: {
        validator(
          this: { senderId?: mongoose.Types.ObjectId },
          value: mongoose.Types.ObjectId,
        ) {
          return (
            !this.senderId || this.senderId.toString() !== value.toString()
          );
        },
        message: "A user cannot send a friend invite to themselves",
      },
    },

    /**
     * Canonical sorted pair: <smallerObjectId>:<largerObjectId>.
     *
     * This prevents crossed requests such as A -> B and B -> A from
     * both being pending at the same time.
     */
    pairKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 49,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },

    message: {
      type: String,
      trim: true,
      maxlength: 280,
      default: "",
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "friend_requests",
  },
);

// Only one live pending request may exist for a user pair, regardless
// of which user is the sender.
friendRequestSchema.index(
  {
    pairKey: 1,
  },
  {
    unique: true,
    name: "unique_pending_friend_request_pair",
    partialFilterExpression: {
      status: "pending",
      deletedAt: null,
    },
  },
);

friendRequestSchema.index({
  receiverId: 1,
  status: 1,
  deletedAt: 1,
  createdAt: -1,
  _id: -1,
});

friendRequestSchema.index({
  senderId: 1,
  status: 1,
  deletedAt: 1,
  createdAt: -1,
  _id: -1,
});

friendRequestSchema.index({
  senderId: 1,
  receiverId: 1,
  createdAt: -1,
});

export type FriendRequestDocument = InferSchemaType<typeof friendRequestSchema>;

export const FriendRequest: mongoose.Model<FriendRequestDocument> =
  (mongoose.models.FriendRequest as
    mongoose.Model<FriendRequestDocument> | undefined) ??
  model<FriendRequestDocument>("FriendRequest", friendRequestSchema);
