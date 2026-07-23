import type { CallEntity } from '../entities/call.entity';
import type { ListCallsInput, PaginatedCallsResult } from '../call.types';

export interface ICallQueryRepository {
  findById(callId: string): Promise<CallEntity | null>;
  findActiveForUser(userId: string): Promise<CallEntity | null>;
  listCalls(input: ListCallsInput): Promise<PaginatedCallsResult<CallEntity>>;
}
