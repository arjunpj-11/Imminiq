export type PlanLimitKind =
  | 'tracker_capacity'
  | 'tracker_generation'
  | 'lesson_generation'
  | 'mock_test_generation'
  | 'ai_tutor_request';

export type PlanLimitContext = {
  trackerId?: string;
  subtopicId?: string;
};

export interface ISubscriptionLimitEnforcer {
  enforce(userId: string, kind: PlanLimitKind, context?: PlanLimitContext): Promise<void>;
}
