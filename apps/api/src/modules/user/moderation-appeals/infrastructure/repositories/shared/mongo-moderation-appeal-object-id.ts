import { Types } from 'mongoose';

import { ModerationAppealDomainError } from '../../../domain/moderation-appeal-domain.error';

export class MongoModerationAppealObjectId {
  private constructor() {}

  static fromOrNull(value: string): Types.ObjectId | null {
    if (!Types.ObjectId.isValid(value)) {
      return null;
    }

    return new Types.ObjectId(value);
  }

  static fromOrThrow(value: string): Types.ObjectId {
    const objectId = MongoModerationAppealObjectId.fromOrNull(value);

    if (!objectId) {
      throw new ModerationAppealDomainError(
        'INVALID_OBJECT_ID',
        'Invalid moderation appeal object id'
      );
    }

    return objectId;
  }
}
