import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export const TRACKER_CLAN_MESSAGE_RETENTION_SECONDS = 24 * 60 * 60;

const trackerClanMessageSchema = new Schema(
  {
    trackerId: { type: Schema.Types.ObjectId, ref: 'Tracker', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 1000 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: 'tracker_clan_messages' }
);

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
