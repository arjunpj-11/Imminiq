import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const clanMemberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['co_owner', 'member'], required: true, default: 'member' },
    joinedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const clanJoinRequestSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      required: true,
      default: 'pending',
    },
    createdAt: { type: Date, required: true, default: Date.now },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { _id: true }
);

const clanRoleInvitationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['co_owner', 'owner'], required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      required: true,
      default: 'pending',
    },
    createdAt: { type: Date, required: true, default: Date.now },
    respondedAt: { type: Date, default: null },
  },
  { _id: true }
);

const trackerClanSchema = new Schema(
  {
    trackerId: { type: Schema.Types.ObjectId, ref: 'Tracker', required: true, unique: true },
    members: { type: [clanMemberSchema], default: [] },
    joinRequests: { type: [clanJoinRequestSchema], default: [] },
    roleInvitations: { type: [clanRoleInvitationSchema], default: [] },
  },
  { timestamps: true, collection: 'tracker_clans' }
);

trackerClanSchema.index({ 'members.userId': 1 });
trackerClanSchema.index({ 'joinRequests.userId': 1, 'joinRequests.status': 1 });
trackerClanSchema.index({ 'roleInvitations.userId': 1, 'roleInvitations.status': 1 });

export type TrackerClanDocument = InferSchemaType<typeof trackerClanSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TrackerClan =
  mongoose.models.TrackerClan || mongoose.model('TrackerClan', trackerClanSchema);
