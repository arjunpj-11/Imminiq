import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
  trackerId: { type: Schema.Types.ObjectId, ref: 'Tracker', required: true, index: true },
  version: { type: Number, required: true, min: 1 },
  snapshot: { type: Schema.Types.Mixed, required: true },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, trim: true, maxlength: 1000, required: true },
}, { timestamps: true });
schema.index({ trackerId: 1, version: 1 }, { unique: true });
export const TrackerVersion = mongoose.model('TrackerVersion', schema);
