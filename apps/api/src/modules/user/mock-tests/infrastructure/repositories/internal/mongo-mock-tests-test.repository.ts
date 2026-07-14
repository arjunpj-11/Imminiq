import { MockTestQuestionModel } from '../../../../../../infrastructure/database/models/mock-test-question.model';
import { MockTestModel } from '../../../../../../infrastructure/database/models/mock-test.model';
import type {
  CreateMockTestInput,
  FindMockTestsByOwnerInput,
  FindPublicMockTestsInput,
  UpdateMockTestInput,
} from '../../../domain/repositories/mock-test.repository.interface';
import type { DifficultyLevel } from '../../../domain/value-objects/difficulty-level.vo';
import { MongoMockTestsBaseRepository } from '../shared/mongo-mock-tests-base.repository';
import { MongoMockTestsErrorMapper } from '../shared/mongo-mock-tests-error.mapper';
import { MongoMockTestsMapper } from '../shared/mongo-mock-tests.mapper';
import { MongoMockTestsObjectId } from '../shared/mongo-mock-tests-object-id';
import { MongoMockTestsQueryUtils } from '../shared/mongo-mock-tests-query.utils';
import type { RawMockTestDoc } from '../shared/mongo-mock-tests.types';
import { MongoMockTestsUpdateUtils } from '../shared/mongo-mock-tests-update.utils';

export class MongoMockTestsTestRepository extends MongoMockTestsBaseRepository {
  constructor(private readonly _mapper = new MongoMockTestsMapper()) {
    super();
  }

  async findTestById(testId: string) {
    return this.execute('MOCK_TEST_READ_FAILED', 'Failed to read mock test', async () => {
      const safeTestId = MongoMockTestsObjectId.toObjectId(testId);

      if (!safeTestId) {
        return null;
      }

      const doc = await MockTestModel.findOne({
        _id: safeTestId,
        deletedAt: null,
      }).lean();

      return doc ? this._mapper.toMockTestEntity(doc as RawMockTestDoc) : null;
    });
  }

  async findTestsByOwner(input: FindMockTestsByOwnerInput) {
    return this.execute('MOCK_TEST_READ_FAILED', 'Failed to read owner mock tests', async () => {
      const { ownerId, page = 1, limit = 6 } = input;
      const safeOwnerId = MongoMockTestsObjectId.toObjectId(ownerId);

      if (!safeOwnerId) {
        return {
          tests: [],
          total: 0,
        };
      }

      const safePage = MongoMockTestsQueryUtils.sanitizePage(page);
      const safeLimit = MongoMockTestsQueryUtils.sanitizeLimit(limit);
      const skip = (safePage - 1) * safeLimit;

      const query = {
        ownerId: safeOwnerId,
        deletedAt: null,
      };

      const [docs, total] = await Promise.all([
        MockTestModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
        MockTestModel.countDocuments(query),
      ]);

      return {
        tests: docs.map((doc) => this._mapper.toMockTestEntity(doc as RawMockTestDoc)),
        total,
      };
    });
  }

  async findPublicTests(input: FindPublicMockTestsInput) {
    return this.execute('MOCK_TEST_READ_FAILED', 'Failed to read public mock tests', async () => {
      const { difficulty, tags, page = 1, limit = 20 } = input;

      const safeDifficulty = MongoMockTestsQueryUtils.sanitizeDifficulty(difficulty);
      const safeTags = MongoMockTestsQueryUtils.sanitizeTags(tags);
      const safePage = MongoMockTestsQueryUtils.sanitizePage(page);
      const safeLimit = MongoMockTestsQueryUtils.sanitizeLimit(limit);
      const skip = (safePage - 1) * safeLimit;

      const docs = await this.findPublicTestDocsByDifficulty(safeDifficulty);

      const filteredDocs = safeTags.length
        ? docs.filter((doc) => {
            const docTags = Array.isArray(doc.tags) ? doc.tags : [];

            return safeTags.some((tag) => docTags.includes(tag));
          })
        : docs;

      const paginatedDocs = filteredDocs.slice(skip, skip + safeLimit);

      return {
        tests: paginatedDocs.map((doc) => this._mapper.toMockTestEntity(doc)),
        total: filteredDocs.length,
      };
    });
  }

  async createTest(data: CreateMockTestInput) {
    return this.execute(
      'MOCK_TEST_WRITE_FAILED',
      'Failed to create mock test',
      async () => {
        const doc = await MockTestModel.create(data);

        return this._mapper.toMockTestEntity(doc.toObject() as RawMockTestDoc);
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError
    );
  }

  async updateTest(testId: string, data: UpdateMockTestInput) {
    return this.execute(
      'MOCK_TEST_WRITE_FAILED',
      'Failed to update mock test',
      async () => {
        const safeTestId = MongoMockTestsObjectId.toObjectId(testId);

        if (!safeTestId) {
          return null;
        }

        const update = this.buildMockTestUpdate(data);

        if (Object.keys(update.$set).length === 0) {
          const existingDoc = await MockTestModel.findOne({
            _id: safeTestId,
            deletedAt: null,
          }).lean();

          return existingDoc ? this._mapper.toMockTestEntity(existingDoc as RawMockTestDoc) : null;
        }

        const doc = await MockTestModel.findOneAndUpdate(
          {
            _id: safeTestId,
            deletedAt: null,
          },
          update,
          {
            returnDocument: 'after',
          }
        ).lean();

        return doc ? this._mapper.toMockTestEntity(doc as RawMockTestDoc) : null;
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError
    );
  }

  async deleteTest(testId: string) {
    return this.execute('MOCK_TEST_DELETE_FAILED', 'Failed to delete mock test', async () => {
      const safeTestId = MongoMockTestsObjectId.toObjectId(testId);

      if (!safeTestId) {
        return;
      }

      await Promise.all([
        MockTestQuestionModel.deleteMany({
          testId: safeTestId,
        }),
        MockTestModel.findOneAndDelete({
          _id: safeTestId,
        }),
      ]);
    });
  }

  private buildMockTestUpdate(data: UpdateMockTestInput): {
    $set: Record<string, unknown>;
  } {
    const $set: Record<string, unknown> = {};

    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'title');
    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'description');
    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'difficulty');
    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'visibility');
    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'timeLimitMinutes');
    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'passingScore');
    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'questionCount');
    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'tags');
    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'trackerId');
    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'sourceTestId');
    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'shareToken');
    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'isShareEnabled');
    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'isAIGenerated');
    MongoMockTestsUpdateUtils.setIfDefined($set, data, 'cloneCount');

    return {
      $set,
    };
  }

  private async findPublicTestDocsByDifficulty(
    difficulty?: DifficultyLevel
  ): Promise<RawMockTestDoc[]> {
    if (difficulty === 'easy') {
      return (await MockTestModel.find({
        visibility: 'public',
        difficulty: 'easy',
        deletedAt: null,
      })
        .sort({ createdAt: -1 })
        .lean()) as RawMockTestDoc[];
    }

    if (difficulty === 'medium') {
      return (await MockTestModel.find({
        visibility: 'public',
        difficulty: 'medium',
        deletedAt: null,
      })
        .sort({ createdAt: -1 })
        .lean()) as RawMockTestDoc[];
    }

    if (difficulty === 'hard') {
      return (await MockTestModel.find({
        visibility: 'public',
        difficulty: 'hard',
        deletedAt: null,
      })
        .sort({ createdAt: -1 })
        .lean()) as RawMockTestDoc[];
    }

    return (await MockTestModel.find({
      visibility: 'public',
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .lean()) as RawMockTestDoc[];
  }
}

export const mongoMockTestsTestRepository = new MongoMockTestsTestRepository();
