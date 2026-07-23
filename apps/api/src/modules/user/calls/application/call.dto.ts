import type { CallStatus, CallType, TerminalCallStatus } from '../domain/call.types';

export type InitiateCallInputDTO = {
  calleeUserId: string;
  type: CallType;
  reason: string;
};

export type RespondCallInputDTO = {
  response: 'accept' | 'decline';
};

export type EndCallInputDTO = {
  outcome: Extract<TerminalCallStatus, 'ended' | 'missed' | 'cancelled'>;
};

export type ListCallsInputDTO = {
  page: number;
  limit: number;
};

export type CallParticipantDTO = {
  id: string;
  fullName: string;
  username: string;
  handle: string;
  initials: string;
  avatarUrl: string | null;
};

export type CallViewDTO = {
  id: string;
  type: CallType;
  reason: string;
  status: CallStatus;
  direction: 'incoming' | 'outgoing';
  caller: CallParticipantDTO;
  callee: CallParticipantDTO;
  otherParticipant: CallParticipantDTO;
  acceptedAt: Date | null;
  endedAt: Date | null;
  durationSeconds: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type CallPageDTO = {
  items: CallViewDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
};
