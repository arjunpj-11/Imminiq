// apps/api/src/infrastructure/database/models/ai-generation-step.model.ts

import mongoose, { Document, Schema } from 'mongoose';

export type AIGenerationStepStatus = 'pending' | 'active' | 'completed' | 'failed';

export interface IAIGenerationStepDocument extends Document {
  jobId: mongoose.Types.ObjectId;

  stepNumber: number;
  stepLabel: string;
  status: AIGenerationStepStatus;

  startedAt?: Date;
  completedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const aiGenerationStepSchema = new Schema<IAIGenerationStepDocument>(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'AIGenerationJob',
      required: true,
    },

    stepNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    stepLabel: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'failed'],
      default: 'pending',
    },

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

aiGenerationStepSchema.index({ jobId: 1, stepNumber: 1 }, { unique: true });

aiGenerationStepSchema.index({ jobId: 1, status: 1 });

export const AIGenerationStep = mongoose.model<IAIGenerationStepDocument>(
  'AIGenerationStep',
  aiGenerationStepSchema
);
