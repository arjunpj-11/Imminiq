import type { Types } from 'mongoose';
import type { CallStatus, CallType } from '../../../domain/call.types';

export type MongoCallRecord = {
  _id: Types.ObjectId;
  callerId: Types.ObjectId;
  calleeId: Types.ObjectId;
  type: CallType;
  reason: string;
  status: CallStatus;
  acceptedAt?: Date | null;
  endedAt?: Date | null;
  durationSeconds?: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type MongoCallParticipantRecord = {
  _id: Types.ObjectId;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
};

export type MongoDuplicateKeyError = {
  code?: number;
};
