import mongoose, { Schema } from 'mongoose';

const mockTestAnswerSchema = new Schema(
  {
    attemptId: { type: Schema.Types.ObjectId, ref: 'MockTestAttempt', required: true, index: true },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'MockTestQuestion',
      required: true,
      index: true,
    },
    answer: { type: String, required: true },
    isCorrect: { type: Boolean, default: undefined },
    pointsEarned: { type: Number, default: undefined },
    aiEvaluationId: {
      type: Schema.Types.ObjectId,
      ref: 'MockTestAIEvaluation',
      default: undefined,
    },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

mockTestAnswerSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });

export const MockTestAnswerModel =
  mongoose.models.MockTestAnswer || mongoose.model('MockTestAnswer', mockTestAnswerSchema);
