import { Types } from 'mongoose';

import { ChatDomainError } from '../../../domain/chat-domain.error';

export class MongoChatNormalizer {
  static toObjectId(value: string, code: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(value)) {
      throw new ChatDomainError(code, 'Chat identifier is invalid');
    }
    return new Types.ObjectId(value);
  }

  static pair(firstUserId: string, secondUserId: string) {
    const participantIds = [firstUserId, secondUserId].sort();
    return {
      participantIds: participantIds.map((id) =>
        this.toObjectId(id, 'INVALID_CHAT_PARTICIPANT_ID')
      ),
      pairKey: participantIds.join(':'),
    };
  }
}
