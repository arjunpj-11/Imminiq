// infrastructure/database/models/question-bank.model.ts
import mongoose, { Schema } from 'mongoose'

const questionBankSchema = new Schema(
  {
    bankId: { type: Number, required: true, unique: true, index: true }, // global auto-increment
    topic: { type: String, required: true, trim: true, index: true },
    type: { type: String, enum: ['mcq', 'short_answer', 'coding'], required: true },
    question: { type: String, required: true, trim: true },
    options: { type: [String], default: undefined },
    correctAnswer: { type: String, default: undefined },
    explanation: { type: String, default: undefined },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', index: true },
    points: { type: Number, default: 1, min: 1 },
  },
  { timestamps: true }
)

questionBankSchema.index({ topic: 1, difficulty: 1 })

export const QuestionBankModel =
  mongoose.models.QuestionBank ||
  mongoose.model('QuestionBank', questionBankSchema)