import { CallEntity } from '../../../domain/entities/call.entity';
import { CallParticipantEntity } from '../../../domain/entities/call-participant.entity';
import type { MongoCallParticipantRecord, MongoCallRecord } from './mongo-call.types';

export class MongoCallMapper {
  toCallEntity(record: MongoCallRecord) {
    return new CallEntity({
      id: record._id.toString(),
      callerId: record.callerId.toString(),
      calleeId: record.calleeId.toString(),
      type: record.type,
      reason: record.reason,
      status: record.status,
      acceptedAt: record.acceptedAt ?? null,
      endedAt: record.endedAt ?? null,
      durationSeconds: record.durationSeconds ?? 0,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  toParticipantEntity(record: MongoCallParticipantRecord) {
    return new CallParticipantEntity({
      id: record._id.toString(),
      fullName: record.fullName,
      username: record.username,
      avatarUrl: record.avatarUrl ?? null,
    });
  }
}
