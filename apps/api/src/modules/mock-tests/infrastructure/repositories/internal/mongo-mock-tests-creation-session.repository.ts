import { MockTestCreationSessionModel } from '../../../../../infrastructure/database/models/mock-test-creation-session.model';
import type {
  CreateMockTestCreationSessionInput,
  UpdateMockTestCreationSessionInput,
} from '../../../domain/repositories/mock-test-creation-session.repository.interface';
import { MongoMockTestsBaseRepository } from '../shared/mongo-mock-tests-base.repository';
import { MongoMockTestsErrorMapper } from '../shared/mongo-mock-tests-error.mapper';
import { MongoMockTestsMapper } from '../shared/mongo-mock-tests.mapper';
import { MongoMockTestsObjectId } from '../shared/mongo-mock-tests-object-id';
import type { RawMockTestCreationSessionDoc } from '../shared/mongo-mock-tests.types';
import { MongoMockTestsUpdateUtils } from '../shared/mongo-mock-tests-update.utils';

export class MongoMockTestsCreationSessionRepository extends MongoMockTestsBaseRepository {
  constructor(private readonly _mapper = new MongoMockTestsMapper()) {
    super();
  }

  async findCreationSession(sessionId: string) {
    return this.execute(
      'MOCK_TEST_CREATION_SESSION_READ_FAILED',
      'Failed to read mock test creation session',
      async () => {
        const safeSessionId = MongoMockTestsObjectId.toObjectId(sessionId);

        if (!safeSessionId) {
          return null;
        }

        const doc = await MockTestCreationSessionModel.findOne({
          _id: safeSessionId,
          deletedAt: null,
        }).lean();

        return doc
          ? this._mapper.toMockTestCreationSessionEntity(
              doc as RawMockTestCreationSessionDoc,
            )
          : null;
      },
    );
  }

  async findActiveCreationSession(userId: string) {
    return this.execute(
      'MOCK_TEST_CREATION_SESSION_READ_FAILED',
      'Failed to read active mock test creation session',
      async () => {
        const safeUserId = MongoMockTestsObjectId.toObjectId(userId);

        if (!safeUserId) {
          return null;
        }

        const doc = await MockTestCreationSessionModel.findOne({
          userId: safeUserId,
          status: 'draft',
          deletedAt: null,
        }).lean();

        return doc
          ? this._mapper.toMockTestCreationSessionEntity(
              doc as RawMockTestCreationSessionDoc,
            )
          : null;
      },
    );
  }

  async createCreationSession(data: CreateMockTestCreationSessionInput) {
    return this.execute(
      'MOCK_TEST_CREATION_SESSION_WRITE_FAILED',
      'Failed to create mock test creation session',
      async () => {
        const doc = await MockTestCreationSessionModel.create({
          userId: data.userId,
          status: 'draft',
          step: 1,
          draftData: {},
        });

        return this._mapper.toMockTestCreationSessionEntity(
          doc.toObject() as RawMockTestCreationSessionDoc,
        );
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError,
    );
  }

  async updateCreationSession(
    sessionId: string,
    data: UpdateMockTestCreationSessionInput,
  ) {
    return this.execute(
      'MOCK_TEST_CREATION_SESSION_WRITE_FAILED',
      'Failed to update mock test creation session',
      async () => {
        const safeSessionId = MongoMockTestsObjectId.toObjectId(sessionId);

        if (!safeSessionId) {
          return null;
        }

        const update = this.buildMockTestCreationSessionUpdate(data);

        if (Object.keys(update.$set).length === 0) {
          const existingDoc = await MockTestCreationSessionModel.findOne({
            _id: safeSessionId,
            deletedAt: null,
          }).lean();

          return existingDoc
            ? this._mapper.toMockTestCreationSessionEntity(
                existingDoc as RawMockTestCreationSessionDoc,
              )
            : null;
        }

        const doc = await MockTestCreationSessionModel.findOneAndUpdate(
          {
            _id: safeSessionId,
            deletedAt: null,
          },
          update,
          {
            new: true,
          },
        ).lean();

        return doc
          ? this._mapper.toMockTestCreationSessionEntity(
              doc as RawMockTestCreationSessionDoc,
            )
          : null;
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError,
    );
  }

  async cancelCreationSession(sessionId: string) {
    return this.execute(
      'MOCK_TEST_CREATION_SESSION_WRITE_FAILED',
      'Failed to cancel mock test creation session',
      async () => {
        const safeSessionId = MongoMockTestsObjectId.toObjectId(sessionId);

        if (!safeSessionId) {
          return;
        }

        await MockTestCreationSessionModel.findOneAndUpdate(
          {
            _id: safeSessionId,
            deletedAt: null,
          },
          {
            $set: {
              status: 'cancelled',
              cancelledAt: new Date(),
            },
          },
        );
      },
    );
  }

  private buildMockTestCreationSessionUpdate(
    data: UpdateMockTestCreationSessionInput,
  ): {
    $set: Record<string, unknown>;
  } {
    const $set: Record<string, unknown> = {};
    const source = data as Record<string, unknown>;

    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'title');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'description');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'difficulty');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'visibility');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'timeLimitMinutes');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'passingScore');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'questionCount');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'tags');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'trackerId');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'generatedTestId');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'status');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'completedAt');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'cancelledAt');

    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'step');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'draftData');

    return {
      $set,
    };
  }
}

export const mongoMockTestsCreationSessionRepository =
  new MongoMockTestsCreationSessionRepository();
