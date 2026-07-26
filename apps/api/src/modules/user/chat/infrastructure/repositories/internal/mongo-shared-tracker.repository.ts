import { Tracker } from '../../../../../../infrastructure/database/models/tracker.model';
import type { ISharedTrackerRepository } from '../../../domain/repositories/shared-tracker.repository.interface';
import { MongoChatBaseRepository } from '../shared/mongo-chat-base.repository';
import { MongoChatNormalizer } from '../shared/mongo-chat-normalizer';

export class MongoSharedTrackerRepository
  extends MongoChatBaseRepository
  implements ISharedTrackerRepository
{
  async findShareableTracker(trackerId: string, _viewerUserId: string) {
    return this.execute('CHAT_TRACKER_READ_FAILED', 'Failed to load shared tracker', async () => {
      const record = await Tracker.findOne({
        _id: MongoChatNormalizer.toObjectId(trackerId, 'INVALID_SHARED_TRACKER_ID'),
        deletedAt: null,
        moderationStatus: { $in: ['active', null] },
        visibility: 'public',
        publishedAt: { $ne: null },
      })
        .select('title description goal visibility')
        .lean<{
          _id: { toString(): string };
          title: string;
          description?: string;
          goal?: string;
          visibility: 'private' | 'public' | 'unlisted';
        } | null>();
      if (!record) return null;
      return {
        trackerId: record._id.toString(),
        title: record.title,
        description: (record.description || record.goal || '').slice(0, 500),
        visibility: record.visibility,
      };
    });
  }
}

export const mongoSharedTrackerRepository = new MongoSharedTrackerRepository();
