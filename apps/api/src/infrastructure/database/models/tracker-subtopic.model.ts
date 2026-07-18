// apps/api/src/infrastructure/database/models/tracker-subtopic.model.ts

import type { Document} from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface ITrackerSubtopicDocument extends Document {
  trackerId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  sourceSubtopicId?: mongoose.Types.ObjectId | null;
  parentSubtopicId?: mongoose.Types.ObjectId | null;
  title: string;
  description: string;
  order: number;
  depth: number;
  isLocked: boolean;
  estimatedMinutes: number;
  learningVideo?: {
    videoId: string;
    title: string;
    url: string;
    channelTitle: string;
    thumbnailUrl: string;
    durationSeconds: number;
  } | null;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
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
    sourceSubtopicId: {
      type: Schema.Types.ObjectId,
      ref: 'TrackerSubtopic',
      default: null,
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
    learningVideo: {
      type: new Schema(
        {
          videoId: { type: String, required: true, trim: true },
          title: { type: String, required: true, trim: true },
          url: { type: String, required: true, trim: true },
          channelTitle: { type: String, default: '', trim: true },
          thumbnailUrl: { type: String, default: '', trim: true },
          durationSeconds: { type: Number, default: 0, min: 0 },
        },
        { _id: false }
      ),
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

trackerSubtopicSchema.index({ trackerId: 1, topicId: 1, order: 1 });
trackerSubtopicSchema.index({ trackerId: 1, topicId: 1, depth: 1 });

export const TrackerSubtopic = mongoose.model<ITrackerSubtopicDocument>(
  'TrackerSubtopic',
  trackerSubtopicSchema
);
