import { MockTestAttemptModel } from '../../../../../../infrastructure/database/models/mock-test-attempt.model';
import type { MockTestAttemptEntity } from '../../../domain/entities/mock-test-attempt.entity';
import type {
  AbandonActiveMockTestAttemptsInput,
  CreateMockTestAttemptInput,
  FindActiveMockTestAttemptInput,
  FindLatestMockTestAttemptsInput,
  FindMockTestAttemptsByUserInput,
  UpdateMockTestAttemptInput,
} from '../../../domain/repositories/mock-test-attempt.repository.interface';
import type { MockTestQuestionFlagInput } from '../../../domain/repositories/mock-test-answer.repository.interface';
import { MongoMockTestsBaseRepository } from '../shared/mongo-mock-tests-base.repository';
import { MongoMockTestsErrorMapper } from '../shared/mongo-mock-tests-error.mapper';
import { MongoMockTestsMapper } from '../shared/mongo-mock-tests.mapper';
import { MongoMockTestsObjectId } from '../shared/mongo-mock-tests-object-id';
import type { RawMockTestAttemptDoc } from '../shared/mongo-mock-tests.types';
import { MongoMockTestsUpdateUtils } from '../shared/mongo-mock-tests-update.utils';

export class MongoMockTestsAttemptRepository extends MongoMockTestsBaseRepository {
  constructor(private readonly _mapper = new MongoMockTestsMapper()) {
    super();
  }

  async findAttemptById(attemptId: string) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_READ_FAILED',
      'Failed to read mock test attempt',
      async () => {
        const safeAttemptId = MongoMockTestsObjectId.toObjectId(attemptId);

        if (!safeAttemptId) {
          return null;
        }

        const doc = await MockTestAttemptModel.findOne({
          _id: safeAttemptId,
          deletedAt: null,
        }).lean();

        return doc ? this._mapper.toMockTestAttemptEntity(doc as RawMockTestAttemptDoc) : null;
      }
    );
  }

  async findAttemptsByUser(input: FindMockTestAttemptsByUserInput) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_READ_FAILED',
      'Failed to read user mock test attempts',
      async () => {
        const { userId, testId } = input;
        const safeUserId = MongoMockTestsObjectId.toObjectId(userId);

        if (!safeUserId) {
          return [];
        }

        const query: Record<string, unknown> = {
          userId: safeUserId,
          deletedAt: null,
        };

        if (testId) {
          const safeTestId = MongoMockTestsObjectId.toObjectId(testId);

          if (!safeTestId) {
            return [];
          }

          query.testId = safeTestId;
        }

        const docs = await MockTestAttemptModel.find(query).sort({ createdAt: -1 }).lean();

        return docs.map((doc) =>
          this._mapper.toMockTestAttemptEntity(doc as RawMockTestAttemptDoc)
        );
      }
    );
  }

  async findLatestAttemptsForTests(input: FindLatestMockTestAttemptsInput) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_READ_FAILED',
      'Failed to read latest mock test attempts',
      async () => {
        const { userId, testIds } = input;
        const safeUserId = MongoMockTestsObjectId.toObjectId(userId);

        if (!safeUserId || !testIds.length) {
          return {};
        }

        const safeTestIds = MongoMockTestsObjectId.toObjectIds(testIds);

        if (!safeTestIds.length) {
          return {};
        }

        const docs = await MockTestAttemptModel.find({
          userId: safeUserId,
          testId: { $in: safeTestIds },
          deletedAt: null,
        })
          .sort({ createdAt: -1 })
          .lean();

        const result: Record<string, MockTestAttemptEntity> = {};

        for (const doc of docs) {
          const mapped = this._mapper.toMockTestAttemptEntity(doc as RawMockTestAttemptDoc);

          if (!result[mapped.testId]) {
            result[mapped.testId] = mapped;
          }
        }

        return result;
      }
    );
  }

  async findActiveAttempt(input: FindActiveMockTestAttemptInput) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_READ_FAILED',
      'Failed to read active mock test attempt',
      async () => {
        const { userId, testId } = input;

        const safeUserId = MongoMockTestsObjectId.toObjectId(userId);
        const safeTestId = MongoMockTestsObjectId.toObjectId(testId);

        if (!safeUserId || !safeTestId) {
          return null;
        }

        const doc = await MockTestAttemptModel.findOne({
          userId: safeUserId,
          testId: safeTestId,
          status: 'in_progress',
          deletedAt: null,
        }).lean();

        return doc ? this._mapper.toMockTestAttemptEntity(doc as RawMockTestAttemptDoc) : null;
      }
    );
  }

  async createAttempt(data: CreateMockTestAttemptInput) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_WRITE_FAILED',
      'Failed to create mock test attempt',
      async () => {
        const doc = await MockTestAttemptModel.create({
          ...data,
          status: 'in_progress',
          startedAt: new Date(),
          answeredQuestions: 0,
          flaggedQuestions: [],
        });

        return this._mapper.toMockTestAttemptEntity(doc.toObject() as RawMockTestAttemptDoc);
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError
    );
  }

  async updateAttempt(attemptId: string, data: UpdateMockTestAttemptInput) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_WRITE_FAILED',
      'Failed to update mock test attempt',
      async () => {
        const safeAttemptId = MongoMockTestsObjectId.toObjectId(attemptId);

        if (!safeAttemptId) {
          return null;
        }

        const update = this.buildMockTestAttemptUpdate(data);

        if (Object.keys(update.$set).length === 0) {
          const existingDoc = await MockTestAttemptModel.findOne({
            _id: safeAttemptId,
            deletedAt: null,
          }).lean();

          return existingDoc
            ? this._mapper.toMockTestAttemptEntity(existingDoc as RawMockTestAttemptDoc)
            : null;
        }

        const doc = await MockTestAttemptModel.findOneAndUpdate(
          {
            _id: safeAttemptId,
            deletedAt: null,
          },
          update,
          {
            returnDocument: "after",
          }
        ).lean();

        return doc ? this._mapper.toMockTestAttemptEntity(doc as RawMockTestAttemptDoc) : null;
      }
    );
  }

  async incrementAnsweredCount(attemptId: string) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_WRITE_FAILED',
      'Failed to increment answered count',
      async () => {
        const safeAttemptId = MongoMockTestsObjectId.toObjectId(attemptId);

        if (!safeAttemptId) {
          return;
        }

        await MockTestAttemptModel.findOneAndUpdate(
          {
            _id: safeAttemptId,
            deletedAt: null,
          },
          {
            $inc: {
              answeredQuestions: 1,
            },
          }
        );
      }
    );
  }

  async abandonActiveAttempts(input: AbandonActiveMockTestAttemptsInput) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_WRITE_FAILED',
      'Failed to abandon active attempts',
      async () => {
        const { userId, testId } = input;

        const safeUserId = MongoMockTestsObjectId.toObjectId(userId);
        const safeTestId = MongoMockTestsObjectId.toObjectId(testId);

        if (!safeUserId || !safeTestId) {
          return;
        }

        await MockTestAttemptModel.updateMany(
          {
            userId: safeUserId,
            testId: safeTestId,
            status: 'in_progress',
            deletedAt: null,
          },
          {
            $set: {
              status: 'abandoned',
            },
          }
        );
      }
    );
  }

  async flagQuestion(input: MockTestQuestionFlagInput) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_WRITE_FAILED',
      'Failed to flag mock test question',
      async () => {
        const { attemptId, questionId } = input;

        const safeAttemptId = MongoMockTestsObjectId.toObjectId(attemptId);
        const safeQuestionId = MongoMockTestsObjectId.toObjectId(questionId);

        if (!safeAttemptId || !safeQuestionId) {
          return;
        }

        await MockTestAttemptModel.findOneAndUpdate(
          {
            _id: safeAttemptId,
            deletedAt: null,
          },
          {
            $addToSet: {
              flaggedQuestions: safeQuestionId,
            },
          }
        );
      }
    );
  }

  async unflagQuestion(input: MockTestQuestionFlagInput) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_WRITE_FAILED',
      'Failed to unflag mock test question',
      async () => {
        const { attemptId, questionId } = input;

        const safeAttemptId = MongoMockTestsObjectId.toObjectId(attemptId);
        const safeQuestionId = MongoMockTestsObjectId.toObjectId(questionId);

        if (!safeAttemptId || !safeQuestionId) {
          return;
        }

        await MockTestAttemptModel.findOneAndUpdate(
          {
            _id: safeAttemptId,
            deletedAt: null,
          },
          {
            $pull: {
              flaggedQuestions: safeQuestionId,
            },
          }
        );
      }
    );
  }

  private buildMockTestAttemptUpdate(data: UpdateMockTestAttemptInput): {
    $set: Record<string, unknown>;
  } {
    const $set: Record<string, unknown> = {};
    const source = data as Record<string, unknown>;

    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'status');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'score');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'maxScore');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'scorePercentage');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'passed');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'answeredQuestions');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'correctAnswers');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'flaggedQuestions');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'startedAt');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'completedAt');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'abandonedAt');
    MongoMockTestsUpdateUtils.setIfDefined($set, source, 'timeTakenSeconds');

    if (source['percentage'] !== undefined) {
      $set.scorePercentage = source['percentage'];
    }

    if (source['answeredCount'] !== undefined) {
      $set.answeredQuestions = source['answeredCount'];
    }

    if (source['correctCount'] !== undefined) {
      $set.correctAnswers = source['correctCount'];
    }

    if (source['timeSpentSeconds'] !== undefined) {
      $set.timeTakenSeconds = source['timeSpentSeconds'];
    }

    return {
      $set,
    };
  }
}

export const mongoMockTestsAttemptRepository = new MongoMockTestsAttemptRepository();
