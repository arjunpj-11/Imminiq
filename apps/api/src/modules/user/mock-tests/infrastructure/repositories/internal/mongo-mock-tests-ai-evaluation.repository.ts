import { MockTestAIEvaluationModel } from '../../../../../../infrastructure/database/models/mock-test-ai-evaluation.model';
import type { CreateMockTestAIEvaluationInput } from '../../../domain/repositories/mock-test-ai-evaluation.repository.interface';
import { MongoMockTestsBaseRepository } from '../shared/mongo-mock-tests-base.repository';
import { MongoMockTestsErrorMapper } from '../shared/mongo-mock-tests-error.mapper';
import { MongoMockTestsMapper } from '../shared/mongo-mock-tests.mapper';
import { MongoMockTestsObjectId } from '../shared/mongo-mock-tests-object-id';
import type { RawMockTestAIEvaluationDoc } from '../shared/mongo-mock-tests.types';

export class MongoMockTestsAIEvaluationRepository extends MongoMockTestsBaseRepository {
  constructor(private readonly _mapper = new MongoMockTestsMapper()) {
    super();
  }

  async createAIEvaluation(data: CreateMockTestAIEvaluationInput) {
    return this.execute(
      'MOCK_TEST_AI_EVALUATION_WRITE_FAILED',
      'Failed to create mock test AI evaluation',
      async () => {
        const doc = await MockTestAIEvaluationModel.create({
          ...data,
          status: 'completed',
        });

        return this._mapper.toMockTestAIEvaluationEntity(
          doc.toObject() as RawMockTestAIEvaluationDoc
        );
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError
    );
  }

  async findAIEvaluationsByAttempt(attemptId: string) {
    return this.execute(
      'MOCK_TEST_AI_EVALUATION_READ_FAILED',
      'Failed to read mock test AI evaluations',
      async () => {
        const safeAttemptId = MongoMockTestsObjectId.toObjectId(attemptId);

        if (!safeAttemptId) {
          return [];
        }

        const docs = await MockTestAIEvaluationModel.find({
          attemptId: safeAttemptId,
          deletedAt: null,
        }).lean();

        return docs.map((doc) =>
          this._mapper.toMockTestAIEvaluationEntity(doc as RawMockTestAIEvaluationDoc)
        );
      }
    );
  }
}

export const mongoMockTestsAIEvaluationRepository = new MongoMockTestsAIEvaluationRepository();
