// apps/api/src/infrastructure/database/models/user-subtopic-progress.model.ts

import mongoose, { Document, Schema } from 'mongoose'

export type SubtopicProgressStatus =
  | 'locked'
  | 'available'
  | 'in_progress'
  | 'completed'

export interface IUserSubtopicProgress extends Document {
  userId: mongoose.Types.ObjectId
  trackerId: mongoose.Types.ObjectId
  topicId: mongoose.Types.ObjectId
  subtopicId: mongoose.Types.ObjectId
  status: SubtopicProgressStatus
  isUnlocked: boolean
  progressPercent: number
  timeSpentMinutes: number
  completedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const userSubtopicProgressSchema = new Schema<IUserSubtopicProgress>(
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
    subtopicId: {
      type: Schema.Types.ObjectId,
      ref: 'TrackerSubtopic',
      required: true,
    },
    status: {
      type: String,
      enum: ['locked', 'available', 'in_progress', 'completed'],
      default: 'locked',
    },
    isUnlocked: {
      type: Boolean,
      default: false,
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    timeSpentMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

// One progress doc per user+subtopic
userSubtopicProgressSchema.index(
  { userId: 1, subtopicId: 1 },
  { unique: true }
)
userSubtopicProgressSchema.index({ userId: 1, trackerId: 1 })
userSubtopicProgressSchema.index({ userId: 1, trackerId: 1, status: 1 })

export const UserSubtopicProgress = mongoose.model<IUserSubtopicProgress>(
  'UserSubtopicProgress',
  userSubtopicProgressSchema
)