import mongoose from 'mongoose'
import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import {
  AnalyticsSnapshotAggregation,
  DifficultyLevel,
  MockTest,
  MockTestAIEvaluation,
  MockTestAnswer,
  MockTestAttempt,
  MockTestCreationSession,
  MockTestQuestion,
  MockTestReport,
  PerformanceTrendAggregation,
  QuestionCountDoc,
  RawMockTestAIEvaluationDoc,
  RawMockTestAnswerDoc,
  RawMockTestAttemptDoc,
  RawMockTestCreationSessionDoc,
  RawMockTestDoc,
  RawMockTestQuestionDoc,
  RawMockTestReportDoc,
  RawRecord,
  UserSummaryAggregation,
} from '../../domain/types/mock-tests.types'
import { MockTestModel } from '../../../../infrastructure/database/models/mock-test.model'
import { MockTestQuestionModel } from '../../../../infrastructure/database/models/mock-test-question.model'
import { MockTestAttemptModel } from '../../../../infrastructure/database/models/mock-test-attempt.model'
import { MockTestAnswerModel } from '../../../../infrastructure/database/models/mock-test-answer.model'
import { MockTestAIEvaluationModel } from '../../../../infrastructure/database/models/mock-test-ai-evaluation.model'
import { MockTestReportModel } from '../../../../infrastructure/database/models/mock-test-report.model'
import { MockTestAnalyticsSnapshotModel } from '../../../../infrastructure/database/models/mock-test-analytics-snapshot.model'
import { MockTestCreationSessionModel } from '../../../../infrastructure/database/models/mock-test-creation-session.model'

const ALLOWED_DIFFICULTIES = ['easy', 'medium', 'hard'] as const
const SAFE_TAG_PATTERN = /^[a-zA-Z0-9 _-]{1,40}$/

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null

const id = (value: unknown): string => {
  if (!value) return ''

  if (isRecord(value) && '_id' in value) {
    return id(value._id)
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

const mapTest = (doc: RawMockTestDoc): MockTest => ({
  _id: id(doc._id),
  ownerId: id(doc.ownerId),
  trackerId: optionalId(doc.trackerId),
  title: doc.title || '',
  description: doc.description || '',
  difficulty: doc.difficulty || 'easy',
  visibility: doc.visibility || 'private',
  questionCount: numberOrZero(doc.questionCount),
  timeLimitMinutes: numberOrZero(doc.timeLimitMinutes),
  passingScore: numberOrZero(doc.passingScore),
  isAIGenerated: Boolean(doc.isAIGenerated),
  tags: doc.tags || [],
  cloneCount: doc.cloneCount || 0,
  averageScore: doc.averageScore || 0,
  attemptCount: doc.attemptCount || 0,
  createdAt: dateOrNow(doc.createdAt),
  updatedAt: dateOrNow(doc.updatedAt),
})

const mapQuestion = (doc: RawMockTestQuestionDoc): MockTestQuestion => ({
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
})

const mapAttempt = (doc: RawMockTestAttemptDoc): MockTestAttempt => ({
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

const mapAnswer = (doc: RawMockTestAnswerDoc): MockTestAnswer => ({
  _id: id(doc._id),
  attemptId: id(doc.attemptId),
  questionId: id(doc.questionId),
  answer: doc.answer || '',
  isCorrect: doc.isCorrect,
  pointsEarned: doc.pointsEarned,
  aiEvaluationId: optionalId(doc.aiEvaluationId),
  submittedAt: dateOrNow(doc.submittedAt || doc.createdAt),
})

const mapAIEvaluation = (doc: RawMockTestAIEvaluationDoc): MockTestAIEvaluation => ({
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

const mapReport = (doc: RawMockTestReportDoc): MockTestReport => ({
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

const mapSession = (doc: RawMockTestCreationSessionDoc): MockTestCreationSession => ({
  _id: id(doc._id),
  userId: id(doc.userId),
  status: doc.status || 'draft',
  step: doc.step || 1,
  draftData: doc.draftData || {},
  createdAt: dateOrNow(doc.createdAt),
  updatedAt: dateOrNow(doc.updatedAt),
})

export const mongoMockTestsRepository: MockTestsRepositoryContract = {
  findTestById: async (testId) => {
    const safeTestId = toObjectId(testId)
    if (!safeTestId) return null

    const doc = await MockTestModel.findOne({ _id: safeTestId }).lean()
    return doc ? mapTest(doc as RawMockTestDoc) : null
  },

  findTestsByOwner: async (ownerId) => {
    const safeOwnerId = toObjectId(ownerId)
    if (!safeOwnerId) return []

    return (
      await MockTestModel.find({ ownerId: safeOwnerId })
        .sort({ createdAt: -1 })
        .lean()
    ).map((doc) => mapTest(doc as RawMockTestDoc))
  },

  findPublicTests: async ({ difficulty, tags, page = 1, limit = 20 }) => {
    const safeDifficulty = sanitizeDifficulty(difficulty)
    const safeTags = sanitizeTags(tags)
    const safePage = sanitizePage(page)
    const safeLimit = sanitizeLimit(limit)
    const skip = (safePage - 1) * safeLimit

    const query =
      safeDifficulty && safeTags.length
        ? {
            visibility: 'public' as const,
            difficulty: safeDifficulty,
            tags: { $in: safeTags },
          }
        : safeDifficulty
          ? {
              visibility: 'public' as const,
              difficulty: safeDifficulty,
            }
          : safeTags.length
            ? {
                visibility: 'public' as const,
                tags: { $in: safeTags },
              }
            : {
                visibility: 'public' as const,
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
      tests: docs.map((doc) => mapTest(doc as RawMockTestDoc)),
      total,
    }
  },

  createTest: async (data) =>
    mapTest((await MockTestModel.create(data)).toObject() as RawMockTestDoc),

  updateTest: async (testId, data) => {
    const safeTestId = toObjectId(testId)
    if (!safeTestId) return null

    const doc = await MockTestModel.findOneAndUpdate(
      { _id: safeTestId },
      data,
      { new: true },
    ).lean()

    return doc ? mapTest(doc as RawMockTestDoc) : null
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
    ).map((doc) => mapQuestion(doc as RawMockTestQuestionDoc))
  },

  findQuestionById: async (questionId) => {
    const safeQuestionId = toObjectId(questionId)
    if (!safeQuestionId) return null

    const doc = await MockTestQuestionModel.findOne({ _id: safeQuestionId }).lean()
    return doc ? mapQuestion(doc as RawMockTestQuestionDoc) : null
  },

  createQuestions: async (questions) =>
    (await MockTestQuestionModel.insertMany(questions)).map((doc) =>
      mapQuestion(doc.toObject() as RawMockTestQuestionDoc),
    ),

  findAttemptById: async (attemptId) => {
    const safeAttemptId = toObjectId(attemptId)
    if (!safeAttemptId) return null

    const doc = await MockTestAttemptModel.findOne({ _id: safeAttemptId }).lean()
    return doc ? mapAttempt(doc as RawMockTestAttemptDoc) : null
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
      ).map((doc) => mapAttempt(doc as RawMockTestAttemptDoc))
    }

    return (
      await MockTestAttemptModel.find({ userId: safeUserId })
        .sort({ createdAt: -1 })
        .lean()
    ).map((doc) => mapAttempt(doc as RawMockTestAttemptDoc))
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

    const result: Record<string, MockTestAttempt> = {}

    for (const doc of docs) {
      const mapped = mapAttempt(doc as RawMockTestAttemptDoc)
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

    return doc ? mapAttempt(doc as RawMockTestAttemptDoc) : null
  },

  createAttempt: async (data) =>
    mapAttempt(
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

    return doc ? mapAttempt(doc as RawMockTestAttemptDoc) : null
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
      mapAnswer(doc as RawMockTestAnswerDoc),
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

    return doc ? mapAnswer(doc as RawMockTestAnswerDoc) : null
  },

  saveAnswer: async (data) =>
    mapAnswer((await MockTestAnswerModel.create(data)).toObject() as RawMockTestAnswerDoc),

  updateAnswer: async (answerId, data) => {
    const safeAnswerId = toObjectId(answerId)
    if (!safeAnswerId) return null

    const doc = await MockTestAnswerModel.findOneAndUpdate(
      { _id: safeAnswerId },
      data,
      { new: true },
    ).lean()

    return doc ? mapAnswer(doc as RawMockTestAnswerDoc) : null
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
    mapAIEvaluation(
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
    ).map((doc) => mapAIEvaluation(doc as RawMockTestAIEvaluationDoc))
  },

  findReportByAttempt: async (attemptId) => {
    const safeAttemptId = toObjectId(attemptId)
    if (!safeAttemptId) return null

    const doc = await MockTestReportModel.findOne({ attemptId: safeAttemptId }).lean()
    return doc ? mapReport(doc as RawMockTestReportDoc) : null
  },

  createReport: async (data) =>
    mapReport((await MockTestReportModel.create(data)).toObject() as RawMockTestReportDoc),

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
        ? mapTest(attemptDoc.testId as RawMockTestDoc)
        : null

      return {
        ...mapAttempt(attemptDoc),
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
    return doc ? mapSession(doc as RawMockTestCreationSessionDoc) : null
  },

  findActiveCreationSession: async (userId) => {
    const safeUserId = toObjectId(userId)
    if (!safeUserId) return null

    const doc = await MockTestCreationSessionModel.findOne({
      userId: safeUserId,
      status: 'draft',
    }).lean()

    return doc ? mapSession(doc as RawMockTestCreationSessionDoc) : null
  },

  createCreationSession: async (userId) =>
    mapSession(
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

    return doc ? mapSession(doc as RawMockTestCreationSessionDoc) : null
  },

  cancelCreationSession: async (sessionId) => {
    const safeSessionId = toObjectId(sessionId)
    if (!safeSessionId) return

    await MockTestCreationSessionModel.findOneAndUpdate(
      { _id: safeSessionId },
      { status: 'cancelled' },
    )
  },
}