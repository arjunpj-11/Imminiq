import mongoose, { Schema, model, type InferSchemaType } from 'mongoose';

const streakHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    activityCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    intensityLevel: {
      type: String,
      enum: ['none', 'low', 'medium', 'high'],
      default: 'none',
    },
    sources: {
      type: [String],
      default: [],
    },
    streakDay: {
      type: Number,
      min: 0,
      default: 0,
    },
    isFrozen: {
      type: Boolean,
      default: false,
    },
    freezeUsedId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'streak_history',
  }
);

streakHistorySchema.index({ userId: 1, date: 1 }, { unique: true });

export type StreakHistoryDocument = InferSchemaType<typeof streakHistorySchema>;

export const StreakHistory =
  mongoose.models.StreakHistory || model('StreakHistory', streakHistorySchema);
