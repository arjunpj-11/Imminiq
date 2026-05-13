import { Tracker } from '../../infrastructure/database/models/tracker.model'

export const trackerRepository = {
  hasAnyTrackerForUser: async (userId: string): Promise<boolean> => {
    const tracker = await Tracker.exists({
      ownerId: userId,
      deletedAt: null,
    })

    return Boolean(tracker)
  },
}