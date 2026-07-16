import mongoose, { Schema } from 'mongoose';

const contentModerationAppealSchema = new Schema(
  {
    targetType: { type: String, enum: ['tracker', 'mock_test'], required: true, index: true },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, required: true, trim: true, minlength: 20, maxlength: 3000 },
    evidenceUrls: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    decisionNote: { type: String, trim: true, default: null, maxlength: 3000 },
    decidedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    decidedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true, collection: 'content_moderation_appeals' }
);

contentModerationAppealSchema.index({ targetType: 1, status: 1, createdAt: 1 });
contentModerationAppealSchema.index({ ownerId: 1, createdAt: -1 });
contentModerationAppealSchema.index({ targetType: 1, targetId: 1, ownerId: 1, status: 1 });

export const ContentModerationAppeal =
  mongoose.models.ContentModerationAppeal ||
  mongoose.model('ContentModerationAppeal', contentModerationAppealSchema);
