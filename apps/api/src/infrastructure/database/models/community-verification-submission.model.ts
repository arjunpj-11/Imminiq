import type { Document } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export type CommunityVerificationSubmissionStatus =
  | 'open'
  | 'closed'
  | 'approved'
  | 'rejected'
  | 'expired';

export type CommunityVerificationConsensusChoice = 'pass' | 'fail';

export interface ICommunityVerificationSubmissionDocument extends Document {
  trackerId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;

  title: string;
  category: string;
  excerpt: string;

  passVotes: number;
  failVotes: number;
  requiredVotes: number;
  progress: number;

  status: CommunityVerificationSubmissionStatus;
  urgent: boolean;
  consensusChoice?: CommunityVerificationConsensusChoice | null;
  adminVotes: Array<{
    userId: mongoose.Types.ObjectId;
    choice: CommunityVerificationConsensusChoice;
    votedAt: Date;
  }>;

  expiresAt?: Date | null;
  deletedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const communityVerificationSubmissionSchema = new Schema<ICommunityVerificationSubmissionDocument>(
  {
    trackerId: {
      type: Schema.Types.ObjectId,
      ref: 'Tracker',
      required: true,
      index: true,
    },

    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },

    category: {
      type: String,
      default: 'general',
      trim: true,
      lowercase: true,
      index: true,
    },

    excerpt: {
      type: String,
      default: '',
      trim: true,
      maxlength: 280,
    },

    passVotes: {
      type: Number,
      default: 0,
      min: 0,
    },

    failVotes: {
      type: Number,
      default: 0,
      min: 0,
    },

    requiredVotes: {
      type: Number,
      default: 10,
      min: 1,
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: ['open', 'closed', 'approved', 'rejected', 'expired'],
      default: 'open',
      index: true,
    },

    urgent: {
      type: Boolean,
      default: false,
      index: true,
    },

    consensusChoice: {
      type: String,
      enum: ['pass', 'fail'],
      default: null,
    },

    adminVotes: {
      type: [
        new Schema(
          {
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            choice: { type: String, enum: ['pass', 'fail'], required: true },
            votedAt: { type: Date, required: true, default: Date.now },
          },
          { _id: false }
        ),
      ],
      default: [],
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'community_verification_submissions',
  }
);

communityVerificationSubmissionSchema.index({ status: 1, expiresAt: 1 });
communityVerificationSubmissionSchema.index({ ownerId: 1, status: 1 });
communityVerificationSubmissionSchema.index({ category: 1, status: 1 });
communityVerificationSubmissionSchema.index({ 'adminVotes.userId': 1, status: 1 });

communityVerificationSubmissionSchema.index(
  { trackerId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: 'open',
      deletedAt: null,
    },
  }
);

export const CommunityVerificationSubmission =
  mongoose.models.CommunityVerificationSubmission ||
  mongoose.model<ICommunityVerificationSubmissionDocument>(
    'CommunityVerificationSubmission',
    communityVerificationSubmissionSchema
  );
