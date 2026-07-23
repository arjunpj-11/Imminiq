// apps/api/src/infrastructure/database/models/user-topic-progress.model.ts

import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export type TopicProgressStatus = 'locked' | 'active' | 'completed';

export interface IUserTopicProgressDocument extends Document {
  userId: mongoose.Types.ObjectId;
  trackerId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  status: TopicProgressStatus;
  progressPercent: number;
  completedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userTopicProgressSchema = new Schema<IUserTopicProgressDocument>(
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
    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'TrackerTopic',
      required: true,
    },
    status: {
      type: String,
      enum: ['locked', 'active', 'completed'],
      default: 'locked',
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// One progress doc per user+topic
userTopicProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });
userTopicProgressSchema.index({ userId: 1, trackerId: 1 });
userTopicProgressSchema.index({ userId: 1, trackerId: 1, status: 1 });

export const UserTopicProgress = mongoose.model<IUserTopicProgressDocument>(
  'UserTopicProgress',
  userTopicProgressSchema
);
