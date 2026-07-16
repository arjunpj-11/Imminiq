import mongoose, { Schema } from 'mongoose';

export const TRACKER_REPORT_REASONS = [
  'incorrect_or_misleading',
  'unsafe_or_offensive',
  'spam_or_low_quality',
  'copyright_or_plagiarism',
  'broken_learning_path',
  'privacy_concern',
  'other',
] as const;

const trackerReportSchema = new Schema(
  {
    trackerId: { type: Schema.Types.ObjectId, ref: 'Tracker', required: true, index: true },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, enum: TRACKER_REPORT_REASONS, required: true, index: true },
    details: { type: String, trim: true, maxlength: 1500, default: '' },
    status: {
      type: String,
      enum: ['open', 'reviewing', 'resolved', 'dismissed'],
      default: 'open',
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    resolutionAction: {
      type: String,
      enum: ['none', 'tracker_suspended', 'tracker_deleted', 'tracker_restored'],
      default: 'none',
    },
    resolutionNote: { type: String, trim: true, maxlength: 1500, default: '' },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

trackerReportSchema.index({ trackerId: 1, reporterId: 1 }, { unique: true });
trackerReportSchema.index({ status: 1, createdAt: 1 });

export const TrackerReport =
  mongoose.models.TrackerReport || mongoose.model('TrackerReport', trackerReportSchema);
