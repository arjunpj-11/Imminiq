import type { SharedProfile } from '../chat.types';

export interface ISharedProfileRepository {
  findShareableProfile(
    username: string,
    viewerUserId: string
  ): Promise<SharedProfile | null>;
}
