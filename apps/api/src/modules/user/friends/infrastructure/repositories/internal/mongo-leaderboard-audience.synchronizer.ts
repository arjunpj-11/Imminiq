import type mongoose from 'mongoose';

import { LeaderboardAudience } from '../../../../../../infrastructure/database/models/leaderboard-audience.model';

export class MongoLeaderboardAudienceSynchronizer {
  async addFriendship(
    firstUserId: mongoose.Types.ObjectId,
    secondUserId: mongoose.Types.ObjectId,
    session: mongoose.ClientSession
  ): Promise<void> {
    /*
     * MongoDB operations using the same transaction session
     * must execute sequentially.
     */
    await LeaderboardAudience.updateOne(
      {
        userId: firstUserId,
      },
      {
        $addToSet: {
          friendUserIds: secondUserId,
        },
        $setOnInsert: {
          userId: firstUserId,
        },
      },
      {
        upsert: true,
        session,
      }
    );

    await LeaderboardAudience.updateOne(
      {
        userId: secondUserId,
      },
      {
        $addToSet: {
          friendUserIds: firstUserId,
        },
        $setOnInsert: {
          userId: secondUserId,
        },
      },
      {
        upsert: true,
        session,
      }
    );
  }

  async removeFriendship(
    firstUserId: mongoose.Types.ObjectId,
    secondUserId: mongoose.Types.ObjectId,
    session: mongoose.ClientSession
  ): Promise<void> {
    await LeaderboardAudience.updateOne(
      {
        userId: firstUserId,
      },
      {
        $pull: {
          friendUserIds: secondUserId,
        },
      },
      {
        session,
      }
    );

    await LeaderboardAudience.updateOne(
      {
        userId: secondUserId,
      },
      {
        $pull: {
          friendUserIds: firstUserId,
        },
      },
      {
        session,
      }
    );
  }
}
