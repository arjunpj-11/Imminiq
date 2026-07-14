import { MockTestAnalyticsSnapshotModel } from '../../../../../../infrastructure/database/models/mock-test-analytics-snapshot.model';
import { MockTestAttemptModel } from '../../../../../../infrastructure/database/models/mock-test-attempt.model';
import { MockTestModel } from '../../../../../../infrastructure/database/models/mock-test.model';
import { MongoMockTestsBaseRepository } from '../shared/mongo-mock-tests-base.repository';
import { MongoMockTestsErrorMapper } from '../shared/mongo-mock-tests-error.mapper';
import { MongoMockTestsMapper } from '../shared/mongo-mock-tests.mapper';
import { MongoMockTestsObjectId } from '../shared/mongo-mock-tests-object-id';
import type {
  AnalyticsSnapshotAggregation,
  PerformanceTrendAggregation,
  QuestionCountDoc,
  RawMockTestAttemptDoc,
  RawMockTestDoc,
  UserSummaryAggregation,
} from '../shared/mongo-mock-tests.types';

export class MongoMockTestsAnalyticsRepository extends MongoMockTestsBaseRepository {
  constructor(private readonly _mapper = new MongoMockTestsMapper()) {
    super();
  }

  async getAttemptHistory(userId: string) {
    return this.execute(
      'MOCK_TEST_ANALYTICS_READ_FAILED',
      'Failed to read mock test attempt history',
      async () => {
        const safeUserId = MongoMockTestsObjectId.toObjectId(userId);

        if (!safeUserId) {
          return [];
        }

        const docs = await MockTestAttemptModel.find({
          userId: safeUserId,
          deletedAt: null,
        })
          .populate('testId')
          .sort({ createdAt: -1 })
          .lean();

        return docs.map((doc) => {
          const attemptDoc = doc as RawMockTestAttemptDoc;
          const populatedTest = this._mapper.isRecord(attemptDoc.testId)
            ? this._mapper.toMockTestEntity(attemptDoc.testId as RawMockTestDoc)
            : null;

          return {
            ...this._mapper.toMockTestAttemptEntity(attemptDoc),
            test: populatedTest,
          };
        });
      }
    );
  }

  async getUserSummary(userId: string) {
    return this.execute(
      'MOCK_TEST_ANALYTICS_READ_FAILED',
      'Failed to read mock test user summary',
      async () => {
        const safeUserId = MongoMockTestsObjectId.toObjectId(userId);

        if (!safeUserId) {
          return {
            totalTests: 0,
            totalQuestions: 0,
            completedAttempts: 0,
            averageScore: 0,
            bestScore: 0,
            passedAttempts: 0,
          };
        }

        const [tests, completedAgg] = await Promise.all([
          MockTestModel.find({
            ownerId: safeUserId,
            deletedAt: null,
          })
            .select('questionCount')
            .lean(),
          MockTestAttemptModel.aggregate<UserSummaryAggregation>([
            {
              $match: {
                userId: safeUserId,
                status: 'completed',
                deletedAt: null,
              },
            },
            {
              $group: {
                _id: null,
                completedAttempts: { $sum: 1 },
                averageScore: { $avg: '$scorePercentage' },
                bestScore: { $max: '$scorePercentage' },
                passedAttempts: {
                  $sum: { $cond: ['$passed', 1, 0] },
                },
              },
            },
          ]),
        ]);

        const typedTests = tests as QuestionCountDoc[];
        const completed = completedAgg[0];

        return {
          totalTests: typedTests.length,
          totalQuestions: typedTests.reduce((sum, test) => sum + (test.questionCount || 0), 0),
          completedAttempts: completed?.completedAttempts || 0,
          averageScore: Math.round(completed?.averageScore || 0),
          bestScore: Math.round(completed?.bestScore || 0),
          passedAttempts: completed?.passedAttempts || 0,
        };
      }
    );
  }

  async getPerformanceTrends(userId: string) {
    return this.execute(
      'MOCK_TEST_ANALYTICS_READ_FAILED',
      'Failed to read mock test performance trends',
      async () => {
        const safeUserId = MongoMockTestsObjectId.toObjectId(userId);

        if (!safeUserId) {
          return [];
        }

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const aggregation = await MockTestAttemptModel.aggregate<PerformanceTrendAggregation>([
          {
            $match: {
              userId: safeUserId,
              status: 'completed',
              completedAt: { $gte: thirtyDaysAgo },
              deletedAt: null,
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$completedAt',
                },
              },
              averageScore: { $avg: '$scorePercentage' },
              attempts: { $sum: 1 },
            },
          },
          {
            $sort: {
              _id: 1,
            },
          },
        ]);

        return aggregation.map((item) => ({
          date: item._id,
          averageScore: Math.round(item.averageScore),
          attempts: item.attempts,
        }));
      }
    );
  }

  async getTopicBreakdown(userId: string) {
    return this.execute(
      'MOCK_TEST_ANALYTICS_READ_FAILED',
      'Failed to read mock test topic breakdown',
      async () => {
        const safeUserId = MongoMockTestsObjectId.toObjectId(userId);

        if (!safeUserId) {
          return [];
        }

        const attempts = await MockTestAttemptModel.find({
          userId: safeUserId,
          status: 'completed',
          deletedAt: null,
        })
          .populate('testId', 'tags')
          .lean();

        const topicData: Record<string, { total: number; scoreSum: number }> = {};

        for (const attempt of attempts as RawMockTestAttemptDoc[]) {
          const testDoc = this._mapper.isRecord(attempt.testId) ? attempt.testId : null;

          const tags =
            testDoc && Array.isArray(testDoc['tags']) ? (testDoc['tags'] as string[]) : [];

          for (const tag of tags) {
            topicData[tag] ||= {
              total: 0,
              scoreSum: 0,
            };
            topicData[tag].total += 1;
            topicData[tag].scoreSum += attempt.scorePercentage || 0;
          }
        }

        return Object.entries(topicData)
          .map(([topic, data]) => ({
            topic,
            averageScore: Math.round(data.scoreSum / data.total),
            totalAttempts: data.total,
          }))
          .sort((first, second) => first.averageScore - second.averageScore);
      }
    );
  }

  async updateAnalyticsSnapshot(testId: string) {
    return this.execute(
      'MOCK_TEST_ANALYTICS_WRITE_FAILED',
      'Failed to update mock test analytics snapshot',
      async () => {
        const safeTestId = MongoMockTestsObjectId.toObjectId(testId);

        if (!safeTestId) {
          return;
        }

        const aggregation = await MockTestAttemptModel.aggregate<AnalyticsSnapshotAggregation>([
          {
            $match: {
              testId: safeTestId,
              status: 'completed',
              deletedAt: null,
            },
          },
          {
            $group: {
              _id: null,
              totalAttempts: { $sum: 1 },
              averageScore: { $avg: '$scorePercentage' },
              passCount: { $sum: { $cond: ['$passed', 1, 0] } },
              averageTimeTaken: { $avg: '$timeTakenSeconds' },
            },
          },
        ]);

        if (!aggregation.length) {
          return;
        }

        const data = aggregation[0];

        await MockTestAnalyticsSnapshotModel.findOneAndUpdate(
          {
            testId: safeTestId,
          },
          {
            $set: {
              totalAttempts: data.totalAttempts,
              averageScore: Math.round(data.averageScore),
              passRate: Math.round((data.passCount / data.totalAttempts) * 100),
              averageTimeTakenSeconds: Math.round(data.averageTimeTaken || 0),
            },
          },
          {
            upsert: true,
            returnDocument: 'after',
          }
        );

        await MockTestModel.findOneAndUpdate(
          {
            _id: safeTestId,
            deletedAt: null,
          },
          {
            $set: {
              averageScore: Math.round(data.averageScore),
              attemptCount: data.totalAttempts,
            },
          }
        );
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError
    );
  }
}

export const mongoMockTestsAnalyticsRepository = new MongoMockTestsAnalyticsRepository();
