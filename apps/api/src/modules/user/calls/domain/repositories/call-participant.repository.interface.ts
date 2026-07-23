import type { CallParticipantEntity } from '../entities/call-participant.entity';

export interface ICallParticipantRepository {
  findParticipants(userIds: string[]): Promise<Map<string, CallParticipantEntity>>;
}
