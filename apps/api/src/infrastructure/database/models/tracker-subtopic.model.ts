// apps/api/src/infrastructure/database/models/tracker-subtopic.model.ts

import mongoose, { Document, Schema } from 'mongoose'

export interface ITrackerSubtopicDocument extends Document {
  trackerId: mongoose.Types.ObjectId
  topicId: mongoose.Types.ObjectId
  parentSubtopicId?: mongoose.Types.ObjectId | null
  title: string
  description: string
  order: number
  depth: number
  isLocked: boolean
  estimatedMinutes: number
  deletedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

const trackerSubtopicSchema = new Schema<ITrackerSubtopicDocument>(
  {
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
    parentSubtopicId: {
      type: Schema.Types.ObjectId,
      ref: 'TrackerSubtopic',
      default: null,
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
    depth: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    isLocked: {
      type: Boolean,
      default: true,
    },
    estimatedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
)

trackerSubtopicSchema.index({ trackerId: 1, topicId: 1, order: 1 })
trackerSubtopicSchema.index({ trackerId: 1, topicId: 1, depth: 1 })

export const TrackerSubtopic = mongoose.model<ITrackerSubtopicDocument>(
  'TrackerSubtopic',
  trackerSubtopicSchema
)