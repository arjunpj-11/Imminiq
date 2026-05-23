// apps/api/src/infrastructure/database/models/tracker-topic.model.ts

import mongoose, { Document, Schema } from 'mongoose'

export interface ITrackerTopic extends Document {
  trackerId: mongoose.Types.ObjectId
  title: string
  description: string
  order: number
  status: string
  estimatedHours: number
  progressPercent: number
  deletedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const trackerTopicSchema = new Schema<ITrackerTopic>(
  {
    trackerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tracker',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['active', 'locked', 'completed'],
      default: 'locked',
    },
    estimatedHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

trackerTopicSchema.index({ trackerId: 1, order: 1 })

export const TrackerTopic = mongoose.model<ITrackerTopic>(
  'TrackerTopic',
  trackerTopicSchema
)