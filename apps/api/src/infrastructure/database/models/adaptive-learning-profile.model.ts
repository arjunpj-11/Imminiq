import mongoose, { Schema } from 'mongoose';

export type AdaptiveMasteryLevel = 'foundation' | 'developing' | 'proficient' | 'advanced';

const adaptiveLevelHistorySchema = new Schema(
  {
    attemptId: {
      type: Schema.Types.ObjectId,
      ref: 'MockTestAttempt',
      default: null,
    },
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: 'AdaptiveAssessment',
      default: null,
    },
    masteryScore: { type: Number, required: true, min: 0, max: 100 },
    level: {
      type: String,
      enum: ['foundation', 'developing', 'proficient', 'advanced'],
      required: true,
    },
    change: { type: Number, required: true },
    reason: { type: String, required: true, maxlength: 300 },
    recordedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const adaptiveLearningProfileSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    masteryScore: { type: Number, default: 40, min: 0, max: 100 },
    level: {
      type: String,
      enum: ['foundation', 'developing', 'proficient', 'advanced'],
      default: 'developing',
    },
    history: { type: [adaptiveLevelHistorySchema], default: [] },
  },
  { timestamps: true }
);

adaptiveLearningProfileSchema.index({ 'history.attemptId': 1 });

export const AdaptiveLearningProfileModel =
  mongoose.models.AdaptiveLearningProfile ||
  mongoose.model('AdaptiveLearningProfile', adaptiveLearningProfileSchema);
