import mongoose, { Schema } from 'mongoose'

const mockTestReportSchema = new Schema(
  {
    attemptId: { type: Schema.Types.ObjectId, ref: 'MockTestAttempt', required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    testId: { type: Schema.Types.ObjectId, ref: 'MockTest', required: true, index: true },
    score: { type: Number, required: true },
    scorePercentage: { type: Number, required: true },
    passed: { type: Boolean, required: true },
    timeTakenSeconds: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    incorrectAnswers: { type: Number, required: true },
    skippedAnswers: { type: Number, required: true },
    strongTopics: { type: [String], default: [] },
    weakTopics: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const MockTestReportModel = mongoose.models.MockTestReport || mongoose.model('MockTestReport', mockTestReportSchema)
