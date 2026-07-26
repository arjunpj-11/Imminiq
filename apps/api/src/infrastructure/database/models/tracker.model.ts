import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export type TrackerLevel = 'beginner' | 'intermediate' | 'advanced';

export type TrackerVisibility = 'private' | 'public' | 'unlisted';

export type TrackerStatus = 'draft' | 'active' | 'archived';

export type TrackerVerificationStatus = 'pending' | 'verified' | 'rejected';
export type TrackerModerationStatus = 'active' | 'suspended' | 'deleted';
export type CloneFreshnessAnalysisStatus = 'pending' | 'completed' | 'failed';

export interface ITrackerDocument extends Document {
  ownerId: mongoose.Types.ObjectId;

  title: string;
  slug: string;
  description: string;

  category: string;
  field: string;
  goal: string;
  contentLanguage: string;

  level: TrackerLevel;

  tags: string[];
  allowClone: boolean;
  sourceTrackerId?: mongoose.Types.ObjectId | null;
  guildChangesFetchedAt?: Date | null;
  cloneFreshnessAnalysisStatus?: CloneFreshnessAnalysisStatus | null;
  cloneFreshnessAnalysisJobId?: mongoose.Types.ObjectId | null;
  cloneFreshnessAnalyzedAt?: Date | null;

  visibility: TrackerVisibility;
  status: TrackerStatus;

  verificationStatus?: TrackerVerificationStatus | null;
  verifiedAt?: Date | null;
  moderationStatus: TrackerModerationStatus;
  moderationReason?: string | null;
  moderationReasonCode?: string | null;
  moderatedBy?: mongoose.Types.ObjectId | null;
  suspendedAt?: Date | null;

  isAIGenerated: boolean;
  aiJobId?: mongoose.Types.ObjectId;

  coverImageUrl?: string;

  topicsCount: number;
  subtopicsCount: number;

  cloneCount: number;
  likeCount: number;
  saveCount: number;

  progressPercent: number;

  ratingAverage: number;
  ratingCount: number;

  publishedAt?: Date;
  deletedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
  version: number;
}

const trackerSchema = new Schema<ITrackerDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: '',
      trim: true,
    },

    category: {
      type: String,
      default: 'general',
      trim: true,
    },

    field: {
      type: String,
      default: '',
      trim: true,
    },

    goal: {
      type: String,
      default: '',
      trim: true,
    },

    contentLanguage: {
      type: String,
      default: 'English',
      trim: true,
      maxlength: 80,
    },

    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },

    tags: {
      type: [String],
      default: [],
      set: (tags: unknown[]) =>
        Array.isArray(tags)
          ? tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean)
          : [],
    },

    allowClone: {
      type: Boolean,
      default: true,
    },

    sourceTrackerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tracker',
      default: null,
    },

    guildChangesFetchedAt: {
      type: Date,
      default: null,
    },

    cloneFreshnessAnalysisStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: null,
    },

    cloneFreshnessAnalysisJobId: {
      type: Schema.Types.ObjectId,
      ref: 'AIGenerationJob',
      default: null,
    },

    cloneFreshnessAnalyzedAt: {
      type: Date,
      default: null,
    },

    visibility: {
      type: String,
      enum: ['private', 'public', 'unlisted'],
      default: 'private',
    },

    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'draft',
    },
    version: { type: Number, default: 1, min: 1 },

    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: null,
      index: true,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    moderationStatus: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active',
      index: true,
    },

    moderationReason: { type: String, trim: true, maxlength: 1000, default: null },
    moderationReasonCode: { type: String, trim: true, maxlength: 80, default: null },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    suspendedAt: { type: Date, default: null },

    isAIGenerated: {
      type: Boolean,
      default: false,
    },

    aiJobId: {
      type: Schema.Types.ObjectId,
      ref: 'AIGenerationJob',
    },

    coverImageUrl: {
      type: String,
      default: '',
      trim: true,
    },

    topicsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    subtopicsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    cloneCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    saveCount: {
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

    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    publishedAt: {
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

trackerSchema.index({ ownerId: 1, status: 1 });
trackerSchema.index({ visibility: 1, status: 1 });
trackerSchema.index({ visibility: 1, publishedAt: -1 });
trackerSchema.index({ field: 1 });
trackerSchema.index({ category: 1 });
trackerSchema.index({ level: 1 });
trackerSchema.index({ tags: 1 });
trackerSchema.index({ sourceTrackerId: 1 });
trackerSchema.index({ ownerId: 1, cloneFreshnessAnalysisStatus: 1 });
trackerSchema.index({ verificationStatus: 1, visibility: 1 });
trackerSchema.index({ moderationStatus: 1, deletedAt: 1 });
trackerSchema.index(
  { ownerId: 1, sourceTrackerId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      sourceTrackerId: { $type: 'objectId' },
      deletedAt: null,
    },
  }
);

export const Tracker =
  mongoose.models.Tracker || mongoose.model<ITrackerDocument>('Tracker', trackerSchema);
