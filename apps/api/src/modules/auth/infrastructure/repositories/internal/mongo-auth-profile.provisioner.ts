import { UserProfile } from '../../../../../infrastructure/database/models/user-profile.model'
import type { MongoIdLike } from '../shared/mongo-auth.types'

export class MongoAuthProfileProvisioner {
  async ensureProfile(user: {
    _id: MongoIdLike
    fullName: string
  }): Promise<void> {
    await UserProfile.findOneAndUpdate(
      {
        userId: user._id,
      },
      {
        $setOnInsert: {
          userId: user._id,
          fullName: user.fullName,
          publicProfileEnabled: true,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
        setDefaultsOnInsert: true,
      },
    )
  }
}

export const mongoAuthProfileProvisioner =
  new MongoAuthProfileProvisioner()
