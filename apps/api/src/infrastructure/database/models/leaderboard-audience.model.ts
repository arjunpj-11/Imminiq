import type { Document} from 'mongoose';
import mongoose, { Schema } from 'mongoose';

export interface ILeaderboardAudienceDocument extends Document {
  userId: mongoose.Types.ObjectId;
  friendUserIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const leaderboardAudienceSchema = new Schema<ILeaderboardAudienceDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    friendUserIds: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

leaderboardAudienceSchema.index(
  {
    userId: 1,
  },
  {
    unique: true,
  }
);

export const LeaderboardAudience =
  mongoose.models.LeaderboardAudience ||
  mongoose.model<ILeaderboardAudienceDocument>('LeaderboardAudience', leaderboardAudienceSchema);
