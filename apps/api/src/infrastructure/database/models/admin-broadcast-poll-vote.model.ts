import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const adminBroadcastPollVoteSchema = new Schema(
  {
    broadcastId: { type: Schema.Types.ObjectId, ref: 'AdminBroadcast', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    optionIndex: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, collection: 'admin_broadcast_poll_votes' }
);

adminBroadcastPollVoteSchema.index({ broadcastId: 1, userId: 1 }, { unique: true });

export type AdminBroadcastPollVoteDocument = InferSchemaType<typeof adminBroadcastPollVoteSchema>;
export const AdminBroadcastPollVote =
  mongoose.models.AdminBroadcastPollVote ||
  mongoose.model('AdminBroadcastPollVote', adminBroadcastPollVoteSchema);
