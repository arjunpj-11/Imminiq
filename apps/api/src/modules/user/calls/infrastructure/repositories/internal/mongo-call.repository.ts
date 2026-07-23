import { Call } from '../../../../../../infrastructure/database/models/call.model';
import { CallDomainError } from '../../../domain/call-domain.error';
import type {
  CreateCallInput,
  ICallCommandRepository,
  TransitionCallInput,
} from '../../../domain/repositories/call-command.repository.interface';
import type { ICallQueryRepository } from '../../../domain/repositories/call-query.repository.interface';
import type { ListCallsInput } from '../../../domain/call.types';
import { MongoCallBaseRepository } from '../shared/mongo-call-base.repository';
import { MongoCallMapper } from '../shared/mongo-call.mapper';
import { MongoCallNormalizer } from '../shared/mongo-call-normalizer';
import type { MongoCallRecord, MongoDuplicateKeyError } from '../shared/mongo-call.types';

export class MongoCallRepository
  extends MongoCallBaseRepository
  implements ICallCommandRepository, ICallQueryRepository
{
  constructor(private readonly _mapper = new MongoCallMapper()) {
    super();
  }

  async createCall(input: CreateCallInput) {
    try {
      const created = await Call.create({
        callerId: MongoCallNormalizer.toObjectId(input.callerId, 'INVALID_CALL_CALLER_ID'),
        calleeId: MongoCallNormalizer.toObjectId(input.calleeId, 'INVALID_CALL_CALLEE_ID'),
        participantIds: [
          MongoCallNormalizer.toObjectId(input.callerId, 'INVALID_CALL_CALLER_ID'),
          MongoCallNormalizer.toObjectId(input.calleeId, 'INVALID_CALL_CALLEE_ID'),
        ],
        type: input.type,
        reason: input.reason,
        status: 'ringing',
        expiresAt: input.expiresAt,
        deletedAt: null,
      });
      return this._mapper.toCallEntity(created.toObject() as MongoCallRecord);
    } catch (error) {
      if ((error as MongoDuplicateKeyError | null)?.code === 11000) {
        throw new CallDomainError('CALL_ACTIVE_CONFLICT', 'A participant is already in a call');
      }
      throw error;
    }
  }

  async transitionCall(input: TransitionCallInput) {
    return this.execute('CALL_UPDATE_FAILED', 'Failed to update call', async () => {
      const terminal = ['declined', 'ended', 'missed', 'cancelled'].includes(input.status);
      const updated = await Call.findOneAndUpdate(
        {
          _id: MongoCallNormalizer.toObjectId(input.callId),
          status: input.expectedStatus,
          deletedAt: null,
        },
        {
          $set: {
            status: input.status,
            ...(input.status === 'accepted' ? { acceptedAt: input.changedAt } : {}),
            ...(terminal ? { endedAt: input.changedAt } : {}),
            ...(input.durationSeconds !== undefined
              ? { durationSeconds: input.durationSeconds }
              : {}),
          },
        },
        { returnDocument: 'after', runValidators: true }
      ).lean<MongoCallRecord | null>();
      return updated ? this._mapper.toCallEntity(updated) : null;
    });
  }

  async findById(callId: string) {
    return this.execute('CALL_READ_FAILED', 'Failed to load call', async () => {
      const record = await Call.findOne({
        _id: MongoCallNormalizer.toObjectId(callId),
        deletedAt: null,
      }).lean<MongoCallRecord | null>();
      return record ? this._mapper.toCallEntity(record) : null;
    });
  }

  async findActiveForUser(userId: string) {
    return this.execute('CALL_ACTIVE_READ_FAILED', 'Failed to load active call', async () => {
      const now = new Date();
      await Call.updateMany(
        { status: 'ringing', expiresAt: { $lte: now }, deletedAt: null },
        { $set: { status: 'missed', endedAt: now } }
      );
      const record = await Call.findOne({
        participantIds: MongoCallNormalizer.toObjectId(userId, 'INVALID_CALL_PARTICIPANT_ID'),
        status: { $in: ['ringing', 'accepted'] },
        deletedAt: null,
      })
        .sort({ createdAt: -1 })
        .lean<MongoCallRecord | null>();
      return record ? this._mapper.toCallEntity(record) : null;
    });
  }

  async listCalls(input: ListCallsInput) {
    return this.execute('CALL_HISTORY_READ_FAILED', 'Failed to load call history', async () => {
      const filter = {
        participantIds: MongoCallNormalizer.toObjectId(
          input.viewerUserId,
          'INVALID_CALL_PARTICIPANT_ID'
        ),
        deletedAt: null,
      };
      const skip = (input.page - 1) * input.limit;
      const [records, total] = await Promise.all([
        Call.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(input.limit)
          .lean<MongoCallRecord[]>(),
        Call.countDocuments(filter),
      ]);
      return {
        items: records.map((record) => this._mapper.toCallEntity(record)),
        page: input.page,
        limit: input.limit,
        total,
        hasMore: skip + records.length < total,
      };
    });
  }
}

export const mongoCallRepository = new MongoCallRepository();
