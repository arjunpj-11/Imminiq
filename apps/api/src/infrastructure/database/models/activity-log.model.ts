import mongoose, { Schema, model, type InferSchemaType } from 'mongoose';

const activityLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    module: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'critical'],
      default: 'info',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      trim: true,
      default: '',
    },
    userAgent: {
      type: String,
      trim: true,
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
    collection: 'activity_logs',
  }
);

activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ module: 1, action: 1 });

// Audit entries are append-only. Corrections must be represented by a new compensating entry,
// preserving the original evidence for investigations and compliance exports.
const rejectAuditMutation = () => {
  throw new Error('Activity logs are append-only');
};
activityLogSchema.pre('updateOne', rejectAuditMutation);
activityLogSchema.pre('updateMany', rejectAuditMutation);
activityLogSchema.pre('findOneAndUpdate', rejectAuditMutation);
activityLogSchema.pre('deleteOne', rejectAuditMutation);
activityLogSchema.pre('deleteMany', rejectAuditMutation);
activityLogSchema.pre('findOneAndDelete', rejectAuditMutation);

export type ActivityLogDocument = InferSchemaType<typeof activityLogSchema>;

export const ActivityLog = mongoose.models.ActivityLog || model('ActivityLog', activityLogSchema);
