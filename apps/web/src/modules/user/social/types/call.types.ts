export type CallType = 'audio' | 'video';
export type CallStatus = 'ringing' | 'accepted' | 'declined' | 'ended' | 'missed' | 'cancelled';

export interface ICallParticipant {
  id: string;
  fullName: string;
  username: string;
  handle: string;
  initials: string;
  avatarUrl: string | null;
}

export interface ICall {
  id: string;
  type: CallType;
  reason: string;
  status: CallStatus;
  direction: 'incoming' | 'outgoing';
  caller: ICallParticipant;
  callee: ICallParticipant;
  otherParticipant: ICallParticipant;
  acceptedAt: string | null;
  endedAt: string | null;
  durationSeconds: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICallPage {
  items: ICall[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export interface ICallApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ICallApiError {
  message?: string;
  code?: string;
}

export interface ICallIceConfiguration {
  iceServers: RTCIceServer[];
  expiresInSeconds: number | null;
}

export type CallSignal =
  | { type: 'offer'; description: RTCSessionDescriptionInit }
  | { type: 'answer'; description: RTCSessionDescriptionInit }
  | { type: 'ice-candidate'; candidate: RTCIceCandidateInit };

export type CallLaunchTarget = {
  participant: ICallParticipant;
  type: CallType;
};
