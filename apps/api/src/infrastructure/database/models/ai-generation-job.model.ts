// apps/api/src/infrastructure/database/models/ai-generation-job.model.ts

import mongoose, { Document, Schema } from 'mongoose'

export type AIGenerationJobType =
  | 'roadmap'
  | 'lesson'
  | 'mock_test'
  | 'evaluation'
  | 'visualization'

export type AIGenerationJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'

export interface IAIGenerationJobDocument extends Document {
  userId: mongoose.Types.ObjectId

  jobType: AIGenerationJobType
  status: AIGenerationJobStatus

  prompt?: string

  inputData: Record<string, unknown>
  outputData?: Record<string, unknown>

  errorMessage?: string

  aiModel?: string
  tokenUsage?: Record<string, unknown>

  totalSteps: number
  currentStep: number

  startedAt?: Date
  completedAt?: Date

  deletedAt?: Date | null

  createdAt: Date
  updatedAt: Date
}

const aiGenerationJobSchema = new Schema<IAIGenerationJobDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    jobType: {
      type: String,
      enum: [
        'roadmap',
        'lesson',
        'mock_test',
        'evaluation',
        'visualization',
      ],
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },

    prompt: {
      type: String,
      trim: true,
    },

    inputData: {
      type: Schema.Types.Mixed,
      required: true,
    },

    outputData: {
      type: Schema.Types.Mixed,
    },

    errorMessage: {
      type: String,
      trim: true,
    },

    aiModel: {
      type: String,
      trim: true,
    },

    tokenUsage: {
      type: Schema.Types.Mixed,
    },

    totalSteps: {
      type: Number,
      default: 5,
      min: 0,
    },

    currentStep: {
      type: Number,
      default: 0,
      min: 0,
    },

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

aiGenerationJobSchema.index({ userId: 1, status: 1 })
aiGenerationJobSchema.index({ jobType: 1, status: 1 })
aiGenerationJobSchema.index({ createdAt: -1 })

export const AIGenerationJob =
  mongoose.model<IAIGenerationJobDocument>(
    'AIGenerationJob',
    aiGenerationJobSchema
  )