import mongoose, { Schema } from 'mongoose'

const mockTestSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    trackerId: { type: Schema.Types.ObjectId, ref: 'Tracker', default: null, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', trim: true, maxlength: 500 },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium', index: true },
    visibility: { type: String, enum: ['private', 'public'], default: 'private', index: true },
    questionCount: { type: Number, required: true, min: 1, max: 100 },
    timeLimitMinutes: { type: Number, default: 30, min: 5, max: 180 },
    passingScore: { type: Number, default: 60, min: 1, max: 100 },
    isAIGenerated: { type: Boolean, default: false },
    tags: { type: [String], default: [], index: true },
    cloneCount: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    attemptCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

mockTestSchema.index({ ownerId: 1, createdAt: -1 })
mockTestSchema.index({ visibility: 1, difficulty: 1, createdAt: -1 })
mockTestSchema.index({ title: 'text', description: 'text', tags: 'text' })

export const MockTestModel = mongoose.models.MockTest || mongoose.model('MockTest', mockTestSchema)
