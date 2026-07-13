import { MockTestReportModel } from '../../../../../../infrastructure/database/models/mock-test-report.model';
import type { CreateMockTestReportInput } from '../../../domain/repositories/mock-test-report.repository.interface';
import { MongoMockTestsBaseRepository } from '../shared/mongo-mock-tests-base.repository';
import { MongoMockTestsErrorMapper } from '../shared/mongo-mock-tests-error.mapper';
import { MongoMockTestsMapper } from '../shared/mongo-mock-tests.mapper';
import { MongoMockTestsObjectId } from '../shared/mongo-mock-tests-object-id';
import type { RawMockTestReportDoc } from '../shared/mongo-mock-tests.types';

export class MongoMockTestsReportRepository extends MongoMockTestsBaseRepository {
  constructor(private readonly _mapper = new MongoMockTestsMapper()) {
    super();
  }

  async findReportByAttempt(attemptId: string) {
    return this.execute(
      'MOCK_TEST_REPORT_READ_FAILED',
      'Failed to read mock test report',
      async () => {
        const safeAttemptId = MongoMockTestsObjectId.toObjectId(attemptId);

        if (!safeAttemptId) {
          return null;
        }

        const doc = await MockTestReportModel.findOne({
          attemptId: safeAttemptId,
          deletedAt: null,
        }).lean();

        return doc
          ? this._mapper.toMockTestReportEntity(doc as RawMockTestReportDoc)
          : null;
      },
    );
  }

  async createReport(data: CreateMockTestReportInput) {
    return this.execute(
      'MOCK_TEST_REPORT_WRITE_FAILED',
      'Failed to create mock test report',
      async () => {
        const doc = await MockTestReportModel.create(data);

        return this._mapper.toMockTestReportEntity(
          doc.toObject() as RawMockTestReportDoc,
        );
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError,
    );
  }
}

export const mongoMockTestsReportRepository =
  new MongoMockTestsReportRepository();
