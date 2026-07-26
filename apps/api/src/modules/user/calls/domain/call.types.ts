export type CallType = 'audio' | 'video';
export type CallStatus = 'ringing' | 'accepted' | 'declined' | 'ended' | 'missed' | 'cancelled';
export type TerminalCallStatus = Extract<CallStatus, 'declined' | 'ended' | 'missed' | 'cancelled'>;

export type ListCallsInput = {
  viewerUserId: string;
  page: number;
  limit: number;
};

export type PaginatedCallsResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};
