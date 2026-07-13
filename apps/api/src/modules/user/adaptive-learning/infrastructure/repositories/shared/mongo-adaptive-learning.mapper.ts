import type {
  AdaptiveAdvisorMessage,
  AdaptiveAssessment,
  AdaptiveProfile,
} from '../../../domain/adaptive-learning.types'
import type {
  MongoAdaptiveAdvisorMessageRecord,
  MongoAdaptiveAssessmentRecord,
  MongoAdaptiveProfileRecord,
} from './mongo-adaptive-learning.types'

export class MongoAdaptiveLearningMapper {
  toProfile(document: MongoAdaptiveProfileRecord): AdaptiveProfile {
    return {
      masteryScore: document.masteryScore,
      level: document.level,
      history: (document.history ?? []).map((item) => ({
        id: item._id.toString(),
        masteryScore: item.masteryScore,
        level: item.level,
        change: item.change,
        reason: item.reason,
        recordedAt: item.recordedAt,
      })),
    }
  }

  toAssessment(document: MongoAdaptiveAssessmentRecord): AdaptiveAssessment {
    return {
      id: document._id.toString(),
      testId: document.testId.toString(),
      ...(document.trackerId
        ? { trackerId: document.trackerId.toString() }
        : {}),
      topic: document.topic,
      difficulty: document.difficulty,
      questionCount: document.questionCount,
      predictedScore: document.predictedScore,
      rationale: document.rationale,
      focusAreas: document.focusAreas ?? [],
      baselineMasteryScore: document.baselineMasteryScore,
      status: document.status,
      ...(document.actualScore != null
        ? { actualScore: document.actualScore }
        : {}),
      ...(document.masteryChange != null
        ? { masteryChange: document.masteryChange }
        : {}),
      createdAt: document.createdAt,
      ...(document.completedAt ? { completedAt: document.completedAt } : {}),
    }
  }

  toAdvisorMessage(
    document: MongoAdaptiveAdvisorMessageRecord,
  ): AdaptiveAdvisorMessage {
    return {
      id: document._id.toString(),
      role: document.role,
      content: document.content,
      createdAt: document.createdAt,
    }
  }
}
