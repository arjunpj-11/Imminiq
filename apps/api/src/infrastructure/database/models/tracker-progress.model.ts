// apps/api/src/infrastructure/database/models/tracker-progress.model.ts

import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface ITrackerProgressDocument extends Document {
  userId: mongoose.Types.ObjectId;
  trackerId: mongoose.Types.ObjectId;
  totalTopics: number;
  completedTopics: number;
  totalSubtopics: number;
  completedSubtopics: number;
  completionPercentage: number;
  lastStudiedAt: Date | null;
  startedAt: Date;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const trackerProgressSchema = new Schema<ITrackerProgressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trackerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tracker',
      required: true,
    },
    totalTopics: {
      type: Number,
      default: 0,
    },
    completedTopics: {
      type: Number,
      default: 0,
    },
    totalSubtopics: {
      type: Number,
      default: 0,
    },
    completedSubtopics: {
      type: Number,
      default: 0,
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastStudiedAt: {
      type: Date,
      default: null,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// One progress doc per user+tracker
trackerProgressSchema.index({ userId: 1, trackerId: 1 }, { unique: true });
trackerProgressSchema.index({ userId: 1, lastStudiedAt: -1 });

export const TrackerProgress = mongoose.model<ITrackerProgressDocument>(
  'TrackerProgress',
  trackerProgressSchema
);
