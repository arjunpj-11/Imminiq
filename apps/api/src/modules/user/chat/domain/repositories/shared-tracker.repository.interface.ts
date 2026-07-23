import type { SharedTracker } from '../chat.types';

export interface ISharedTrackerRepository {
  findShareableTracker(
    trackerId: string,
    viewerUserId: string
  ): Promise<SharedTracker | null>;
}
