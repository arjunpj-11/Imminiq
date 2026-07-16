import mongoose, { Schema } from 'mongoose';

const mockTestCreationSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'completed', 'cancelled'],
      default: 'draft',
      index: true,
    },
    step: { type: Number, default: 1 },
    draftData: {
      title: String,
      description: String,
      difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
      questionCount: Number,
      timeLimitMinutes: Number,
      passingScore: Number,
      tags: [String],
      trackerId: { type: Schema.Types.ObjectId, ref: 'Tracker' },
      topicId: String,
      questionTypes: [{ type: String, enum: ['mcq', 'short_answer', 'coding'] }],
    },
  },
  { timestamps: true }
);

mockTestCreationSessionSchema.index({ userId: 1, status: 1 });

export const MockTestCreationSessionModel =
  mongoose.models.MockTestCreationSession ||
  mongoose.model('MockTestCreationSession', mockTestCreationSessionSchema);
