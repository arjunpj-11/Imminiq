import mongoose, { Schema, model, type InferSchemaType } from 'mongoose';

const streakSnapshotSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    snapshotDate: {
      type: Date,
      required: true,
      index: true,
    },
    currentStreak: {
      type: Number,
      min: 0,
      default: 0,
    },
    longestStreak: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalActiveDays: {
      type: Number,
      min: 0,
      default: 0,
    },
    totalFreezeUsed: {
      type: Number,
      min: 0,
      default: 0,
    },
    heatmapData: {
      type: Schema.Types.Mixed,
      default: {},
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'streak_snapshots',
  }
);

streakSnapshotSchema.index({ userId: 1, snapshotDate: 1 }, { unique: true });

export type StreakSnapshotDocument = InferSchemaType<typeof streakSnapshotSchema>;

export const StreakSnapshot =
  mongoose.models.StreakSnapshot || model('StreakSnapshot', streakSnapshotSchema);
