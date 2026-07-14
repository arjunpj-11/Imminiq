import mongoose, { Schema } from 'mongoose';

const topicBreakdownSchema = new Schema(
  {
    topic: { type: String, required: true },
    averageScore: { type: Number, default: 0 },
    attemptCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const mockTestAnalyticsSnapshotSchema = new Schema(
  {
    testId: { type: Schema.Types.ObjectId, ref: 'MockTest', required: true, unique: true },
    totalAttempts: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    passRate: { type: Number, default: 0 },
    averageTimeTakenSeconds: { type: Number, default: 0 },
    topicBreakdown: { type: [topicBreakdownSchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const MockTestAnalyticsSnapshotModel =
  mongoose.models.MockTestAnalyticsSnapshot ||
  mongoose.model('MockTestAnalyticsSnapshot', mockTestAnalyticsSnapshotSchema);
