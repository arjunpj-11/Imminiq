import { DashboardRecommendedActionEntity } from '../../domain/entities/dashboard-recommended-action.entity'
import type { DashboardRecommendationRepositoryContract } from '../../domain/repositories/dashboard-recommendation.repository.interface'
import { DASHBOARD_MAX_RECOMMENDED_ACTIONS } from '../constants/dashboard.constants'
import type { DashboardRecommendedAction } from '../dtos/dashboard.dto'
import type { DashboardMapperContract } from '../mappers/dashboard.mapper'

export class GetRecommendedActionsUseCase {
  constructor(
    private readonly _dashboardRepository: DashboardRecommendationRepositoryContract,
    private readonly _dashboardMapper: DashboardMapperContract
  ) {}

  async execute(userId: string): Promise<DashboardRecommendedAction[]> {
    const context = await this._dashboardRepository.getRecommendationContext(userId)
    const actions: DashboardRecommendedActionEntity[] = []

    if (context.latestIncompleteTracker) {
      const tracker = context.latestIncompleteTracker

      actions.push(
        new DashboardRecommendedActionEntity({
          type: 'continue_tracker',
          title: `Continue "${tracker.title}"`,
          description: `You are ${Math.round(tracker.completionPercentage)}% through`,
          link: `/trackers/${tracker.id}/roadmap`,
        })
      )
    }

    if (context.totalTrackers === 0) {
      actions.push(
        new DashboardRecommendedActionEntity({
          type: 'create_tracker',
          title: 'Create your first tracker',
          description: 'Use AI to build a personalized learning roadmap',
          link: '/onboarding/step-1',
        })
      )
    }

    actions.push(
      new DashboardRecommendedActionEntity({
        type: 'explore_community',
        title: 'Explore Community',
        description: 'Discover trackers shared by other learners',
        link: '/community',
      }),
      new DashboardRecommendedActionEntity({
        type: 'start_mock_test',
        title: 'Take a Mock Test',
        description: 'Evaluate your knowledge with AI-generated questions',
        link: '/mock-tests',
      })
    )

    return actions
      .slice(0, DASHBOARD_MAX_RECOMMENDED_ACTIONS)
      .map((action) => this._dashboardMapper.toRecommendedAction(action))
  }
}
