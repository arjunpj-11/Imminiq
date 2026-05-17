import mongoose, { Document, Schema } from 'mongoose'

export interface ITrackerProgress extends Document {
  userId: mongoose.Types.ObjectId
  trackerId: mongoose.Types.ObjectId
  completedTopics: mongoose.Types.ObjectId[]
  completedSubtopics: mongoose.Types.ObjectId[]
  totalTopics: number
  totalSubtopics: number
  completionPercentage: number
  timeSpentMinutes: number
  lastStudiedAt: Date | null
  startedAt: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const trackerProgressSchema = new Schema<ITrackerProgress>(
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

    completedTopics: [
      {
        type: Schema.Types.ObjectId,
        ref: 'TrackerTopic',
      },
    ],

    completedSubtopics: [
      {
        type: Schema.Types.ObjectId,
        ref: 'TrackerSubtopic',
      },
    ],

    totalTopics: {
      type: Number,
      default: 0,
    },

    totalSubtopics: {
      type: Number,
      default: 0,
    },

    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    timeSpentMinutes: {
      type: Number,
      default: 0,
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
    },
  },
  { timestamps: true }
)

trackerProgressSchema.index(
  { userId: 1, trackerId: 1 },
  { unique: true }
)

trackerProgressSchema.index({
  userId: 1,
  lastStudiedAt: -1,
})

trackerProgressSchema.index({
  trackerId: 1,
})

trackerProgressSchema.index({
  userId: 1,
  completionPercentage: 1,
})

export const TrackerProgress =
  mongoose.model<ITrackerProgress>(
    'TrackerProgress',
    trackerProgressSchema
  )