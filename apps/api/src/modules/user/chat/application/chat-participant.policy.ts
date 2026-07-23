import { ChatApplicationError } from './chat-application.error';

export interface IChatParticipantPolicy {
  ensureDifferentUsers(firstUserId: string, secondUserId: string): void;
}

export class ChatParticipantPolicy implements IChatParticipantPolicy {
  ensureDifferentUsers(firstUserId: string, secondUserId: string): void {
    if (firstUserId === secondUserId) throw ChatApplicationError.invalidParticipant();
  }
}
