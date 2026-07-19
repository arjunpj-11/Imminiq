import mongoose, { Schema } from 'mongoose';

const adaptiveAssessmentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    testId: {
      type: Schema.Types.ObjectId,
      ref: 'MockTest',
      required: true,
      unique: true,
      index: true,
    },
    trackerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tracker',
      default: null,
    },
    topic: { type: String, required: true, trim: true },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    questionCount: { type: Number, required: true, min: 5, max: 20 },
    predictedScore: { type: Number, required: true, min: 0, max: 100 },
    rationale: { type: String, required: true, maxlength: 800 },
    focusAreas: { type: [String], default: [] },
    baselineMasteryScore: { type: Number, required: true, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['ready', 'completed'],
      default: 'ready',
      index: true,
    },
    attemptId: {
      type: Schema.Types.ObjectId,
      ref: 'MockTestAttempt',
      default: null,
    },
    actualScore: { type: Number, default: null },
    masteryChange: { type: Number, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

adaptiveAssessmentSchema.index({ userId: 1, createdAt: -1 });
adaptiveAssessmentSchema.index({ userId: 1, status: 1 });
adaptiveAssessmentSchema.index(
  { attemptId: 1 },
  {
    unique: true,
    partialFilterExpression: { attemptId: { $type: 'objectId' } },
  }
);

export const AdaptiveAssessmentModel =
  mongoose.models.AdaptiveAssessment ||
  mongoose.model('AdaptiveAssessment', adaptiveAssessmentSchema);
