import { AdaptiveAdvisorMessageModel } from '../../../../../../infrastructure/database/models/adaptive-advisor-message.model'
import { AdaptiveAssessmentModel } from '../../../../../../infrastructure/database/models/adaptive-assessment.model'
import { AdaptiveLearningProfileModel } from '../../../../../../infrastructure/database/models/adaptive-learning-profile.model'
import { MockTestModel } from '../../../../../../infrastructure/database/models/mock-test.model'
import { MockTestReportModel } from '../../../../../../infrastructure/database/models/mock-test-report.model'
import { Tracker } from '../../../../../../infrastructure/database/models/tracker.model'
import { TrackerProgress } from '../../../../../../infrastructure/database/models/tracker-progress.model'
import { User } from '../../../../../../infrastructure/database/models/user.model'
import type { IAdaptiveLearningRepository } from '../../../domain/repositories/adaptive-learning.repository.interface'
import type {
  AdaptiveAdvisorMessage,
  AdaptiveAssessment,
  AdaptiveLearnerSnapshot,
  AdaptiveProfile,
} from '../../../domain/adaptive-learning.types'
import { calculateAdaptiveMasteryResult } from '../../../domain/services/adaptive-mastery.service'
import { MongoAdaptiveLearningMapper } from '../shared/mongo-adaptive-learning.mapper'
import type {
  MongoAdaptiveAdvisorMessageRecord,
  MongoAdaptiveId,
} from '../shared/mongo-adaptive-learning.types'

export class MongoAdaptiveLearningRepository
  implements IAdaptiveLearningRepository
{
  constructor(
    private readonly _mapper: MongoAdaptiveLearningMapper =
      new MongoAdaptiveLearningMapper(),
  ) {}

  async getLearnerSnapshot(userId: string): Promise<AdaptiveLearnerSnapshot> {
    const [user, trackers, progressRows, reports] = await Promise.all([
      User.findById(userId)
        .select('fullName xp level streakCount')
        .lean<{
          fullName: string
          xp: number
          level: number
          streakCount: number
        }>(),
      Tracker.find({ ownerId: userId, deletedAt: null })
        .select('title field goal level progressPercent')
        .sort({ updatedAt: -1 })
        .limit(20)
        .lean<
          Array<{
            _id: MongoAdaptiveId
            title: string
            field: string
            goal: string
            level: string
            progressPercent: number
          }>
        >(),
      TrackerProgress.find({ userId })
        .select('trackerId completionPercentage lastStudiedAt')
        .lean<
          Array<{
            trackerId: MongoAdaptiveId
            completionPercentage: number
            lastStudiedAt?: Date | null
          }>
        >(),
      MockTestReportModel.find({ userId })
        .sort({ createdAt: -1 })
        .limit(12)
        .lean<
          Array<{
            testId: MongoAdaptiveId
            scorePercentage: number
            weakTopics: string[]
            strongTopics: string[]
            createdAt: Date
          }>
        >(),
    ])

    if (!user) {
      throw new Error('User not found while building adaptive learner snapshot')
    }

    const testIds = reports.map((report) => report.testId)
    const tests = await MockTestModel.find({ _id: { $in: testIds } })
      .select('title')
      .lean<Array<{ _id: MongoAdaptiveId; title: string }>>()
    const testTitles = new Map(
      tests.map((test) => [test._id.toString(), test.title]),
    )
    const progressByTracker = new Map(
      progressRows.map((row) => [row.trackerId.toString(), row]),
    )
    const scoreTotal = reports.reduce(
      (total, report) => total + report.scorePercentage,
      0,
    )

    return {
      user: {
        fullName: user.fullName,
        xp: user.xp,
        xpLevel: user.level,
        streakCount: user.streakCount,
      },
      trackers: trackers.map((tracker) => {
        const progress = progressByTracker.get(tracker._id.toString())
        return {
          id: tracker._id.toString(),
          title: tracker.title,
          field: tracker.field,
          goal: tracker.goal,
          level: tracker.level,
          progressPercent:
            progress?.completionPercentage ?? tracker.progressPercent ?? 0,
          ...(progress?.lastStudiedAt
            ? { lastStudiedAt: progress.lastStudiedAt }
            : {}),
        }
      }),
      recentPerformance: reports.map((report) => ({
        testId: report.testId.toString(),
        title: testTitles.get(report.testId.toString()) ?? 'Mock test',
        scorePercentage: report.scorePercentage,
        weakTopics: report.weakTopics ?? [],
        strongTopics: report.strongTopics ?? [],
        completedAt: report.createdAt,
      })),
      averageScore:
        reports.length > 0 ? Math.round(scoreTotal / reports.length) : null,
    }
  }

  async getOrCreateProfile(userId: string): Promise<AdaptiveProfile> {
    const existing = await AdaptiveLearningProfileModel.findOne({ userId }).lean()
    if (existing) return this._mapper.toProfile(existing)

    const created = await AdaptiveLearningProfileModel.create({
      userId,
      masteryScore: 40,
      level: 'developing',
      history: [
        {
          masteryScore: 40,
          level: 'developing',
          change: 0,
          reason: 'Adaptive learning baseline created',
          recordedAt: new Date(),
        },
      ],
    })
    return this._mapper.toProfile(created.toObject())
  }

  async listAssessments(userId: string, limit = 8): Promise<AdaptiveAssessment[]> {
    const documents = await AdaptiveAssessmentModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
    return documents.map((document) => this._mapper.toAssessment(document))
  }

  async createAssessment(input: Parameters<IAdaptiveLearningRepository['createAssessment']>[0]) {
    const document = await AdaptiveAssessmentModel.create({
      userId: input.userId,
      testId: input.testId,
      trackerId: input.plan.trackerId ?? null,
      topic: input.plan.topic,
      difficulty: input.plan.difficulty,
      questionCount: input.plan.questionCount,
      predictedScore: input.plan.predictedScore,
      rationale: input.plan.rationale,
      focusAreas: input.plan.focusAreas,
      baselineMasteryScore: input.baselineMasteryScore,
    })
    return this._mapper.toAssessment(document.toObject())
  }

  async listAdvisorMessages(
    userId: string,
    limit = 20,
  ): Promise<AdaptiveAdvisorMessage[]> {
    const documents = await AdaptiveAdvisorMessageModel.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<
        MongoAdaptiveAdvisorMessageRecord[]
      >()

    return documents
      .reverse()
      .map((document) => this._mapper.toAdvisorMessage(document))
  }

  async addAdvisorMessage(
    input: Parameters<IAdaptiveLearningRepository['addAdvisorMessage']>[0],
  ): Promise<AdaptiveAdvisorMessage> {
    const document = await AdaptiveAdvisorMessageModel.create(input)
    return this._mapper.toAdvisorMessage(document.toObject())
  }

  async recordAssessmentResult(
    input: Parameters<IAdaptiveLearningRepository['recordAssessmentResult']>[0],
  ): Promise<void> {
    const assessment = await AdaptiveAssessmentModel.findOne({
      userId: input.userId,
      testId: input.testId,
      status: 'ready',
    })
    if (!assessment) return

    const profile = await AdaptiveLearningProfileModel.findOne({
      userId: input.userId,
    })
    if (!profile) return

    const masteryResult = calculateAdaptiveMasteryResult({
      currentMasteryScore: profile.masteryScore,
      predictedScore: assessment.predictedScore,
      actualScore: input.actualScore,
    })
    const { change, masteryScore: nextMasteryScore, level: nextLevel } =
      masteryResult
    const direction = change > 0 ? 'above' : change < 0 ? 'below' : 'at'
    const reason = `Scored ${Math.round(input.actualScore)}%, ${direction} the agent prediction of ${Math.round(assessment.predictedScore)}%`

    const claimed = await AdaptiveAssessmentModel.findOneAndUpdate(
      { _id: assessment._id, status: 'ready' },
      {
        $set: {
          status: 'completed',
          attemptId: input.attemptId,
          actualScore: input.actualScore,
          masteryChange: change,
          completedAt: new Date(),
        },
      },
    )
    if (!claimed) return

    await AdaptiveLearningProfileModel.updateOne(
      { _id: profile._id, 'history.attemptId': { $ne: input.attemptId } },
      {
        $set: { masteryScore: nextMasteryScore, level: nextLevel },
        $push: {
          history: {
            attemptId: input.attemptId,
            assessmentId: assessment._id,
            masteryScore: nextMasteryScore,
            level: nextLevel,
            change,
            reason,
            recordedAt: new Date(),
          },
        },
      },
    )
  }
}

export const mongoAdaptiveLearningRepository =
  new MongoAdaptiveLearningRepository()
