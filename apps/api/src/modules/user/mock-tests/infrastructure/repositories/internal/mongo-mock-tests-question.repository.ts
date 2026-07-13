import { MockTestQuestionModel } from '../../../../../../infrastructure/database/models/mock-test-question.model';
import type { CreateMockTestQuestionInput } from '../../../domain/repositories/mock-test-question.repository.interface';
import { MongoMockTestsBaseRepository } from '../shared/mongo-mock-tests-base.repository';
import { MongoMockTestsErrorMapper } from '../shared/mongo-mock-tests-error.mapper';
import { MongoMockTestsMapper } from '../shared/mongo-mock-tests.mapper';
import { MongoMockTestsObjectId } from '../shared/mongo-mock-tests-object-id';
import type { RawMockTestQuestionDoc } from '../shared/mongo-mock-tests.types';

export class MongoMockTestsQuestionRepository extends MongoMockTestsBaseRepository {
  constructor(private readonly _mapper = new MongoMockTestsMapper()) {
    super();
  }

  async findQuestionsByTest(testId: string) {
    return this.execute(
      'MOCK_TEST_QUESTION_READ_FAILED',
      'Failed to read mock test questions',
      async () => {
        const safeTestId = MongoMockTestsObjectId.toObjectId(testId);

        if (!safeTestId) {
          return [];
        }

        const docs = await MockTestQuestionModel.find({
          testId: safeTestId,
          deletedAt: null,
        })
          .sort({ order: 1 })
          .lean();

        return docs.map((doc) =>
          this._mapper.toMockTestQuestionEntity(doc as RawMockTestQuestionDoc)
        );
      }
    );
  }

  async findQuestionById(questionId: string) {
    return this.execute(
      'MOCK_TEST_QUESTION_READ_FAILED',
      'Failed to read mock test question',
      async () => {
        const safeQuestionId = MongoMockTestsObjectId.toObjectId(questionId);

        if (!safeQuestionId) {
          return null;
        }

        const doc = await MockTestQuestionModel.findOne({
          _id: safeQuestionId,
          deletedAt: null,
        }).lean();

        return doc ? this._mapper.toMockTestQuestionEntity(doc as RawMockTestQuestionDoc) : null;
      }
    );
  }

  async createQuestions(questions: CreateMockTestQuestionInput[]) {
    return this.execute(
      'MOCK_TEST_QUESTION_WRITE_FAILED',
      'Failed to create mock test questions',
      async () => {
        const docs = await MockTestQuestionModel.insertMany(questions);

        return docs.map((doc) =>
          this._mapper.toMockTestQuestionEntity(doc.toObject() as RawMockTestQuestionDoc)
        );
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError
    );
  }
}

export const mongoMockTestsQuestionRepository = new MongoMockTestsQuestionRepository();
