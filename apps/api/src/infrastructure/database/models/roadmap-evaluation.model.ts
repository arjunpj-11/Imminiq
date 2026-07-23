// apps/api/src/modules/user/trackers/roadmap-evaluation.model.ts

import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export type RoadmapEvaluationType = 'ai_quality' | 'reviewer_check' | 'self_review';

export type RoadmapEvaluationStatus = 'pending' | 'completed' | 'failed';

export type MissingTopicPriority = 'high' | 'medium' | 'optional';

export interface IRoadmapEvaluationMissingTopicDocument {
  title: string;
  priority: MissingTopicPriority;
  description: string;
  readinessImpact: number;
}

export interface IRoadmapEvaluationDocument extends Document {
  trackerId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  aiJobId?: mongoose.Types.ObjectId;

  evaluationType: RoadmapEvaluationType;

  score: number;
  coverageScore: number;
  difficultyBalanceScore: number;
  sequencingScore: number;
  timeFitScore: number;

  missingTopics: IRoadmapEvaluationMissingTopicDocument[];
  duplicateTopics: string[];

  strengths: string[];
  weaknesses: string[];
  aiSuggestions: string[];
  recommendedNextActions: string[];

  status: RoadmapEvaluationStatus;

  evaluatedAt?: Date;
  deletedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const missingTopicSchema = new Schema<IRoadmapEvaluationMissingTopicDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    priority: {
      type: String,
      enum: ['high', 'medium', 'optional'],
      required: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    readinessImpact: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    _id: false,
  }
);

const roadmapEvaluationSchema = new Schema<IRoadmapEvaluationDocument>(
  {
    trackerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tracker',
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    aiJobId: {
      type: Schema.Types.ObjectId,
      ref: 'AIGenerationJob',
    },

    evaluationType: {
      type: String,
      enum: ['ai_quality', 'reviewer_check', 'self_review'],
      default: 'ai_quality',
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    coverageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    difficultyBalanceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    sequencingScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    timeFitScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    missingTopics: {
      type: [missingTopicSchema],
      default: [],
    },

    duplicateTopics: {
      type: [String],
      default: [],
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    aiSuggestions: {
      type: [String],
      default: [],
    },

    recommendedNextActions: {
      type: [String],
      default: [],
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },

    evaluatedAt: {
      type: Date,
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

roadmapEvaluationSchema.index({ trackerId: 1 });
roadmapEvaluationSchema.index({ userId: 1 });
roadmapEvaluationSchema.index({ trackerId: 1, status: 1 });
roadmapEvaluationSchema.index({ aiJobId: 1 });

export const RoadmapEvaluation = mongoose.model<IRoadmapEvaluationDocument>(
  'RoadmapEvaluation',
  roadmapEvaluationSchema
);
