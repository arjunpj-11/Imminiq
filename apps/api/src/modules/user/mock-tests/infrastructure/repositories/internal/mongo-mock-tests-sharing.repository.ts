import { MockTestModel } from '../../../../../../infrastructure/database/models/mock-test.model';
import type {
  EnableMockTestSharingInput,
  FindImportedSharedTestInput,
} from '../../../domain/repositories/mock-test-sharing.repository.interface';
import { MongoMockTestsBaseRepository } from '../shared/mongo-mock-tests-base.repository';
import { MongoMockTestsErrorMapper } from '../shared/mongo-mock-tests-error.mapper';
import { MongoMockTestsMapper } from '../shared/mongo-mock-tests.mapper';
import { MongoMockTestsObjectId } from '../shared/mongo-mock-tests-object-id';
import type { RawMockTestDoc } from '../shared/mongo-mock-tests.types';

export class MongoMockTestsSharingRepository extends MongoMockTestsBaseRepository {
  constructor(private readonly _mapper = new MongoMockTestsMapper()) {
    super();
  }

  async findSharedTestByToken(shareToken: string) {
    return this.execute('MOCK_TEST_READ_FAILED', 'Failed to read shared mock test', async () => {
      const doc = await MockTestModel.findOne({
        shareToken,
        isShareEnabled: true,
        deletedAt: null,
      }).lean();

      return doc ? this._mapper.toMockTestEntity(doc as RawMockTestDoc) : null;
    });
  }

  async findImportedSharedTest(input: FindImportedSharedTestInput) {
    return this.execute(
      'MOCK_TEST_READ_FAILED',
      'Failed to read imported shared mock test',
      async () => {
        const { ownerId, sourceTestId } = input;

        const safeOwnerId = MongoMockTestsObjectId.toObjectId(ownerId);
        const safeSourceTestId = MongoMockTestsObjectId.toObjectId(sourceTestId);

        if (!safeOwnerId || !safeSourceTestId) {
          return null;
        }

        const doc = await MockTestModel.findOne({
          ownerId: safeOwnerId,
          sourceTestId: safeSourceTestId,
          deletedAt: null,
        }).lean();

        return doc ? this._mapper.toMockTestEntity(doc as RawMockTestDoc) : null;
      }
    );
  }

  async enableTestSharing(input: EnableMockTestSharingInput) {
    return this.execute(
      'MOCK_TEST_WRITE_FAILED',
      'Failed to enable mock test sharing',
      async () => {
        const { ownerId, testId, shareToken } = input;

        const safeOwnerId = MongoMockTestsObjectId.toObjectId(ownerId);
        const safeTestId = MongoMockTestsObjectId.toObjectId(testId);

        if (!safeOwnerId || !safeTestId) {
          return null;
        }

        const doc = await MockTestModel.findOneAndUpdate(
          {
            _id: safeTestId,
            ownerId: safeOwnerId,
            deletedAt: null,
          },
          {
            $set: {
              shareToken,
              isShareEnabled: true,
            },
          },
          {
            returnDocument: 'after',
          }
        ).lean();

        return doc ? this._mapper.toMockTestEntity(doc as RawMockTestDoc) : null;
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError
    );
  }

  async incrementCloneCount(testId: string) {
    return this.execute(
      'MOCK_TEST_WRITE_FAILED',
      'Failed to increment mock test clone count',
      async () => {
        const safeTestId = MongoMockTestsObjectId.toObjectId(testId);

        if (!safeTestId) {
          return;
        }

        await MockTestModel.findOneAndUpdate(
          {
            _id: safeTestId,
            deletedAt: null,
          },
          {
            $inc: {
              cloneCount: 1,
            },
          }
        );
      }
    );
  }
}

export const mongoMockTestsSharingRepository = new MongoMockTestsSharingRepository();
