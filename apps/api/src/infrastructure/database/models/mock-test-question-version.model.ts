import mongoose, { Schema } from 'mongoose';

const mockTestQuestionVersionSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'MockTestQuestion',
      required: true,
      index: true,
    },
    testId: {
      type: Schema.Types.ObjectId,
      ref: 'MockTest',
      required: true,
      index: true,
    },
    version: { type: Number, required: true, min: 1 },
    snapshot: { type: Schema.Types.Mixed, required: true },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true, trim: true, maxlength: 1500 },
  },
  { timestamps: true }
);

mockTestQuestionVersionSchema.index({ questionId: 1, version: 1 }, { unique: true });
mockTestQuestionVersionSchema.index({ testId: 1, createdAt: -1 });

export const MockTestQuestionVersionModel =
  mongoose.models.MockTestQuestionVersion ||
  mongoose.model('MockTestQuestionVersion', mockTestQuestionVersionSchema);
