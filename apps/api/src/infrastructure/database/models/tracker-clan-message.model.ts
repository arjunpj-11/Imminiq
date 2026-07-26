import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export const TRACKER_CLAN_MESSAGE_RETENTION_SECONDS = 24 * 60 * 60;

const trackerClanReplySchema = new Schema(
  {
    messageId: { type: Schema.Types.ObjectId, required: true },
    senderId: { type: Schema.Types.ObjectId, required: true },
    text: { type: String, default: '' },
    kind: { type: String, enum: ['text', 'image', 'file', 'voice'], required: true },
  },
  { _id: false }
);

const trackerClanReactionSchema = new Schema(
  {
    emoji: { type: String, required: true, maxlength: 16 },
    userIds: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  },
  { _id: false }
);

const trackerClanMessageSchema = new Schema(
  {
    trackerId: { type: Schema.Types.ObjectId, ref: 'Tracker', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, default: '', trim: true, maxlength: 1000 },
    kind: {
      type: String,
      enum: ['text', 'image', 'file', 'voice'],
      default: 'text',
    },
    attachment: {
      url: { type: String },
      storagePublicId: { type: String },
      name: { type: String },
      mimeType: { type: String },
      sizeBytes: { type: Number },
      durationSeconds: { type: Number },
    },
    replyTo: { type: trackerClanReplySchema, default: null },
    reactions: { type: [trackerClanReactionSchema], default: [] },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'tracker_clan_messages' }
);

trackerClanMessageSchema.pre('validate', function () {
  if (!this.text?.trim() && !this.attachment?.url) {
    this.invalidate('text', 'A message needs text or an attachment');
  }
});

trackerClanMessageSchema.index({ trackerId: 1, createdAt: -1 });
trackerClanMessageSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: TRACKER_CLAN_MESSAGE_RETENTION_SECONDS }
);

export type TrackerClanMessageDocument = InferSchemaType<typeof trackerClanMessageSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const TrackerClanMessage =
  mongoose.models.TrackerClanMessage ||
  mongoose.model('TrackerClanMessage', trackerClanMessageSchema);
