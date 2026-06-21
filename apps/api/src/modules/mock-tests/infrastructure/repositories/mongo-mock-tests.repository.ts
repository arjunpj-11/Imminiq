import { MockTestAIEvaluationModel } from '../../../../infrastructure/database/models/mock-test-ai-evaluation.model'
import { MockTestAnalyticsSnapshotModel } from '../../../../infrastructure/database/models/mock-test-analytics-snapshot.model'
import { MockTestAnswerModel } from '../../../../infrastructure/database/models/mock-test-answer.model'
import { MockTestAttemptModel } from '../../../../infrastructure/database/models/mock-test-attempt.model'
import { MockTestCreationSessionModel } from '../../../../infrastructure/database/models/mock-test-creation-session.model'
import { MockTestQuestionModel } from '../../../../infrastructure/database/models/mock-test-question.model'
import { MockTestReportModel } from '../../../../infrastructure/database/models/mock-test-report.model'
import { MockTestModel } from '../../../../infrastructure/database/models/mock-test.model'
import type { MockTestAttemptEntity } from '../../domain/entities/mock-test-attempt.entity'
import type { CreateMockTestAIEvaluationInput } from '../../domain/repositories/mock-test-ai-evaluation.repository.interface'
import type {
  FindMockTestAnswerByQuestionInput,
  MockTestQuestionFlagInput,
  SaveMockTestAnswerInput,
  UpdateMockTestAnswerInput,
} from '../../domain/repositories/mock-test-answer.repository.interface'
import type {
  AbandonActiveMockTestAttemptsInput,
  CreateMockTestAttemptInput,
  FindActiveMockTestAttemptInput,
  FindLatestMockTestAttemptsInput,
  FindMockTestAttemptsByUserInput,
  UpdateMockTestAttemptInput,
} from '../../domain/repositories/mock-test-attempt.repository.interface'
import type {
  CreateMockTestCreationSessionInput,
  UpdateMockTestCreationSessionInput,
} from '../../domain/repositories/mock-test-creation-session.repository.interface'
import type { CreateMockTestQuestionInput } from '../../domain/repositories/mock-test-question.repository.interface'
import type { CreateMockTestReportInput } from '../../domain/repositories/mock-test-report.repository.interface'
import type {
  EnableMockTestSharingInput,
  FindImportedSharedTestInput,
} from '../../domain/repositories/mock-test-sharing.repository.interface'
import type {
  CreateMockTestInput,
  FindMockTestsByOwnerInput,
  FindPublicMockTestsInput,
  UpdateMockTestInput,
} from '../../domain/repositories/mock-test.repository.interface'
import type { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import type { DifficultyLevel } from '../../domain/value-objects/difficulty-level.vo'
import { MongoMockTestsBaseRepository } from './mongo-mock-tests-base.repository'
import { MongoMockTestsErrorMapper } from './mongo-mock-tests-error.mapper'
import { MongoMockTestsMapper } from './mongo-mock-tests.mapper'
import type {
  AnalyticsSnapshotAggregation,
  PerformanceTrendAggregation,
  QuestionCountDoc,
  RawMockTestAIEvaluationDoc,
  RawMockTestAnswerDoc,
  RawMockTestAttemptDoc,
  RawMockTestCreationSessionDoc,
  RawMockTestDoc,
  RawMockTestQuestionDoc,
  RawMockTestReportDoc,
  UserSummaryAggregation,
} from './mongo-mock-tests.types'

export class MongoMockTestsRepository
  extends MongoMockTestsBaseRepository
  implements MockTestsRepositoryContract
{
  constructor(private readonly mapper = new MongoMockTestsMapper()) {
    super()
  }

  async findTestById(testId: string) {
    return this.execute(
      'MOCK_TEST_READ_FAILED',
      'Failed to read mock test',
      async () => {
        const safeTestId = this.toObjectId(testId)

        if (!safeTestId) {
          return null
        }

        const doc = await MockTestModel.findOne({
          _id: safeTestId,
          deletedAt: null,
        }).lean()

        return doc ? this.mapper.toMockTestEntity(doc as RawMockTestDoc) : null
      },
    )
  }

  async findTestsByOwner(input: FindMockTestsByOwnerInput) {
    return this.execute(
      'MOCK_TEST_READ_FAILED',
      'Failed to read owner mock tests',
      async () => {
        const { ownerId, page = 1, limit = 6 } = input
        const safeOwnerId = this.toObjectId(ownerId)

        if (!safeOwnerId) {
          return {
            tests: [],
            total: 0,
          }
        }

        const safePage = this.sanitizePage(page)
        const safeLimit = this.sanitizeLimit(limit)
        const skip = (safePage - 1) * safeLimit

        const query = {
          ownerId: safeOwnerId,
          deletedAt: null,
        }

        const [docs, total] = await Promise.all([
          MockTestModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(safeLimit)
            .lean(),
          MockTestModel.countDocuments(query),
        ])

        return {
          tests: docs.map((doc) =>
            this.mapper.toMockTestEntity(doc as RawMockTestDoc),
          ),
          total,
        }
      },
    )
  }

  async findPublicTests(input: FindPublicMockTestsInput) {
    return this.execute(
      'MOCK_TEST_READ_FAILED',
      'Failed to read public mock tests',
      async () => {
        const { difficulty, tags, page = 1, limit = 20 } = input

        const safeDifficulty = this.sanitizeDifficulty(difficulty)
        const safeTags = this.sanitizeTags(tags)
        const safePage = this.sanitizePage(page)
        const safeLimit = this.sanitizeLimit(limit)
        const skip = (safePage - 1) * safeLimit

        const docs = await this.findPublicTestDocsByDifficulty(safeDifficulty)

        const filteredDocs = safeTags.length
          ? docs.filter((doc) => {
              const docTags = Array.isArray(doc.tags) ? doc.tags : []

              return safeTags.some((tag) => docTags.includes(tag))
            })
          : docs

        const paginatedDocs = filteredDocs.slice(skip, skip + safeLimit)

        return {
          tests: paginatedDocs.map((doc) => this.mapper.toMockTestEntity(doc)),
          total: filteredDocs.length,
        }
      },
    )
  }

  async findSharedTestByToken(shareToken: string) {
    return this.execute(
      'MOCK_TEST_READ_FAILED',
      'Failed to read shared mock test',
      async () => {
        const doc = await MockTestModel.findOne({
          shareToken,
          isShareEnabled: true,
          deletedAt: null,
        }).lean()

        return doc ? this.mapper.toMockTestEntity(doc as RawMockTestDoc) : null
      },
    )
  }

  async findImportedSharedTest(input: FindImportedSharedTestInput) {
    return this.execute(
      'MOCK_TEST_READ_FAILED',
      'Failed to read imported shared mock test',
      async () => {
        const { ownerId, sourceTestId } = input

        const safeOwnerId = this.toObjectId(ownerId)
        const safeSourceTestId = this.toObjectId(sourceTestId)

        if (!safeOwnerId || !safeSourceTestId) {
          return null
        }

        const doc = await MockTestModel.findOne({
          ownerId: safeOwnerId,
          sourceTestId: safeSourceTestId,
          deletedAt: null,
        }).lean()

        return doc ? this.mapper.toMockTestEntity(doc as RawMockTestDoc) : null
      },
    )
  }

  async enableTestSharing(input: EnableMockTestSharingInput) {
    return this.execute(
      'MOCK_TEST_WRITE_FAILED',
      'Failed to enable mock test sharing',
      async () => {
        const { ownerId, testId, shareToken } = input

        const safeOwnerId = this.toObjectId(ownerId)
        const safeTestId = this.toObjectId(testId)

        if (!safeOwnerId || !safeTestId) {
          return null
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
            new: true,
          },
        ).lean()

        return doc ? this.mapper.toMockTestEntity(doc as RawMockTestDoc) : null
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError,
    )
  }

  async incrementCloneCount(testId: string) {
    return this.execute(
      'MOCK_TEST_WRITE_FAILED',
      'Failed to increment mock test clone count',
      async () => {
        const safeTestId = this.toObjectId(testId)

        if (!safeTestId) {
          return
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
          },
        )
      },
    )
  }

  async createTest(data: CreateMockTestInput) {
    return this.execute(
      'MOCK_TEST_WRITE_FAILED',
      'Failed to create mock test',
      async () => {
        const doc = await MockTestModel.create(data)

        return this.mapper.toMockTestEntity(doc.toObject() as RawMockTestDoc)
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError,
    )
  }

  async updateTest(testId: string, data: UpdateMockTestInput) {
    return this.execute(
      'MOCK_TEST_WRITE_FAILED',
      'Failed to update mock test',
      async () => {
        const safeTestId = this.toObjectId(testId)

        if (!safeTestId) {
          return null
        }

        const update = this.buildMockTestUpdate(data)

        if (Object.keys(update.$set).length === 0) {
          const existingDoc = await MockTestModel.findOne({
            _id: safeTestId,
            deletedAt: null,
          }).lean()

          return existingDoc
            ? this.mapper.toMockTestEntity(existingDoc as RawMockTestDoc)
            : null
        }

        const doc = await MockTestModel.findOneAndUpdate(
          {
            _id: safeTestId,
            deletedAt: null,
          },
          update,
          {
            new: true,
          },
        ).lean()

        return doc ? this.mapper.toMockTestEntity(doc as RawMockTestDoc) : null
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError,
    )
  }

  async deleteTest(testId: string) {
    return this.execute(
      'MOCK_TEST_DELETE_FAILED',
      'Failed to delete mock test',
      async () => {
        const safeTestId = this.toObjectId(testId)

        if (!safeTestId) {
          return
        }

        await Promise.all([
          MockTestQuestionModel.deleteMany({
            testId: safeTestId,
          }),
          MockTestModel.findOneAndDelete({
            _id: safeTestId,
          }),
        ])
      },
    )
  }

  async findQuestionsByTest(testId: string) {
    return this.execute(
      'MOCK_TEST_QUESTION_READ_FAILED',
      'Failed to read mock test questions',
      async () => {
        const safeTestId = this.toObjectId(testId)

        if (!safeTestId) {
          return []
        }

        const docs = await MockTestQuestionModel.find({
          testId: safeTestId,
          deletedAt: null,
        })
          .sort({ order: 1 })
          .lean()

        return docs.map((doc) =>
          this.mapper.toMockTestQuestionEntity(doc as RawMockTestQuestionDoc),
        )
      },
    )
  }

  async findQuestionById(questionId: string) {
    return this.execute(
      'MOCK_TEST_QUESTION_READ_FAILED',
      'Failed to read mock test question',
      async () => {
        const safeQuestionId = this.toObjectId(questionId)

        if (!safeQuestionId) {
          return null
        }

        const doc = await MockTestQuestionModel.findOne({
          _id: safeQuestionId,
          deletedAt: null,
        }).lean()

        return doc
          ? this.mapper.toMockTestQuestionEntity(
              doc as RawMockTestQuestionDoc,
            )
          : null
      },
    )
  }

  async createQuestions(questions: CreateMockTestQuestionInput[]) {
    return this.execute(
      'MOCK_TEST_QUESTION_WRITE_FAILED',
      'Failed to create mock test questions',
      async () => {
        const docs = await MockTestQuestionModel.insertMany(questions)

        return docs.map((doc) =>
          this.mapper.toMockTestQuestionEntity(
            doc.toObject() as RawMockTestQuestionDoc,
          ),
        )
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError,
    )
  }

  async findAttemptById(attemptId: string) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_READ_FAILED',
      'Failed to read mock test attempt',
      async () => {
        const safeAttemptId = this.toObjectId(attemptId)

        if (!safeAttemptId) {
          return null
        }

        const doc = await MockTestAttemptModel.findOne({
          _id: safeAttemptId,
          deletedAt: null,
        }).lean()

        return doc
          ? this.mapper.toMockTestAttemptEntity(doc as RawMockTestAttemptDoc)
          : null
      },
    )
  }

  async findAttemptsByUser(input: FindMockTestAttemptsByUserInput) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_READ_FAILED',
      'Failed to read user mock test attempts',
      async () => {
        const { userId, testId } = input
        const safeUserId = this.toObjectId(userId)

        if (!safeUserId) {
          return []
        }

        const query: Record<string, unknown> = {
          userId: safeUserId,
          deletedAt: null,
        }

        if (testId) {
          const safeTestId = this.toObjectId(testId)

          if (!safeTestId) {
            return []
          }

          query.testId = safeTestId
        }

        const docs = await MockTestAttemptModel.find(query)
          .sort({ createdAt: -1 })
          .lean()

        return docs.map((doc) =>
          this.mapper.toMockTestAttemptEntity(doc as RawMockTestAttemptDoc),
        )
      },
    )
  }

  async findLatestAttemptsForTests(input: FindLatestMockTestAttemptsInput) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_READ_FAILED',
      'Failed to read latest mock test attempts',
      async () => {
        const { userId, testIds } = input
        const safeUserId = this.toObjectId(userId)

        if (!safeUserId || !testIds.length) {
          return {}
        }

        const safeTestIds = this.toObjectIds(testIds)

        if (!safeTestIds.length) {
          return {}
        }

        const docs = await MockTestAttemptModel.find({
          userId: safeUserId,
          testId: { $in: safeTestIds },
          deletedAt: null,
        })
          .sort({ createdAt: -1 })
          .lean()

        const result: Record<string, MockTestAttemptEntity> = {}

        for (const doc of docs) {
          const mapped = this.mapper.toMockTestAttemptEntity(
            doc as RawMockTestAttemptDoc,
          )

          if (!result[mapped.testId]) {
            result[mapped.testId] = mapped
          }
        }

        return result
      },
    )
  }

  async findActiveAttempt(input: FindActiveMockTestAttemptInput) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_READ_FAILED',
      'Failed to read active mock test attempt',
      async () => {
        const { userId, testId } = input

        const safeUserId = this.toObjectId(userId)
        const safeTestId = this.toObjectId(testId)

        if (!safeUserId || !safeTestId) {
          return null
        }

        const doc = await MockTestAttemptModel.findOne({
          userId: safeUserId,
          testId: safeTestId,
          status: 'in_progress',
          deletedAt: null,
        }).lean()

        return doc
          ? this.mapper.toMockTestAttemptEntity(doc as RawMockTestAttemptDoc)
          : null
      },
    )
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
        })

        return this.mapper.toMockTestAttemptEntity(
          doc.toObject() as RawMockTestAttemptDoc,
        )
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError,
    )
  }

  async updateAttempt(attemptId: string, data: UpdateMockTestAttemptInput) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_WRITE_FAILED',
      'Failed to update mock test attempt',
      async () => {
        const safeAttemptId = this.toObjectId(attemptId)

        if (!safeAttemptId) {
          return null
        }

        const update = this.buildMockTestAttemptUpdate(data)

        if (Object.keys(update.$set).length === 0) {
          const existingDoc = await MockTestAttemptModel.findOne({
            _id: safeAttemptId,
            deletedAt: null,
          }).lean()

          return existingDoc
            ? this.mapper.toMockTestAttemptEntity(
                existingDoc as RawMockTestAttemptDoc,
              )
            : null
        }

        const doc = await MockTestAttemptModel.findOneAndUpdate(
          {
            _id: safeAttemptId,
            deletedAt: null,
          },
          update,
          {
            new: true,
          },
        ).lean()

        return doc
          ? this.mapper.toMockTestAttemptEntity(doc as RawMockTestAttemptDoc)
          : null
      },
    )
  }

  async incrementAnsweredCount(attemptId: string) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_WRITE_FAILED',
      'Failed to increment answered count',
      async () => {
        const safeAttemptId = this.toObjectId(attemptId)

        if (!safeAttemptId) {
          return
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
          },
        )
      },
    )
  }

  async abandonActiveAttempts(input: AbandonActiveMockTestAttemptsInput) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_WRITE_FAILED',
      'Failed to abandon active attempts',
      async () => {
        const { userId, testId } = input

        const safeUserId = this.toObjectId(userId)
        const safeTestId = this.toObjectId(testId)

        if (!safeUserId || !safeTestId) {
          return
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
          },
        )
      },
    )
  }

  async findAnswersByAttempt(attemptId: string) {
    return this.execute(
      'MOCK_TEST_ANSWER_READ_FAILED',
      'Failed to read mock test answers',
      async () => {
        const safeAttemptId = this.toObjectId(attemptId)

        if (!safeAttemptId) {
          return []
        }

        const docs = await MockTestAnswerModel.find({
          attemptId: safeAttemptId,
          deletedAt: null,
        }).lean()

        return docs.map((doc) =>
          this.mapper.toMockTestAnswerEntity(doc as RawMockTestAnswerDoc),
        )
      },
    )
  }

  async findAnswerByQuestion(input: FindMockTestAnswerByQuestionInput) {
    return this.execute(
      'MOCK_TEST_ANSWER_READ_FAILED',
      'Failed to read mock test answer',
      async () => {
        const { attemptId, questionId } = input

        const safeAttemptId = this.toObjectId(attemptId)
        const safeQuestionId = this.toObjectId(questionId)

        if (!safeAttemptId || !safeQuestionId) {
          return null
        }

        const doc = await MockTestAnswerModel.findOne({
          attemptId: safeAttemptId,
          questionId: safeQuestionId,
          deletedAt: null,
        }).lean()

        return doc
          ? this.mapper.toMockTestAnswerEntity(doc as RawMockTestAnswerDoc)
          : null
      },
    )
  }

  async saveAnswer(data: SaveMockTestAnswerInput) {
    return this.execute(
      'MOCK_TEST_ANSWER_WRITE_FAILED',
      'Failed to save mock test answer',
      async () => {
        const doc = await MockTestAnswerModel.create(data)

        return this.mapper.toMockTestAnswerEntity(
          doc.toObject() as RawMockTestAnswerDoc,
        )
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError,
    )
  }

  async updateAnswer(answerId: string, data: UpdateMockTestAnswerInput) {
    return this.execute(
      'MOCK_TEST_ANSWER_WRITE_FAILED',
      'Failed to update mock test answer',
      async () => {
        const safeAnswerId = this.toObjectId(answerId)

        if (!safeAnswerId) {
          return null
        }

        const update = this.buildMockTestAnswerUpdate(data)

        if (Object.keys(update.$set).length === 0) {
          const existingDoc = await MockTestAnswerModel.findOne({
            _id: safeAnswerId,
            deletedAt: null,
          }).lean()

          return existingDoc
            ? this.mapper.toMockTestAnswerEntity(
                existingDoc as RawMockTestAnswerDoc,
              )
            : null
        }

        const doc = await MockTestAnswerModel.findOneAndUpdate(
          {
            _id: safeAnswerId,
            deletedAt: null,
          },
          update,
          {
            new: true,
          },
        ).lean()

        return doc
          ? this.mapper.toMockTestAnswerEntity(doc as RawMockTestAnswerDoc)
          : null
      },
    )
  }

  async flagQuestion(input: MockTestQuestionFlagInput) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_WRITE_FAILED',
      'Failed to flag mock test question',
      async () => {
        const { attemptId, questionId } = input

        const safeAttemptId = this.toObjectId(attemptId)
        const safeQuestionId = this.toObjectId(questionId)

        if (!safeAttemptId || !safeQuestionId) {
          return
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
          },
        )
      },
    )
  }

  async unflagQuestion(input: MockTestQuestionFlagInput) {
    return this.execute(
      'MOCK_TEST_ATTEMPT_WRITE_FAILED',
      'Failed to unflag mock test question',
      async () => {
        const { attemptId, questionId } = input

        const safeAttemptId = this.toObjectId(attemptId)
        const safeQuestionId = this.toObjectId(questionId)

        if (!safeAttemptId || !safeQuestionId) {
          return
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
          },
        )
      },
    )
  }

  async createAIEvaluation(data: CreateMockTestAIEvaluationInput) {
    return this.execute(
      'MOCK_TEST_AI_EVALUATION_WRITE_FAILED',
      'Failed to create mock test AI evaluation',
      async () => {
        const doc = await MockTestAIEvaluationModel.create({
          ...data,
          status: 'completed',
        })

        return this.mapper.toMockTestAIEvaluationEntity(
          doc.toObject() as RawMockTestAIEvaluationDoc,
        )
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError,
    )
  }

  async findAIEvaluationsByAttempt(attemptId: string) {
    return this.execute(
      'MOCK_TEST_AI_EVALUATION_READ_FAILED',
      'Failed to read mock test AI evaluations',
      async () => {
        const safeAttemptId = this.toObjectId(attemptId)

        if (!safeAttemptId) {
          return []
        }

        const docs = await MockTestAIEvaluationModel.find({
          attemptId: safeAttemptId,
          deletedAt: null,
        }).lean()

        return docs.map((doc) =>
          this.mapper.toMockTestAIEvaluationEntity(
            doc as RawMockTestAIEvaluationDoc,
          ),
        )
      },
    )
  }

  async findReportByAttempt(attemptId: string) {
    return this.execute(
      'MOCK_TEST_REPORT_READ_FAILED',
      'Failed to read mock test report',
      async () => {
        const safeAttemptId = this.toObjectId(attemptId)

        if (!safeAttemptId) {
          return null
        }

        const doc = await MockTestReportModel.findOne({
          attemptId: safeAttemptId,
          deletedAt: null,
        }).lean()

        return doc
          ? this.mapper.toMockTestReportEntity(doc as RawMockTestReportDoc)
          : null
      },
    )
  }

  async createReport(data: CreateMockTestReportInput) {
    return this.execute(
      'MOCK_TEST_REPORT_WRITE_FAILED',
      'Failed to create mock test report',
      async () => {
        const doc = await MockTestReportModel.create(data)

        return this.mapper.toMockTestReportEntity(
          doc.toObject() as RawMockTestReportDoc,
        )
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError,
    )
  }

  async getAttemptHistory(userId: string) {
    return this.execute(
      'MOCK_TEST_ANALYTICS_READ_FAILED',
      'Failed to read mock test attempt history',
      async () => {
        const safeUserId = this.toObjectId(userId)

        if (!safeUserId) {
          return []
        }

        const docs = await MockTestAttemptModel.find({
          userId: safeUserId,
          deletedAt: null,
        })
          .populate('testId')
          .sort({ createdAt: -1 })
          .lean()

        return docs.map((doc) => {
          const attemptDoc = doc as RawMockTestAttemptDoc
          const populatedTest = this.mapper.isRecord(attemptDoc.testId)
            ? this.mapper.toMockTestEntity(attemptDoc.testId as RawMockTestDoc)
            : null

          return {
            ...this.mapper.toMockTestAttemptEntity(attemptDoc),
            test: populatedTest,
          }
        })
      },
    )
  }

  async getUserSummary(userId: string) {
    return this.execute(
      'MOCK_TEST_ANALYTICS_READ_FAILED',
      'Failed to read mock test user summary',
      async () => {
        const safeUserId = this.toObjectId(userId)

        if (!safeUserId) {
          return {
            totalTests: 0,
            totalQuestions: 0,
            completedAttempts: 0,
            averageScore: 0,
            bestScore: 0,
            passedAttempts: 0,
          }
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
        ])

        const typedTests = tests as QuestionCountDoc[]
        const completed = completedAgg[0]

        return {
          totalTests: typedTests.length,
          totalQuestions: typedTests.reduce(
            (sum, test) => sum + (test.questionCount || 0),
            0,
          ),
          completedAttempts: completed?.completedAttempts || 0,
          averageScore: Math.round(completed?.averageScore || 0),
          bestScore: Math.round(completed?.bestScore || 0),
          passedAttempts: completed?.passedAttempts || 0,
        }
      },
    )
  }

  async getPerformanceTrends(userId: string) {
    return this.execute(
      'MOCK_TEST_ANALYTICS_READ_FAILED',
      'Failed to read mock test performance trends',
      async () => {
        const safeUserId = this.toObjectId(userId)

        if (!safeUserId) {
          return []
        }

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const aggregation =
          await MockTestAttemptModel.aggregate<PerformanceTrendAggregation>([
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
          ])

        return aggregation.map((item) => ({
          date: item._id,
          averageScore: Math.round(item.averageScore),
          attempts: item.attempts,
        }))
      },
    )
  }

  async getTopicBreakdown(userId: string) {
    return this.execute(
      'MOCK_TEST_ANALYTICS_READ_FAILED',
      'Failed to read mock test topic breakdown',
      async () => {
        const safeUserId = this.toObjectId(userId)

        if (!safeUserId) {
          return []
        }

        const attempts = await MockTestAttemptModel.find({
          userId: safeUserId,
          status: 'completed',
          deletedAt: null,
        })
          .populate('testId', 'tags')
          .lean()

        const topicData: Record<string, { total: number; scoreSum: number }> =
          {}

        for (const attempt of attempts as RawMockTestAttemptDoc[]) {
          const testDoc = this.mapper.isRecord(attempt.testId)
            ? attempt.testId
            : null

          const tags =
            testDoc && Array.isArray(testDoc['tags'])
              ? (testDoc['tags'] as string[])
              : []

          for (const tag of tags) {
            topicData[tag] ||= {
              total: 0,
              scoreSum: 0,
            }
            topicData[tag].total += 1
            topicData[tag].scoreSum += attempt.scorePercentage || 0
          }
        }

        return Object.entries(topicData)
          .map(([topic, data]) => ({
            topic,
            averageScore: Math.round(data.scoreSum / data.total),
            totalAttempts: data.total,
          }))
          .sort((first, second) => first.averageScore - second.averageScore)
      },
    )
  }

  async updateAnalyticsSnapshot(testId: string) {
    return this.execute(
      'MOCK_TEST_ANALYTICS_WRITE_FAILED',
      'Failed to update mock test analytics snapshot',
      async () => {
        const safeTestId = this.toObjectId(testId)

        if (!safeTestId) {
          return
        }

        const aggregation =
          await MockTestAttemptModel.aggregate<AnalyticsSnapshotAggregation>([
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
          ])

        if (!aggregation.length) {
          return
        }

        const data = aggregation[0]

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
            new: true,
          },
        )

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
          },
        )
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError,
    )
  }

  async findCreationSession(sessionId: string) {
    return this.execute(
      'MOCK_TEST_CREATION_SESSION_READ_FAILED',
      'Failed to read mock test creation session',
      async () => {
        const safeSessionId = this.toObjectId(sessionId)

        if (!safeSessionId) {
          return null
        }

        const doc = await MockTestCreationSessionModel.findOne({
          _id: safeSessionId,
          deletedAt: null,
        }).lean()

        return doc
          ? this.mapper.toMockTestCreationSessionEntity(
              doc as RawMockTestCreationSessionDoc,
            )
          : null
      },
    )
  }

  async findActiveCreationSession(userId: string) {
    return this.execute(
      'MOCK_TEST_CREATION_SESSION_READ_FAILED',
      'Failed to read active mock test creation session',
      async () => {
        const safeUserId = this.toObjectId(userId)

        if (!safeUserId) {
          return null
        }

        const doc = await MockTestCreationSessionModel.findOne({
          userId: safeUserId,
          status: 'draft',
          deletedAt: null,
        }).lean()

        return doc
          ? this.mapper.toMockTestCreationSessionEntity(
              doc as RawMockTestCreationSessionDoc,
            )
          : null
      },
    )
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
        })

        return this.mapper.toMockTestCreationSessionEntity(
          doc.toObject() as RawMockTestCreationSessionDoc,
        )
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError,
    )
  }

  async updateCreationSession(
    sessionId: string,
    data: UpdateMockTestCreationSessionInput,
  ) {
    return this.execute(
      'MOCK_TEST_CREATION_SESSION_WRITE_FAILED',
      'Failed to update mock test creation session',
      async () => {
        const safeSessionId = this.toObjectId(sessionId)

        if (!safeSessionId) {
          return null
        }

        const update = this.buildMockTestCreationSessionUpdate(data)

        if (Object.keys(update.$set).length === 0) {
          const existingDoc = await MockTestCreationSessionModel.findOne({
            _id: safeSessionId,
            deletedAt: null,
          }).lean()

          return existingDoc
            ? this.mapper.toMockTestCreationSessionEntity(
                existingDoc as RawMockTestCreationSessionDoc,
              )
            : null
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
        ).lean()

        return doc
          ? this.mapper.toMockTestCreationSessionEntity(
              doc as RawMockTestCreationSessionDoc,
            )
          : null
      },
      MongoMockTestsErrorMapper.mapDuplicateMockTestRecordError,
    )
  }

  async cancelCreationSession(sessionId: string) {
    return this.execute(
      'MOCK_TEST_CREATION_SESSION_WRITE_FAILED',
      'Failed to cancel mock test creation session',
      async () => {
        const safeSessionId = this.toObjectId(sessionId)

        if (!safeSessionId) {
          return
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
        )
      },
    )
  }

  private buildMockTestUpdate(data: UpdateMockTestInput): {
    $set: Record<string, unknown>
  } {
    const $set: Record<string, unknown> = {}

    this.setIfDefined($set, data, 'title')
    this.setIfDefined($set, data, 'description')
    this.setIfDefined($set, data, 'difficulty')
    this.setIfDefined($set, data, 'visibility')
    this.setIfDefined($set, data, 'timeLimitMinutes')
    this.setIfDefined($set, data, 'passingScore')
    this.setIfDefined($set, data, 'questionCount')
    this.setIfDefined($set, data, 'tags')
    this.setIfDefined($set, data, 'trackerId')
    this.setIfDefined($set, data, 'sourceTestId')
    this.setIfDefined($set, data, 'shareToken')
    this.setIfDefined($set, data, 'isShareEnabled')
    this.setIfDefined($set, data, 'isAIGenerated')
    this.setIfDefined($set, data, 'cloneCount')

    return {
      $set,
    }
  }

  private buildMockTestAttemptUpdate(data: UpdateMockTestAttemptInput): {
    $set: Record<string, unknown>
  } {
    const $set: Record<string, unknown> = {}
    const source = data as Record<string, unknown>

    this.setIfDefined($set, source, 'status')
    this.setIfDefined($set, source, 'score')
    this.setIfDefined($set, source, 'maxScore')
    this.setIfDefined($set, source, 'scorePercentage')
    this.setIfDefined($set, source, 'passed')
    this.setIfDefined($set, source, 'answeredQuestions')
    this.setIfDefined($set, source, 'correctAnswers')
    this.setIfDefined($set, source, 'flaggedQuestions')
    this.setIfDefined($set, source, 'startedAt')
    this.setIfDefined($set, source, 'completedAt')
    this.setIfDefined($set, source, 'abandonedAt')
    this.setIfDefined($set, source, 'timeTakenSeconds')

    if (source['percentage'] !== undefined) {
      $set.scorePercentage = source['percentage']
    }

    if (source['answeredCount'] !== undefined) {
      $set.answeredQuestions = source['answeredCount']
    }

    if (source['correctCount'] !== undefined) {
      $set.correctAnswers = source['correctCount']
    }

    if (source['timeSpentSeconds'] !== undefined) {
      $set.timeTakenSeconds = source['timeSpentSeconds']
    }

    return {
      $set,
    }
  }

  private buildMockTestAnswerUpdate(data: UpdateMockTestAnswerInput): {
    $set: Record<string, unknown>
  } {
    const $set: Record<string, unknown> = {}

    this.setIfDefined($set, data, 'answer')
    this.setIfDefined($set, data, 'isCorrect')
    this.setIfDefined($set, data, 'pointsEarned')

    return {
      $set,
    }
  }

  private buildMockTestCreationSessionUpdate(
    data: UpdateMockTestCreationSessionInput,
  ): {
    $set: Record<string, unknown>
  } {
    const $set: Record<string, unknown> = {}
    const source = data as Record<string, unknown>

    this.setIfDefined($set, source, 'title')
    this.setIfDefined($set, source, 'description')
    this.setIfDefined($set, source, 'difficulty')
    this.setIfDefined($set, source, 'visibility')
    this.setIfDefined($set, source, 'timeLimitMinutes')
    this.setIfDefined($set, source, 'passingScore')
    this.setIfDefined($set, source, 'questionCount')
    this.setIfDefined($set, source, 'tags')
    this.setIfDefined($set, source, 'trackerId')
    this.setIfDefined($set, source, 'generatedTestId')
    this.setIfDefined($set, source, 'status')
    this.setIfDefined($set, source, 'completedAt')
    this.setIfDefined($set, source, 'cancelledAt')

    this.setIfDefined($set, source, 'step')
    this.setIfDefined($set, source, 'draftData')

    return {
      $set,
    }
  }

  private setIfDefined(
    target: Record<string, unknown>,
    source: Record<string, unknown>,
    key: string,
  ): void {
    if (source[key] !== undefined) {
      target[key] = source[key]
    }
  }

  private async findPublicTestDocsByDifficulty(
    difficulty?: DifficultyLevel,
  ): Promise<RawMockTestDoc[]> {
    if (difficulty === 'easy') {
      return (await MockTestModel.find({
        visibility: 'public',
        difficulty: 'easy',
        deletedAt: null,
      })
        .sort({ createdAt: -1 })
        .lean()) as RawMockTestDoc[]
    }

    if (difficulty === 'medium') {
      return (await MockTestModel.find({
        visibility: 'public',
        difficulty: 'medium',
        deletedAt: null,
      })
        .sort({ createdAt: -1 })
        .lean()) as RawMockTestDoc[]
    }

    if (difficulty === 'hard') {
      return (await MockTestModel.find({
        visibility: 'public',
        difficulty: 'hard',
        deletedAt: null,
      })
        .sort({ createdAt: -1 })
        .lean()) as RawMockTestDoc[]
    }

    return (await MockTestModel.find({
      visibility: 'public',
      deletedAt: null,
    })
      .sort({ createdAt: -1 })
      .lean()) as RawMockTestDoc[]
  }
}

export const mongoMockTestsRepository = new MongoMockTestsRepository()