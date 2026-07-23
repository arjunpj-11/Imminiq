import type { ChatParticipantEntity } from '../entities/chat-participant.entity';

export interface IChatParticipantRepository {
  findParticipants(userIds: string[]): Promise<Map<string, ChatParticipantEntity>>;
}
