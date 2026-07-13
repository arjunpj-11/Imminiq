import mongoose from 'mongoose';

import { FriendsDomainError } from '../../../domain/friends-domain.error';

export class MongoFriendsNormalizer {
  private constructor() {}

  static toObjectId(value: string, code = 'INVALID_FRIENDS_OBJECT_ID'): mongoose.Types.ObjectId {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new FriendsDomainError(code, 'Friends identifier is invalid');
    }

    return new mongoose.Types.ObjectId(value);
  }

  static pairKey(
    firstUserId: mongoose.Types.ObjectId | string,
    secondUserId: mongoose.Types.ObjectId | string
  ): string {
    const values = [firstUserId.toString(), secondUserId.toString()].sort();

    return `${values[0]}:${values[1]}`;
  }

  static search(value: string): string {
    return value.trim().replace(/^@+/, '').toLowerCase();
  }

  static escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
