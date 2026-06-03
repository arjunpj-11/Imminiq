import mongoose from 'mongoose'
import { MockTestsRepositoryContract } from '../../domain/repositories/mock-tests.repository.interface'
import { MockTest, MockTestQuestion, MockTestAttempt, MockTestAnswer, MockTestAIEvaluation, MockTestReport, MockTestCreationSession } from '../../domain/types/mock-tests.types'
import { MockTestModel } from '../../../../infrastructure/database/models/mock-test.model'
import { MockTestQuestionModel } from '../../../../infrastructure/database/models/mock-test-question.model'
import { MockTestAttemptModel } from '../../../../infrastructure/database/models/mock-test-attempt.model'
import { MockTestAnswerModel } from '../../../../infrastructure/database/models/mock-test-answer.model'
import { MockTestAIEvaluationModel } from '../../../../infrastructure/database/models/mock-test-ai-evaluation.model'
import { MockTestReportModel } from '../../../../infrastructure/database/models/mock-test-report.model'
import { MockTestAnalyticsSnapshotModel } from '../../../../infrastructure/database/models/mock-test-analytics-snapshot.model'
import { MockTestCreationSessionModel } from '../../../../infrastructure/database/models/mock-test-creation-session.model'

const id = (value: any) => value?.toString()

const mapTest = (doc: any): MockTest => ({ _id: id(doc._id), ownerId: id(doc.ownerId), trackerId: id(doc.trackerId), title: doc.title, description: doc.description, difficulty: doc.difficulty, visibility: doc.visibility, questionCount: doc.questionCount, timeLimitMinutes: doc.timeLimitMinutes, passingScore: doc.passingScore, isAIGenerated: doc.isAIGenerated, tags: doc.tags || [], cloneCount: doc.cloneCount || 0, averageScore: doc.averageScore || 0, attemptCount: doc.attemptCount || 0, createdAt: doc.createdAt, updatedAt: doc.updatedAt })
const mapQuestion = (doc: any): MockTestQuestion => ({ _id: id(doc._id), testId: id(doc.testId), type: doc.type, question: doc.question, options: doc.options, correctAnswer: doc.correctAnswer, explanation: doc.explanation, difficulty: doc.difficulty, order: doc.order, points: doc.points })
const mapAttempt = (doc: any): MockTestAttempt => ({ _id: id(doc._id), testId: id(doc.testId?._id || doc.testId), userId: id(doc.userId), status: doc.status, startedAt: doc.startedAt, completedAt: doc.completedAt, timeTakenSeconds: doc.timeTakenSeconds, score: doc.score, scorePercentage: doc.scorePercentage, passed: doc.passed, flaggedQuestions: doc.flaggedQuestions?.map(id) || [], totalQuestions: doc.totalQuestions, answeredQuestions: doc.answeredQuestions, createdAt: doc.createdAt })
const mapAnswer = (doc: any): MockTestAnswer => ({ _id: id(doc._id), attemptId: id(doc.attemptId), questionId: id(doc.questionId), answer: doc.answer, isCorrect: doc.isCorrect, pointsEarned: doc.pointsEarned, aiEvaluationId: id(doc.aiEvaluationId), submittedAt: doc.submittedAt || doc.createdAt })
const mapAIEvaluation = (doc: any): MockTestAIEvaluation => ({ _id: id(doc._id), attemptId: id(doc.attemptId), questionId: id(doc.questionId), answerId: id(doc.answerId), score: doc.score, maxScore: doc.maxScore, feedback: doc.feedback, status: doc.status, createdAt: doc.createdAt })
const mapReport = (doc: any): MockTestReport => ({ _id: id(doc._id), attemptId: id(doc.attemptId), userId: id(doc.userId), testId: id(doc.testId), score: doc.score, scorePercentage: doc.scorePercentage, passed: doc.passed, timeTakenSeconds: doc.timeTakenSeconds, totalQuestions: doc.totalQuestions, correctAnswers: doc.correctAnswers, incorrectAnswers: doc.incorrectAnswers, skippedAnswers: doc.skippedAnswers, strongTopics: doc.strongTopics || [], weakTopics: doc.weakTopics || [], recommendations: doc.recommendations || [], createdAt: doc.createdAt })
const mapSession = (doc: any): MockTestCreationSession => ({ _id: id(doc._id), userId: id(doc.userId), status: doc.status, step: doc.step, draftData: doc.draftData || {}, createdAt: doc.createdAt, updatedAt: doc.updatedAt })

export const mongoMockTestsRepository: MockTestsRepositoryContract = {
  findTestById: async (testId) => { const doc = await MockTestModel.findById(testId).lean(); return doc ? mapTest(doc) : null },
  findTestsByOwner: async (ownerId) => (await MockTestModel.find({ ownerId }).sort({ createdAt: -1 }).lean()).map(mapTest),
  findPublicTests: async ({ difficulty, tags, page = 1, limit = 20 }) => {
    const query: any = { visibility: 'public' }
    if (difficulty) query.difficulty = difficulty
    if (tags?.length) query.tags = { $in: tags }
    const [docs, total] = await Promise.all([MockTestModel.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(), MockTestModel.countDocuments(query)])
    return { tests: docs.map(mapTest), total }
  },
  createTest: async (data) => mapTest((await MockTestModel.create(data)).toObject()),
  updateTest: async (testId, data) => { const doc = await MockTestModel.findByIdAndUpdate(testId, data, { new: true }).lean(); return doc ? mapTest(doc) : null },
  deleteTest: async (testId) => { await Promise.all([MockTestQuestionModel.deleteMany({ testId }), MockTestModel.findByIdAndDelete(testId)]) },

  findQuestionsByTest: async (testId) => (await MockTestQuestionModel.find({ testId }).sort({ order: 1 }).lean()).map(mapQuestion),
  findQuestionById: async (questionId) => { const doc = await MockTestQuestionModel.findById(questionId).lean(); return doc ? mapQuestion(doc) : null },
  createQuestions: async (questions) => (await MockTestQuestionModel.insertMany(questions)).map((d: any) => mapQuestion(d.toObject())),

  findAttemptById: async (attemptId) => { const doc = await MockTestAttemptModel.findById(attemptId).lean(); return doc ? mapAttempt(doc) : null },
  findAttemptsByUser: async (userId, testId) => { const query: any = { userId }; if (testId) query.testId = testId; return (await MockTestAttemptModel.find(query).sort({ createdAt: -1 }).lean()).map(mapAttempt) },
  findLatestAttemptsForTests: async (userId, testIds) => {
    if (!testIds.length) return {}
    const docs = await MockTestAttemptModel.find({ userId, testId: { $in: testIds } }).sort({ createdAt: -1 }).lean()
    const result: Record<string, MockTestAttempt> = {}
    for (const doc of docs) { const mapped = mapAttempt(doc); if (!result[mapped.testId]) result[mapped.testId] = mapped }
    return result
  },
  findActiveAttempt: async (userId, testId) => { const doc = await MockTestAttemptModel.findOne({ userId, testId, status: 'in_progress' }).lean(); return doc ? mapAttempt(doc) : null },
  createAttempt: async (data) => mapAttempt((await MockTestAttemptModel.create({ ...data, status: 'in_progress', startedAt: new Date(), answeredQuestions: 0, flaggedQuestions: [] })).toObject()),
  updateAttempt: async (attemptId, data) => { const doc = await MockTestAttemptModel.findByIdAndUpdate(attemptId, data, { new: true }).lean(); return doc ? mapAttempt(doc) : null },
  incrementAnsweredCount: async (attemptId) => { await MockTestAttemptModel.findByIdAndUpdate(attemptId, { $inc: { answeredQuestions: 1 } }) },
  abandonActiveAttempts: async (userId, testId) => { await MockTestAttemptModel.updateMany({ userId, testId, status: 'in_progress' }, { status: 'abandoned' }) },

  findAnswersByAttempt: async (attemptId) => (await MockTestAnswerModel.find({ attemptId }).lean()).map(mapAnswer),
  findAnswerByQuestion: async (attemptId, questionId) => { const doc = await MockTestAnswerModel.findOne({ attemptId, questionId }).lean(); return doc ? mapAnswer(doc) : null },
  saveAnswer: async (data) => mapAnswer((await MockTestAnswerModel.create(data)).toObject()),
  updateAnswer: async (answerId, data) => { const doc = await MockTestAnswerModel.findByIdAndUpdate(answerId, data, { new: true }).lean(); return doc ? mapAnswer(doc) : null },
  flagQuestion: async (attemptId, questionId) => { await MockTestAttemptModel.findByIdAndUpdate(attemptId, { $addToSet: { flaggedQuestions: questionId } }) },
  unflagQuestion: async (attemptId, questionId) => { await MockTestAttemptModel.findByIdAndUpdate(attemptId, { $pull: { flaggedQuestions: questionId } }) },

  createAIEvaluation: async (data) => mapAIEvaluation((await MockTestAIEvaluationModel.create({ ...data, status: 'completed' })).toObject()),
  findAIEvaluationsByAttempt: async (attemptId) => (await MockTestAIEvaluationModel.find({ attemptId }).lean()).map(mapAIEvaluation),

  findReportByAttempt: async (attemptId) => { const doc = await MockTestReportModel.findOne({ attemptId }).lean(); return doc ? mapReport(doc) : null },
  createReport: async (data) => mapReport((await MockTestReportModel.create(data)).toObject()),

  getAttemptHistory: async (userId) => (await MockTestAttemptModel.find({ userId }).populate('testId').sort({ createdAt: -1 }).lean()).map((d: any) => ({ ...mapAttempt(d), test: d.testId ? mapTest(d.testId) : null })),
  getUserSummary: async (userId) => {
    const [tests, completedAgg] = await Promise.all([
      MockTestModel.find({ ownerId: userId }).select('questionCount').lean(),
      MockTestAttemptModel.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'completed' } },
        { $group: { _id: null, completedAttempts: { $sum: 1 }, averageScore: { $avg: '$scorePercentage' }, bestScore: { $max: '$scorePercentage' }, passedAttempts: { $sum: { $cond: ['$passed', 1, 0] } } } },
      ]),
    ])
    const c = completedAgg[0]
    return { totalTests: tests.length, totalQuestions: tests.reduce((sum: number, t: any) => sum + (t.questionCount || 0), 0), completedAttempts: c?.completedAttempts || 0, averageScore: Math.round(c?.averageScore || 0), bestScore: Math.round(c?.bestScore || 0), passedAttempts: c?.passedAttempts || 0 }
  },
  getPerformanceTrends: async (userId) => {
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const agg = await MockTestAttemptModel.aggregate([{ $match: { userId: new mongoose.Types.ObjectId(userId), status: 'completed', completedAt: { $gte: thirtyDaysAgo } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } }, averageScore: { $avg: '$scorePercentage' }, attempts: { $sum: 1 } } }, { $sort: { _id: 1 } }])
    return agg.map((a) => ({ date: a._id, averageScore: Math.round(a.averageScore), attempts: a.attempts }))
  },
  getTopicBreakdown: async (userId) => {
    const attempts = await MockTestAttemptModel.find({ userId, status: 'completed' }).populate('testId', 'tags').lean()
    const topicData: Record<string, { total: number; scoreSum: number }> = {}
    for (const attempt of attempts as any[]) for (const tag of attempt.testId?.tags || []) { topicData[tag] ||= { total: 0, scoreSum: 0 }; topicData[tag].total++; topicData[tag].scoreSum += attempt.scorePercentage || 0 }
    return Object.entries(topicData).map(([topic, data]) => ({ topic, averageScore: Math.round(data.scoreSum / data.total), totalAttempts: data.total })).sort((a, b) => a.averageScore - b.averageScore)
  },
  updateAnalyticsSnapshot: async (testId) => {
    const agg = await MockTestAttemptModel.aggregate([{ $match: { testId: new mongoose.Types.ObjectId(testId), status: 'completed' } }, { $group: { _id: null, totalAttempts: { $sum: 1 }, averageScore: { $avg: '$scorePercentage' }, passCount: { $sum: { $cond: ['$passed', 1, 0] } }, averageTimeTaken: { $avg: '$timeTakenSeconds' } } }])
    if (!agg.length) return
    const data = agg[0]
    await MockTestAnalyticsSnapshotModel.findOneAndUpdate({ testId }, { totalAttempts: data.totalAttempts, averageScore: Math.round(data.averageScore), passRate: Math.round((data.passCount / data.totalAttempts) * 100), averageTimeTakenSeconds: Math.round(data.averageTimeTaken || 0) }, { upsert: true, new: true })
    await MockTestModel.findByIdAndUpdate(testId, { averageScore: Math.round(data.averageScore), attemptCount: data.totalAttempts })
  },

  findCreationSession: async (sessionId) => { const doc = await MockTestCreationSessionModel.findById(sessionId).lean(); return doc ? mapSession(doc) : null },
  findActiveCreationSession: async (userId) => { const doc = await MockTestCreationSessionModel.findOne({ userId, status: 'draft' }).lean(); return doc ? mapSession(doc) : null },
  createCreationSession: async (userId) => mapSession((await MockTestCreationSessionModel.create({ userId, status: 'draft', step: 1, draftData: {} })).toObject()),
  updateCreationSession: async (sessionId, data) => { const doc = await MockTestCreationSessionModel.findByIdAndUpdate(sessionId, data, { new: true }).lean(); return doc ? mapSession(doc) : null },
  cancelCreationSession: async (sessionId) => { await MockTestCreationSessionModel.findByIdAndUpdate(sessionId, { status: 'cancelled' }) },
}
