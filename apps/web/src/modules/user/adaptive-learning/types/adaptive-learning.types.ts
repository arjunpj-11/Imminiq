export type AdaptiveMasteryLevel =
  | 'foundation'
  | 'developing'
  | 'proficient'
  | 'advanced'

export interface IAdaptiveHistoryEntry {
  id: string
  masteryScore: number
  level: AdaptiveMasteryLevel
  change: number
  reason: string
  recordedAt: string
}

export interface IAdaptiveAssessment {
  id: string
  testId: string
  trackerId?: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  questionCount: number
  predictedScore: number
  rationale: string
  focusAreas: string[]
  baselineMasteryScore: number
  status: 'ready' | 'completed'
  actualScore?: number
  masteryChange?: number
  createdAt: string
  completedAt?: string
}

export interface IAdaptiveAdvisorMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export type IAdaptiveAdvisorAction =
  | {
      type: 'create_tracker'
      label: string
      topic: string
      goal: string
      level: 'beginner' | 'intermediate' | 'advanced'
    }
  | {
      type: 'create_mock_test'
      label: string
      topic: string
      difficulty: 'easy' | 'medium' | 'hard'
      questionCount: number
      trackerId?: string
    }

export interface IAdaptiveDashboard {
  profile: {
    masteryScore: number
    level: AdaptiveMasteryLevel
    history: IAdaptiveHistoryEntry[]
  }
  latestAssessment: IAdaptiveAssessment | null
  assessments: IAdaptiveAssessment[]
  messages: IAdaptiveAdvisorMessage[]
  suggestions: string[]
  learnerSummary: {
    trackerCount: number
    recentTestCount: number
    averageScore: number | null
    streakCount: number
  }
}

export interface IAdaptiveApiResponse<T> {
  success: boolean
  message: string
  data: T
}
