import { MockTestAnswerModel } from '../../../../../../infrastructure/database/models/mock-test-answer.model';
import type {
  FindMockTestAnswerByQuestionInput,
  SaveMockTestAnswerInput,
  UpdateMockTestAnswerInput,
} from '../../../domain/repositories/mock-test-answer.repository.interface';
import { MongoMockTestsBaseRepository } from '../shared/mongo-mock-tests-base.repository';
import { MongoMockTestsErrorMapper } from '../shared/mongo-mock-tests-error.mapper';
import { MongoMockTestsMapper } from '../shared/mongo-mock-tests.mapper';
import { MongoMockTestsObjectId } from '../shared/mongo-mock-tests-object-id';
import type { RawMockTestAnswerDoc } from '../shared/mongo-mock-tests.types';
import { MongoMockTestsUpdateUtils } from '../shared/mongo-mock-tests-update.utils';

export class MongoMockTestsAnswerRepository extends MongoMockTestsBaseRepository {
  constructor(private readonly _mapper = new MongoMockTestsMapper()) {
    super();
  }

  async findAnswersByAttempt(attemptId: string) {
    return this.execute(
      'MOCK_TEST_ANSWER_READ_FAILED',
      'Failed to read mock test answers',
      async () => {
        const safeAttemptId = MongoMockTestsObjectId.toObjectId(attemptId);

        if (!safeAttemptId) {
          return [];
        }

        const docs = await MockTestAnswerModel.find({
          attemptId: safeAttemptId,
          deletedAt: null,
        }).lean();

        return docs.map((doc) => this._mapper.toMockTestAnswerEntity(doc as RawMockTestAnswerDoc));
      }
    );
  }

  async findAnswerByQuestion(input: FindMockTestAnswerByQuestionInput) {
    return this.execute(
      'MOCK_TEST_ANSWER_READ_FAILED',
      'Failed to read mock test answer',
      async () => {
        const { attemptId, questionId } = input;

        const safeAttemptId = MongoMockTestsObjectId.toObjectId(attemptId);
        const safeQuestionId = MongoMockTestsObjectId.toObjectId(questionId);

        if (!safeAttemptId || !safeQuestionId) {
          return null;
        }

        const doc = await MockTestAnswerModel.findOne({
          attemptId: safeAttemptId,
          questionId: safeQuestionId,
          deletedAt: null,
        }).lean();

        return doc ? this._mapper.toMockTestAnswerEntity(doc as RawMockTestAnswerDoc) : null;
      }
    );
  }

  async saveAnswer(data: SaveMockTestAnswerInput) {
    return this.execute(
      'MOCK_TEST_ANSWER_WRITE_FAILED',
      'Failed to save mock test answer',
      async () => {
        const doc = await MockTestAnswerModel.create(data);

        return this._mapper.toMockTestAnswerEntity(doc.toObject() as RawMockTestAnswerDoc);
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError
    );
  }

  async updateAnswer(answerId: string, data: UpdateMockTestAnswerInput) {
    return this.execute(
      'MOCK_TEST_ANSWER_WRITE_FAILED',
      'Failed to update mock test answer',
      async () => {
        const safeAnswerId = MongoMockTestsObjectId.toObjectId(answerId);

        if (!safeAnswerId) {
          return null;
        }

        const update = this.buildMockTestAnswerUpdate(data);

        if (Object.keys(update.$set).length === 0) {
          const existingDoc = await MockTestAnswerModel.findOne({
            _id: safeAnswerId,
            deletedAt: null,
          }).lean();

          return existingDoc
            ? this._mapper.toMockTestAnswerEntity(existingDoc as RawMockTestAnswerDoc)
            : null;
        }

        const doc = await MockTestAnswerModel.findOneAndUpdate(
          {
            _id: safeAnswerId,
            deletedAt: null,
          },
          update,
          {
            returnDocument: 'after',
          }
        ).lean();

        return doc ? this._mapper.toMockTestAnswerEntity(doc as RawMockTestAnswerDoc) : null;
      }
    );
  }

  private buildMockTestAnswerUpdate(data: UpdateMockTestAnswerInput): {
    $set: Record<string, unknown>;
  } {
    const $set: Record<string, unknown> = {};

    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'answer');
    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'isCorrect');
    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'pointsEarned');

    return {
      $set,
    };
  }
}

export const mongoMockTestsAnswerRepository = new MongoMockTestsAnswerRepository();
