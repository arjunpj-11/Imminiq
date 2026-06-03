import mongoose, { Schema } from 'mongoose'

const mockTestAttemptSchema = new Schema(
  {
    testId: { type: Schema.Types.ObjectId, ref: 'MockTest', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress', index: true },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    timeTakenSeconds: { type: Number, default: undefined },
    score: { type: Number, default: undefined },
    scorePercentage: { type: Number, default: undefined },
    passed: { type: Boolean, default: undefined },
    flaggedQuestions: [{ type: Schema.Types.ObjectId, ref: 'MockTestQuestion' }],
    totalQuestions: { type: Number, required: true },
    answeredQuestions: { type: Number, default: 0 },
  },
  { timestamps: true }
)

mockTestAttemptSchema.index({ userId: 1, testId: 1, status: 1 })
mockTestAttemptSchema.index({ userId: 1, createdAt: -1 })

export const MockTestAttemptModel = mongoose.models.MockTestAttempt || mongoose.model('MockTestAttempt', mockTestAttemptSchema)
