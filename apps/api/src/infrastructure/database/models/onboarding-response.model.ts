// apps/api/src/infrastructure/database/models/onboarding-response.model.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IOnboardingResponseDocument extends Document {
  userId: mongoose.Types.ObjectId;

  preparingFor: string;
  goal: string;

  currentLevel?: 'beginner' | 'intermediate' | 'advanced';

  selectedTags: string[];
  draftData: Record<string, unknown>;

  completedStep: number;
  isCompleted: boolean;

  deletedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const onboardingResponseSchema = new Schema<IOnboardingResponseDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    preparingFor: {
      type: String,
      trim: true,
      default: '',
    },

    goal: {
      type: String,
      trim: true,
      default: '',
    },

    currentLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },

    selectedTags: {
      type: [String],
      default: [],
    },

    draftData: {
      type: Schema.Types.Mixed,
      default: {},
    },

    completedStep: {
      type: Number,
      default: 0,
      min: 0,
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

onboardingResponseSchema.index({ userId: 1, isCompleted: 1 });

export const OnboardingResponse = mongoose.model<IOnboardingResponseDocument>(
  'OnboardingResponse',
  onboardingResponseSchema
);
