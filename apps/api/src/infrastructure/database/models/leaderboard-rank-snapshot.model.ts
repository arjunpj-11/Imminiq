import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaderboardRankSnapshotDocument extends Document {
  snapshotKey: string;
  capturedAt: Date;
  section: 'students' | 'trainers';
  userId: mongoose.Types.ObjectId;
  score: number;
  level: number;
  streakCount: number;
  rank: number;
  createdAt: Date;
  updatedAt: Date;
}

const leaderboardRankSnapshotSchema = new Schema<ILeaderboardRankSnapshotDocument>(
  {
    snapshotKey: {
      type: String,
      required: true,
      trim: true,
    },
    capturedAt: {
      type: Date,
      required: true,
    },
    section: {
      type: String,
      enum: ['students', 'trainers'],
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    level: {
      type: Number,
      required: true,
      min: 1,
    },
    streakCount: {
      type: Number,
      required: true,
      min: 0,
    },
    rank: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

leaderboardRankSnapshotSchema.index(
  {
    snapshotKey: 1,
    section: 1,
    userId: 1,
  },
  {
    unique: true,
  }
);

leaderboardRankSnapshotSchema.index({
  section: 1,
  capturedAt: -1,
  rank: 1,
});

leaderboardRankSnapshotSchema.index({
  section: 1,
  capturedAt: -1,
  userId: 1,
});

export const LeaderboardRankSnapshot =
  mongoose.models.LeaderboardRankSnapshot ||
  mongoose.model<ILeaderboardRankSnapshotDocument>(
    'LeaderboardRankSnapshot',
    leaderboardRankSnapshotSchema
  );
