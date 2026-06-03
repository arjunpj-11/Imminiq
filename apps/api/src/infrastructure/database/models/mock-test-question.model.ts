import mongoose, { Schema } from 'mongoose'

const mockTestQuestionSchema = new Schema(
  {
    testId: { type: Schema.Types.ObjectId, ref: 'MockTest', required: true, index: true },
    type: { type: String, enum: ['mcq', 'short_answer', 'coding'], required: true },
    question: { type: String, required: true, trim: true },
    options: { type: [String], default: undefined },
    correctAnswer: { type: String, default: undefined },
    explanation: { type: String, default: undefined },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    order: { type: Number, required: true },
    points: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
)

mockTestQuestionSchema.index({ testId: 1, order: 1 }, { unique: true })

export const MockTestQuestionModel = mongoose.models.MockTestQuestion || mongoose.model('MockTestQuestion', mockTestQuestionSchema)
