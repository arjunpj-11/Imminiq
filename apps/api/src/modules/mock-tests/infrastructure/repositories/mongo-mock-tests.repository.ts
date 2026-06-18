import mongoose from 'mongoose'
import { MockTestAIEvaluationEntity } from '../../domain/entities/mock-test-ai-evaluation.entity'
import { MockTestAnswerEntity } from '../../domain/entities/mock-test-answer.entity'
import { MockTestAttemptEntity } from '../../domain/entities/mock-test-attempt.entity'
import { MockTestCreationSessionEntity } from '../../domain/entities/mock-test-creation-session.entity'
import { MockTestQuestionEntity } from '../../domain/entities/mock-test-question.entity'
import { MockTestReportEntity } from '../../domain/entities/mock-test-report.entity'
import { MockTestEntity } from '../../domain/entities/mock-test.entity'
import { MockTestsDomainError } from '../../domain/errors/mock-tests-domain.error'
import type { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import type { AttemptStatus } from '../../domain/value-objects/attempt-status.vo'
import type { CreationSessionStatus } from '../../domain/value-objects/creation-session-status.vo'
import type { DifficultyLevel } from '../../domain/value-objects/difficulty-level.vo'
import type { EvaluationStatus } from '../../domain/value-objects/evaluation-status.vo'
import type { MockTestCodingDetails } from '../../domain/value-objects/mock-test-coding.vo'
import type { MockTestCreationDraft } from '../../domain/value-objects/mock-test-creation-draft.vo'
import type { QuestionType } from '../../domain/value-objects/question-type.vo'
import type { TestVisibility } from '../../domain/value-objects/test-visibility.vo'
import { MockTestModel } from '../../../../infrastructure/database/models/mock-test.model'
import { MockTestQuestionModel } from '../../../../infrastructure/database/models/mock-test-question.model'
import { MockTestAttemptModel } from '../../../../infrastructure/database/models/mock-test-attempt.model'
import { MockTestAnswerModel } from '../../../../infrastructure/database/models/mock-test-answer.model'
import { MockTestAIEvaluationModel } from '../../../../infrastructure/database/models/mock-test-ai-evaluation.model'
import { MockTestReportModel } from '../../../../infrastructure/database/models/mock-test-report.model'
import { MockTestAnalyticsSnapshotModel } from '../../../../infrastructure/database/models/mock-test-analytics-snapshot.model'
import { MockTestCreationSessionModel } from '../../../../infrastructure/database/models/mock-test-creation-session.model'


type RawRecord = Record<string, unknown>

type RawMockTestDoc = {
  _id?: unknown
  ownerId?: unknown
  trackerId?: unknown
  sourceTestId?: unknown
  title?: string
  description?: string
  difficulty?: DifficultyLevel
  visibility?: TestVisibility
  questionCount?: number
  timeLimitMinutes?: number
  passingScore?: number
  isAIGenerated?: boolean
  tags?: string[]
  shareToken?: string
  isShareEnabled?: boolean
  cloneCount?: number
  averageScore?: number
  attemptCount?: number
  createdAt?: Date
  updatedAt?: Date
}

type RawMockTestQuestionDoc = {
  _id?: unknown
  testId?: unknown
  type?: QuestionType
  question?: string
  options?: string[]
  correctAnswer?: string
  explanation?: string
  difficulty?: DifficultyLevel
  order?: number
  points?: number
  coding?: MockTestCodingDetails
}

type RawMockTestAttemptDoc = {
  _id?: unknown
  testId?: unknown
  userId?: unknown
  status?: AttemptStatus
  startedAt?: Date
  completedAt?: Date
  timeTakenSeconds?: number
  score?: number
  scorePercentage?: number
  passed?: boolean
  flaggedQuestions?: unknown[]
  totalQuestions?: number
  answeredQuestions?: number
  createdAt?: Date
}

type RawMockTestAnswerDoc = {
  _id?: unknown
  attemptId?: unknown
  questionId?: unknown
  answer?: string
  isCorrect?: boolean
  pointsEarned?: number
  aiEvaluationId?: unknown
  submittedAt?: Date
  createdAt?: Date
}

type RawMockTestAIEvaluationDoc = {
  _id?: unknown
  attemptId?: unknown
  questionId?: unknown
  answerId?: unknown
  score?: number
  maxScore?: number
  feedback?: string
  status?: EvaluationStatus
  createdAt?: Date
}

type RawMockTestReportDoc = {
  _id?: unknown
  attemptId?: unknown
  userId?: unknown
  testId?: unknown
  score?: number
  scorePercentage?: number
  passed?: boolean
  timeTakenSeconds?: number
  totalQuestions?: number
  correctAnswers?: number
  incorrectAnswers?: number
  skippedAnswers?: number
  strongTopics?: string[]
  weakTopics?: string[]
  recommendations?: string[]
  createdAt?: Date
}

type RawMockTestCreationSessionDoc = {
  _id?: unknown
  userId?: unknown
  status?: CreationSessionStatus
  step?: number
  draftData?: MockTestCreationDraft
  createdAt?: Date
  updatedAt?: Date
}

type UserSummaryAggregation = {
  completedAttempts?: number
  averageScore?: number
  bestScore?: number
  passedAttempts?: number
}

type PerformanceTrendAggregation = {
  _id: string
  averageScore: number
  attempts: number
}

type AnalyticsSnapshotAggregation = {
  totalAttempts: number
  averageScore: number
  passCount: number
  averageTimeTaken?: number
}

type QuestionCountDoc = {
  questionCount?: number
}

const ALLOWED_DIFFICULTIES = ['easy', 'medium', 'hard'] as const
const SAFE_TAG_PATTERN = /^[a-zA-Z0-9 _-]{1,40}$/

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null

const isObjectId = (value: unknown): value is mongoose.Types.ObjectId =>
  value instanceof mongoose.Types.ObjectId

const id = (value: unknown): string => {
  if (!value) return ''

  if (typeof value === 'string') return value

  if (isObjectId(value)) return value.toString()

  if (isRecord(value)) {
    const nestedId = value['_id']

    if (nestedId === value) return String(value)

    return id(nestedId)
  }

  return String(value)
}

const optionalId = (value: unknown): string | undefined => {
  const resolvedId = id(value)
  return resolvedId || undefined
}

const numberOrZero = (value: unknown): number =>
  typeof value === 'number' ? value : 0

const dateOrNow = (value: Date | undefined): Date => value || new Date()

const toObjectId = (value: string): mongoose.Types.ObjectId | null => {
  if (!mongoose.Types.ObjectId.isValid(value)) return null
  return new mongoose.Types.ObjectId(value)
}

const toObjectIds = (values: string[]): mongoose.Types.ObjectId[] =>
  values
    .filter((value) => mongoose.Types.ObjectId.isValid(value))
    .map((value) => new mongoose.Types.ObjectId(value))

const sanitizeDifficulty = (value?: DifficultyLevel): DifficultyLevel | undefined =>
  value && ALLOWED_DIFFICULTIES.includes(value) ? value : undefined

const sanitizeTags = (tags?: string[]): string[] => {
  if (!Array.isArray(tags)) return []

  return tags
    .filter((tag): tag is string => typeof tag === 'string')
    .map((tag) => tag.trim())
    .filter((tag) => SAFE_TAG_PATTERN.test(tag))
    .slice(0, 20)
}

const sanitizePage = (page: number): number =>
  Number.isInteger(page) && page > 0 ? page : 1

const sanitizeLimit = (limit: number): number =>
  Number.isInteger(limit) && limit > 0 && limit <= 50 ? limit : 20

const getPublicTestsByDifficulty = async (difficulty?: DifficultyLevel) => {
  if (difficulty === 'easy') {
    return MockTestModel.find({
      visibility: 'public',
      difficulty: 'easy',
    })
      .sort({ createdAt: -1 })
      .lean()
  }

  if (difficulty === 'medium') {
    return MockTestModel.find({
      visibility: 'public',
      difficulty: 'medium',
    })
      .sort({ createdAt: -1 })
      .lean()
  }

  if (difficulty === 'hard') {
    return MockTestModel.find({
      visibility: 'public',
      difficulty: 'hard',
    })
      .sort({ createdAt: -1 })
      .lean()
  }

  return MockTestModel.find({
    visibility: 'public',
  })
    .sort({ createdAt: -1 })
    .lean()
}


export class MongoMockTestsRepository implements MockTestsRepositoryContract {
  private readonly implementation: MockTestsRepositoryContract

  private toMockTestEntity(doc: RawMockTestDoc): MockTestEntity {
    return new MockTestEntity({
      _id: id(doc._id),
      ownerId: id(doc.ownerId),
      trackerId: optionalId(doc.trackerId),
      sourceTestId: optionalId(doc.sourceTestId),
      title: doc.title || '',
      description: doc.description || '',
      difficulty: doc.difficulty || 'easy',
      visibility: doc.visibility || 'private',
      questionCount: numberOrZero(doc.questionCount),
      timeLimitMinutes: numberOrZero(doc.timeLimitMinutes),
      passingScore: numberOrZero(doc.passingScore),
      isAIGenerated: Boolean(doc.isAIGenerated),
      tags: doc.tags || [],
      shareToken: doc.shareToken,
      isShareEnabled: Boolean(doc.isShareEnabled),
      cloneCount: doc.cloneCount || 0,
      averageScore: doc.averageScore || 0,
      attemptCount: doc.attemptCount || 0,
      createdAt: dateOrNow(doc.createdAt),
      updatedAt: dateOrNow(doc.updatedAt),
    })
  }

  private toMockTestQuestionEntity(
    doc: RawMockTestQuestionDoc,
  ): MockTestQuestionEntity {
    return new MockTestQuestionEntity({
      _id: id(doc._id),
      testId: id(doc.testId),
      type: doc.type || 'mcq',
      question: doc.question || '',
      options: doc.options,
      correctAnswer: doc.correctAnswer,
      explanation: doc.explanation,
      difficulty: doc.difficulty || 'easy',
      order: numberOrZero(doc.order),
      points: numberOrZero(doc.points),
      coding: doc.coding,
    })
  }

  private toMockTestAttemptEntity(
    doc: RawMockTestAttemptDoc,
  ): MockTestAttemptEntity {
    return new MockTestAttemptEntity({
      _id: id(doc._id),
      testId: id(doc.testId),
      userId: id(doc.userId),
      status: doc.status || 'in_progress',
      startedAt: dateOrNow(doc.startedAt),
      completedAt: doc.completedAt,
      timeTakenSeconds: doc.timeTakenSeconds,
      score: doc.score,
      scorePercentage: doc.scorePercentage,
      passed: doc.passed,
      flaggedQuestions: doc.flaggedQuestions?.map(id) || [],
      totalQuestions: numberOrZero(doc.totalQuestions),
      answeredQuestions: numberOrZero(doc.answeredQuestions),
      createdAt: dateOrNow(doc.createdAt),
    })
  }

  private toMockTestAnswerEntity(
    doc: RawMockTestAnswerDoc,
  ): MockTestAnswerEntity {
    return new MockTestAnswerEntity({
      _id: id(doc._id),
      attemptId: id(doc.attemptId),
      questionId: id(doc.questionId),
      answer: doc.answer || '',
      isCorrect: doc.isCorrect,
      pointsEarned: doc.pointsEarned,
      aiEvaluationId: optionalId(doc.aiEvaluationId),
      submittedAt: dateOrNow(doc.submittedAt || doc.createdAt),
    })
  }

  private toMockTestAIEvaluationEntity(
    doc: RawMockTestAIEvaluationDoc,
  ): MockTestAIEvaluationEntity {
    return new MockTestAIEvaluationEntity({
      _id: id(doc._id),
      attemptId: id(doc.attemptId),
      questionId: id(doc.questionId),
      answerId: id(doc.answerId),
      score: numberOrZero(doc.score),
      maxScore: numberOrZero(doc.maxScore),
      feedback: doc.feedback || '',
      status: doc.status || 'pending',
      createdAt: dateOrNow(doc.createdAt),
    })
  }

  private toMockTestReportEntity(
    doc: RawMockTestReportDoc,
  ): MockTestReportEntity {
    return new MockTestReportEntity({
      _id: id(doc._id),
      attemptId: id(doc.attemptId),
      userId: id(doc.userId),
      testId: id(doc.testId),
      score: numberOrZero(doc.score),
      scorePercentage: numberOrZero(doc.scorePercentage),
      passed: Boolean(doc.passed),
      timeTakenSeconds: numberOrZero(doc.timeTakenSeconds),
      totalQuestions: numberOrZero(doc.totalQuestions),
      correctAnswers: numberOrZero(doc.correctAnswers),
      incorrectAnswers: numberOrZero(doc.incorrectAnswers),
      skippedAnswers: numberOrZero(doc.skippedAnswers),
      strongTopics: doc.strongTopics || [],
      weakTopics: doc.weakTopics || [],
      recommendations: doc.recommendations || [],
      createdAt: dateOrNow(doc.createdAt),
    })
  }

  private toMockTestCreationSessionEntity(
    doc: RawMockTestCreationSessionDoc,
  ): MockTestCreationSessionEntity {
    return new MockTestCreationSessionEntity({
      _id: id(doc._id),
      userId: id(doc.userId),
      status: doc.status || 'draft',
      step: doc.step || 1,
      draftData: doc.draftData || {},
      createdAt: dateOrNow(doc.createdAt),
      updatedAt: dateOrNow(doc.updatedAt),
    })
  }

  constructor() {
    this.implementation = {

      findTestById: async (testId) => {
        const safeTestId = toObjectId(testId)
        if (!safeTestId) return null

        const doc = await MockTestModel.findOne({ _id: safeTestId }).lean()
        return doc ? this.toMockTestEntity(doc as RawMockTestDoc) : null
      },

      findTestsByOwner: async (ownerId, options = {}) => {
        const safeOwnerId = toObjectId(ownerId)

        if (!safeOwnerId) {
          return {
            tests: [],
            total: 0,
          }
        }

        const safePage = sanitizePage(options.page || 1)
        const safeLimit = sanitizeLimit(options.limit || 6)
        const skip = (safePage - 1) * safeLimit

        const [docs, total] = await Promise.all([
          MockTestModel.find({ ownerId: safeOwnerId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(safeLimit)
            .lean(),

          MockTestModel.countDocuments({ ownerId: safeOwnerId }),
        ])

        return {
          tests: docs.map((doc) => this.toMockTestEntity(doc as RawMockTestDoc)),
          total,
        }
      },

      findPublicTests: async ({ difficulty, tags, page = 1, limit = 20 }) => {
        const safeDifficulty = sanitizeDifficulty(difficulty)
        const safeTags = sanitizeTags(tags)
        const safePage = sanitizePage(page)
        const safeLimit = sanitizeLimit(limit)
        const skip = (safePage - 1) * safeLimit

        const docs = await getPublicTestsByDifficulty(safeDifficulty)

        const filteredDocs = safeTags.length
          ? docs.filter((doc) => {
            const test = doc as RawMockTestDoc
            const docTags = Array.isArray(test.tags) ? test.tags : []

            return safeTags.some((tag) => docTags.includes(tag))
          })
          : docs

        const paginatedDocs = filteredDocs.slice(skip, skip + safeLimit)

        return {
          tests: paginatedDocs.map((doc) => this.toMockTestEntity(doc as RawMockTestDoc)),
          total: filteredDocs.length,
        }
      },

      createTest: async (data) =>
        this.toMockTestEntity((await MockTestModel.create(data)).toObject() as RawMockTestDoc),

      updateTest: async (testId, data) => {
        const safeTestId = toObjectId(testId)
        if (!safeTestId) return null

        const doc = await MockTestModel.findOneAndUpdate(
          { _id: safeTestId },
          data,
          { new: true },
        ).lean()

        return doc ? this.toMockTestEntity(doc as RawMockTestDoc) : null
      },

      deleteTest: async (testId) => {
        const safeTestId = toObjectId(testId)
        if (!safeTestId) return

        await Promise.all([
          MockTestQuestionModel.deleteMany({ testId: safeTestId }),
          MockTestModel.findOneAndDelete({ _id: safeTestId }),
        ])
      },

      findQuestionsByTest: async (testId) => {
        const safeTestId = toObjectId(testId)
        if (!safeTestId) return []

        return (
          await MockTestQuestionModel.find({ testId: safeTestId })
            .sort({ order: 1 })
            .lean()
        ).map((doc) => this.toMockTestQuestionEntity(doc as RawMockTestQuestionDoc))
      },

      findQuestionById: async (questionId) => {
        const safeQuestionId = toObjectId(questionId)
        if (!safeQuestionId) return null

        const doc = await MockTestQuestionModel.findOne({ _id: safeQuestionId }).lean()
        return doc ? this.toMockTestQuestionEntity(doc as RawMockTestQuestionDoc) : null
      },

      createQuestions: async (questions) =>
        (await MockTestQuestionModel.insertMany(questions)).map((doc) =>
          this.toMockTestQuestionEntity(doc.toObject() as RawMockTestQuestionDoc),
        ),

      findAttemptById: async (attemptId) => {
        const safeAttemptId = toObjectId(attemptId)
        if (!safeAttemptId) return null

        const doc = await MockTestAttemptModel.findOne({ _id: safeAttemptId }).lean()
        return doc ? this.toMockTestAttemptEntity(doc as RawMockTestAttemptDoc) : null
      },

      findAttemptsByUser: async (userId, testId) => {
        const safeUserId = toObjectId(userId)
        if (!safeUserId) return []

        if (testId) {
          const safeTestId = toObjectId(testId)
          if (!safeTestId) return []

          return (
            await MockTestAttemptModel.find({
              userId: safeUserId,
              testId: safeTestId,
            })
              .sort({ createdAt: -1 })
              .lean()
          ).map((doc) => this.toMockTestAttemptEntity(doc as RawMockTestAttemptDoc))
        }

        return (
          await MockTestAttemptModel.find({ userId: safeUserId })
            .sort({ createdAt: -1 })
            .lean()
        ).map((doc) => this.toMockTestAttemptEntity(doc as RawMockTestAttemptDoc))
      },

      findLatestAttemptsForTests: async (userId, testIds) => {
        const safeUserId = toObjectId(userId)
        if (!safeUserId || !testIds.length) return {}

        const safeTestIds = toObjectIds(testIds)
        if (!safeTestIds.length) return {}

        const docs = await MockTestAttemptModel.find({
          userId: safeUserId,
          testId: { $in: safeTestIds },
        })
          .sort({ createdAt: -1 })
          .lean()

        const result: Record<string, MockTestAttemptEntity> = {}

        for (const doc of docs) {
          const mapped = this.toMockTestAttemptEntity(doc as RawMockTestAttemptDoc)
          if (!result[mapped.testId]) result[mapped.testId] = mapped
        }

        return result
      },

      findActiveAttempt: async (userId, testId) => {
        const safeUserId = toObjectId(userId)
        const safeTestId = toObjectId(testId)

        if (!safeUserId || !safeTestId) return null

        const doc = await MockTestAttemptModel.findOne({
          userId: safeUserId,
          testId: safeTestId,
          status: 'in_progress',
        }).lean()

        return doc ? this.toMockTestAttemptEntity(doc as RawMockTestAttemptDoc) : null
      },

      createAttempt: async (data) =>
        this.toMockTestAttemptEntity(
          (
            await MockTestAttemptModel.create({
              ...data,
              status: 'in_progress',
              startedAt: new Date(),
              answeredQuestions: 0,
              flaggedQuestions: [],
            })
          ).toObject() as RawMockTestAttemptDoc,
        ),

      updateAttempt: async (attemptId, data) => {
        const safeAttemptId = toObjectId(attemptId)
        if (!safeAttemptId) return null

        const doc = await MockTestAttemptModel.findOneAndUpdate(
          { _id: safeAttemptId },
          data,
          { new: true },
        ).lean()

        return doc ? this.toMockTestAttemptEntity(doc as RawMockTestAttemptDoc) : null
      },

      incrementAnsweredCount: async (attemptId) => {
        const safeAttemptId = toObjectId(attemptId)
        if (!safeAttemptId) return

        await MockTestAttemptModel.findOneAndUpdate(
          { _id: safeAttemptId },
          { $inc: { answeredQuestions: 1 } },
        )
      },

      abandonActiveAttempts: async (userId, testId) => {
        const safeUserId = toObjectId(userId)
        const safeTestId = toObjectId(testId)

        if (!safeUserId || !safeTestId) return

        await MockTestAttemptModel.updateMany(
          {
            userId: safeUserId,
            testId: safeTestId,
            status: 'in_progress',
          },
          { status: 'abandoned' },
        )
      },

      findAnswersByAttempt: async (attemptId) => {
        const safeAttemptId = toObjectId(attemptId)
        if (!safeAttemptId) return []

        return (await MockTestAnswerModel.find({ attemptId: safeAttemptId }).lean()).map((doc) =>
          this.toMockTestAnswerEntity(doc as RawMockTestAnswerDoc),
        )
      },

      findAnswerByQuestion: async (attemptId, questionId) => {
        const safeAttemptId = toObjectId(attemptId)
        const safeQuestionId = toObjectId(questionId)

        if (!safeAttemptId || !safeQuestionId) return null

        const doc = await MockTestAnswerModel.findOne({
          attemptId: safeAttemptId,
          questionId: safeQuestionId,
        }).lean()

        return doc ? this.toMockTestAnswerEntity(doc as RawMockTestAnswerDoc) : null
      },

      saveAnswer: async (data) =>
        this.toMockTestAnswerEntity((await MockTestAnswerModel.create(data)).toObject() as RawMockTestAnswerDoc),

      updateAnswer: async (answerId, data) => {
        const safeAnswerId = toObjectId(answerId)
        if (!safeAnswerId) return null

        const doc = await MockTestAnswerModel.findOneAndUpdate(
          { _id: safeAnswerId },
          data,
          { new: true },
        ).lean()

        return doc ? this.toMockTestAnswerEntity(doc as RawMockTestAnswerDoc) : null
      },

      flagQuestion: async (attemptId, questionId) => {
        const safeAttemptId = toObjectId(attemptId)
        const safeQuestionId = toObjectId(questionId)

        if (!safeAttemptId || !safeQuestionId) return

        await MockTestAttemptModel.findOneAndUpdate(
          { _id: safeAttemptId },
          { $addToSet: { flaggedQuestions: safeQuestionId } },
        )
      },

      unflagQuestion: async (attemptId, questionId) => {
        const safeAttemptId = toObjectId(attemptId)
        const safeQuestionId = toObjectId(questionId)

        if (!safeAttemptId || !safeQuestionId) return

        await MockTestAttemptModel.findOneAndUpdate(
          { _id: safeAttemptId },
          { $pull: { flaggedQuestions: safeQuestionId } },
        )
      },

      createAIEvaluation: async (data) =>
        this.toMockTestAIEvaluationEntity(
          (
            await MockTestAIEvaluationModel.create({
              ...data,
              status: 'completed',
            })
          ).toObject() as RawMockTestAIEvaluationDoc,
        ),

      findAIEvaluationsByAttempt: async (attemptId) => {
        const safeAttemptId = toObjectId(attemptId)
        if (!safeAttemptId) return []

        return (
          await MockTestAIEvaluationModel.find({ attemptId: safeAttemptId }).lean()
        ).map((doc) => this.toMockTestAIEvaluationEntity(doc as RawMockTestAIEvaluationDoc))
      },

      findReportByAttempt: async (attemptId) => {
        const safeAttemptId = toObjectId(attemptId)
        if (!safeAttemptId) return null

        const doc = await MockTestReportModel.findOne({ attemptId: safeAttemptId }).lean()
        return doc ? this.toMockTestReportEntity(doc as RawMockTestReportDoc) : null
      },

      createReport: async (data) =>
        this.toMockTestReportEntity((await MockTestReportModel.create(data)).toObject() as RawMockTestReportDoc),

      getAttemptHistory: async (userId) => {
        const safeUserId = toObjectId(userId)
        if (!safeUserId) return []

        return (
          await MockTestAttemptModel.find({ userId: safeUserId })
            .populate('testId')
            .sort({ createdAt: -1 })
            .lean()
        ).map((doc) => {
          const attemptDoc = doc as RawMockTestAttemptDoc
          const populatedTest = isRecord(attemptDoc.testId)
            ? this.toMockTestEntity(attemptDoc.testId as RawMockTestDoc)
            : null

          return {
            ...this.toMockTestAttemptEntity(attemptDoc),
            test: populatedTest,
          }
        })
      },

      getUserSummary: async (userId) => {
        const safeUserId = toObjectId(userId)

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
          MockTestModel.find({ ownerId: safeUserId }).select('questionCount').lean(),
          MockTestAttemptModel.aggregate<UserSummaryAggregation>([
            {
              $match: {
                userId: safeUserId,
                status: 'completed',
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

      getPerformanceTrends: async (userId) => {
        const safeUserId = toObjectId(userId)
        if (!safeUserId) return []

        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const aggregation = await MockTestAttemptModel.aggregate<PerformanceTrendAggregation>([
          {
            $match: {
              userId: safeUserId,
              status: 'completed',
              completedAt: { $gte: thirtyDaysAgo },
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
          { $sort: { _id: 1 } },
        ])

        return aggregation.map((item) => ({
          date: item._id,
          averageScore: Math.round(item.averageScore),
          attempts: item.attempts,
        }))
      },

      getTopicBreakdown: async (userId) => {
        const safeUserId = toObjectId(userId)
        if (!safeUserId) return []

        const attempts = await MockTestAttemptModel.find({
          userId: safeUserId,
          status: 'completed',
        })
          .populate('testId', 'tags')
          .lean()

        const topicData: Record<string, { total: number; scoreSum: number }> = {}

        for (const attempt of attempts as RawMockTestAttemptDoc[]) {
          const testDoc = isRecord(attempt.testId) ? attempt.testId : null
          const tags = Array.isArray(testDoc?.tags) ? (testDoc.tags as string[]) : []

          for (const tag of tags) {
            topicData[tag] ||= { total: 0, scoreSum: 0 }
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
          .sort((a, b) => a.averageScore - b.averageScore)
      },

      updateAnalyticsSnapshot: async (testId) => {
        const safeTestId = toObjectId(testId)
        if (!safeTestId) return

        const aggregation = await MockTestAttemptModel.aggregate<AnalyticsSnapshotAggregation>([
          {
            $match: {
              testId: safeTestId,
              status: 'completed',
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

        if (!aggregation.length) return

        const data = aggregation[0]

        await MockTestAnalyticsSnapshotModel.findOneAndUpdate(
          { testId: safeTestId },
          {
            totalAttempts: data.totalAttempts,
            averageScore: Math.round(data.averageScore),
            passRate: Math.round((data.passCount / data.totalAttempts) * 100),
            averageTimeTakenSeconds: Math.round(data.averageTimeTaken || 0),
          },
          { upsert: true, new: true },
        )

        await MockTestModel.findOneAndUpdate(
          { _id: safeTestId },
          {
            averageScore: Math.round(data.averageScore),
            attemptCount: data.totalAttempts,
          },
        )
      },

      findCreationSession: async (sessionId) => {
        const safeSessionId = toObjectId(sessionId)
        if (!safeSessionId) return null

        const doc = await MockTestCreationSessionModel.findOne({ _id: safeSessionId }).lean()
        return doc ? this.toMockTestCreationSessionEntity(doc as RawMockTestCreationSessionDoc) : null
      },

      findActiveCreationSession: async (userId) => {
        const safeUserId = toObjectId(userId)
        if (!safeUserId) return null

        const doc = await MockTestCreationSessionModel.findOne({
          userId: safeUserId,
          status: 'draft',
        }).lean()

        return doc ? this.toMockTestCreationSessionEntity(doc as RawMockTestCreationSessionDoc) : null
      },

      createCreationSession: async (userId) =>
        this.toMockTestCreationSessionEntity(
          (
            await MockTestCreationSessionModel.create({
              userId,
              status: 'draft',
              step: 1,
              draftData: {},
            })
          ).toObject() as RawMockTestCreationSessionDoc,
        ),

      updateCreationSession: async (sessionId, data) => {
        const safeSessionId = toObjectId(sessionId)
        if (!safeSessionId) return null

        const doc = await MockTestCreationSessionModel.findOneAndUpdate(
          { _id: safeSessionId },
          data,
          { new: true },
        ).lean()

        return doc ? this.toMockTestCreationSessionEntity(doc as RawMockTestCreationSessionDoc) : null
      },

      cancelCreationSession: async (sessionId) => {
        const safeSessionId = toObjectId(sessionId)
        if (!safeSessionId) return

        await MockTestCreationSessionModel.findOneAndUpdate(
          { _id: safeSessionId },
          { status: 'cancelled' },
        )
      },
      findSharedTestByToken: async (shareToken) => {
        const doc = await MockTestModel.findOne({
          shareToken,
          isShareEnabled: true,
        }).lean()

        return doc ? this.toMockTestEntity(doc as RawMockTestDoc) : null
      },

      findImportedSharedTest: async (ownerId, sourceTestId) => {
        const safeOwnerId = toObjectId(ownerId)
        const safeSourceTestId = toObjectId(sourceTestId)

        if (!safeOwnerId || !safeSourceTestId) return null

        const doc = await MockTestModel.findOne({
          ownerId: safeOwnerId,
          sourceTestId: safeSourceTestId,
        }).lean()

        return doc ? this.toMockTestEntity(doc as RawMockTestDoc) : null
      },

      enableTestSharing: async (ownerId, testId, shareToken) => {
        const safeOwnerId = toObjectId(ownerId)
        const safeTestId = toObjectId(testId)

        if (!safeOwnerId || !safeTestId) return null

        const doc = await MockTestModel.findOneAndUpdate(
          {
            _id: safeTestId,
            ownerId: safeOwnerId,
          },
          {
            shareToken,
            isShareEnabled: true,
          },
          { new: true },
        ).lean()

        return doc ? this.toMockTestEntity(doc as RawMockTestDoc) : null
      },

      incrementCloneCount: async (testId) => {
        const safeTestId = toObjectId(testId)

        if (!safeTestId) return

        await MockTestModel.findOneAndUpdate(
          { _id: safeTestId },
          { $inc: { cloneCount: 1 } },
        )
      },
    }
  }
  findTestById: MockTestsRepositoryContract['findTestById'] = (...args) => this.execute(() =>
    this.implementation.findTestById(...args),
  )

  findTestsByOwner: MockTestsRepositoryContract['findTestsByOwner'] = (...args) => this.execute(() =>
    this.implementation.findTestsByOwner(...args),
  )

  findPublicTests: MockTestsRepositoryContract['findPublicTests'] = (...args) => this.execute(() =>
    this.implementation.findPublicTests(...args),
  )

  findSharedTestByToken: MockTestsRepositoryContract['findSharedTestByToken'] = (...args) => this.execute(() =>
    this.implementation.findSharedTestByToken(...args),
  )

  findImportedSharedTest: MockTestsRepositoryContract['findImportedSharedTest'] = (...args) => this.execute(() =>
    this.implementation.findImportedSharedTest(...args),
  )

  enableTestSharing: MockTestsRepositoryContract['enableTestSharing'] = (...args) => this.execute(() =>
    this.implementation.enableTestSharing(...args),
  )

  incrementCloneCount: MockTestsRepositoryContract['incrementCloneCount'] = (...args) => this.execute(() =>
    this.implementation.incrementCloneCount(...args),
  )

  createTest: MockTestsRepositoryContract['createTest'] = (...args) => this.execute(() =>
    this.implementation.createTest(...args),
  )

  updateTest: MockTestsRepositoryContract['updateTest'] = (...args) => this.execute(() =>
    this.implementation.updateTest(...args),
  )

  deleteTest: MockTestsRepositoryContract['deleteTest'] = (...args) => this.execute(() =>
    this.implementation.deleteTest(...args),
  )

  findQuestionsByTest: MockTestsRepositoryContract['findQuestionsByTest'] = (...args) => this.execute(() =>
    this.implementation.findQuestionsByTest(...args),
  )

  findQuestionById: MockTestsRepositoryContract['findQuestionById'] = (...args) => this.execute(() =>
    this.implementation.findQuestionById(...args),
  )

  createQuestions: MockTestsRepositoryContract['createQuestions'] = (...args) => this.execute(() =>
    this.implementation.createQuestions(...args),
  )

  findAttemptById: MockTestsRepositoryContract['findAttemptById'] = (...args) => this.execute(() =>
    this.implementation.findAttemptById(...args),
  )

  findAttemptsByUser: MockTestsRepositoryContract['findAttemptsByUser'] = (...args) => this.execute(() =>
    this.implementation.findAttemptsByUser(...args),
  )

  findLatestAttemptsForTests: MockTestsRepositoryContract['findLatestAttemptsForTests'] = (...args) => this.execute(() =>
    this.implementation.findLatestAttemptsForTests(...args),
  )

  findActiveAttempt: MockTestsRepositoryContract['findActiveAttempt'] = (...args) => this.execute(() =>
    this.implementation.findActiveAttempt(...args),
  )

  createAttempt: MockTestsRepositoryContract['createAttempt'] = (...args) => this.execute(() =>
    this.implementation.createAttempt(...args),
  )

  updateAttempt: MockTestsRepositoryContract['updateAttempt'] = (...args) => this.execute(() =>
    this.implementation.updateAttempt(...args),
  )

  incrementAnsweredCount: MockTestsRepositoryContract['incrementAnsweredCount'] = (...args) => this.execute(() =>
    this.implementation.incrementAnsweredCount(...args),
  )

  abandonActiveAttempts: MockTestsRepositoryContract['abandonActiveAttempts'] = (...args) => this.execute(() =>
    this.implementation.abandonActiveAttempts(...args),
  )

  findAnswersByAttempt: MockTestsRepositoryContract['findAnswersByAttempt'] = (...args) => this.execute(() =>
    this.implementation.findAnswersByAttempt(...args),
  )

  findAnswerByQuestion: MockTestsRepositoryContract['findAnswerByQuestion'] = (...args) => this.execute(() =>
    this.implementation.findAnswerByQuestion(...args),
  )

  saveAnswer: MockTestsRepositoryContract['saveAnswer'] = (...args) => this.execute(() =>
    this.implementation.saveAnswer(...args),
  )

  updateAnswer: MockTestsRepositoryContract['updateAnswer'] = (...args) => this.execute(() =>
    this.implementation.updateAnswer(...args),
  )

  flagQuestion: MockTestsRepositoryContract['flagQuestion'] = (...args) => this.execute(() =>
    this.implementation.flagQuestion(...args),
  )

  unflagQuestion: MockTestsRepositoryContract['unflagQuestion'] = (...args) => this.execute(() =>
    this.implementation.unflagQuestion(...args),
  )

  createAIEvaluation: MockTestsRepositoryContract['createAIEvaluation'] = (...args) => this.execute(() =>
    this.implementation.createAIEvaluation(...args),
  )

  findAIEvaluationsByAttempt: MockTestsRepositoryContract['findAIEvaluationsByAttempt'] = (...args) => this.execute(() =>
    this.implementation.findAIEvaluationsByAttempt(...args),
  )

  findReportByAttempt: MockTestsRepositoryContract['findReportByAttempt'] = (...args) => this.execute(() =>
    this.implementation.findReportByAttempt(...args),
  )

  createReport: MockTestsRepositoryContract['createReport'] = (...args) => this.execute(() =>
    this.implementation.createReport(...args),
  )

  getAttemptHistory: MockTestsRepositoryContract['getAttemptHistory'] = (...args) => this.execute(() =>
    this.implementation.getAttemptHistory(...args),
  )

  getUserSummary: MockTestsRepositoryContract['getUserSummary'] = (...args) => this.execute(() =>
    this.implementation.getUserSummary(...args),
  )

  getPerformanceTrends: MockTestsRepositoryContract['getPerformanceTrends'] = (...args) => this.execute(() =>
    this.implementation.getPerformanceTrends(...args),
  )

  getTopicBreakdown: MockTestsRepositoryContract['getTopicBreakdown'] = (...args) => this.execute(() =>
    this.implementation.getTopicBreakdown(...args),
  )

  updateAnalyticsSnapshot: MockTestsRepositoryContract['updateAnalyticsSnapshot'] = (...args) => this.execute(() =>
    this.implementation.updateAnalyticsSnapshot(...args),
  )

  findCreationSession: MockTestsRepositoryContract['findCreationSession'] = (...args) => this.execute(() =>
    this.implementation.findCreationSession(...args),
  )

  findActiveCreationSession: MockTestsRepositoryContract['findActiveCreationSession'] = (...args) => this.execute(() =>
    this.implementation.findActiveCreationSession(...args),
  )

  createCreationSession: MockTestsRepositoryContract['createCreationSession'] = (...args) => this.execute(() =>
    this.implementation.createCreationSession(...args),
  )

  updateCreationSession: MockTestsRepositoryContract['updateCreationSession'] = (...args) => this.execute(() =>
    this.implementation.updateCreationSession(...args),
  )

  cancelCreationSession: MockTestsRepositoryContract['cancelCreationSession'] = (...args) => this.execute(() =>
    this.implementation.cancelCreationSession(...args),
  )


  private async execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      if (error instanceof MockTestsDomainError) {
        throw error
      }

      throw new MockTestsDomainError(
        'PERSISTENCE_ERROR',
        'Mock test persistence operation failed',
      )
    }
  }
}

export const mongoMockTestsRepository = new MongoMockTestsRepository()
