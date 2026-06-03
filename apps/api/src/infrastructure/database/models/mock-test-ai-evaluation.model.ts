import mongoose, { Schema } from 'mongoose'

const mockTestAIEvaluationSchema = new Schema(
  {
    attemptId: { type: Schema.Types.ObjectId, ref: 'MockTestAttempt', required: true, index: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'MockTestQuestion', required: true, index: true },
    answerId: { type: Schema.Types.ObjectId, ref: 'MockTestAnswer', required: true, index: true },
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    feedback: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const MockTestAIEvaluationModel = mongoose.models.MockTestAIEvaluation || mongoose.model('MockTestAIEvaluation', mockTestAIEvaluationSchema)
