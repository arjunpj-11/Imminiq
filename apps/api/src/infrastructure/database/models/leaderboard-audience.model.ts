import mongoose, { Document, Schema } from 'mongoose'

export interface ILeaderboardAudience extends Document {
  userId: mongoose.Types.ObjectId
  friendUserIds: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const leaderboardAudienceSchema = new Schema<ILeaderboardAudience>(
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
  },
)

leaderboardAudienceSchema.index(
  {
    userId: 1,
  },
  {
    unique: true,
  },
)

export const LeaderboardAudience =
  mongoose.models.LeaderboardAudience ||
  mongoose.model<ILeaderboardAudience>(
    'LeaderboardAudience',
    leaderboardAudienceSchema,
  )
