// The TypeScript name follows the tracker-creation module. The persisted model
// name intentionally remains `OnboardingResponse` for backwards compatibility.

import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface ITrackerCreationResponseDocument extends Document {
  userId: mongoose.Types.ObjectId;

  preparingFor: string;
  goal: string;
  preferredLanguage: string;

  currentLevel?: 'beginner' | 'intermediate' | 'advanced';

  selectedTags: string[];
  draftData: Record<string, unknown>;

  completedStep: number;
  isCompleted: boolean;

  deletedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const trackerCreationResponseSchema = new Schema<ITrackerCreationResponseDocument>(
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

    preferredLanguage: {
      type: String,
      trim: true,
      maxlength: 80,
      default: 'English',
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

trackerCreationResponseSchema.index({ userId: 1, isCompleted: 1 });

export const TrackerCreationResponse = mongoose.model<ITrackerCreationResponseDocument>(
  'OnboardingResponse',
  trackerCreationResponseSchema
);
