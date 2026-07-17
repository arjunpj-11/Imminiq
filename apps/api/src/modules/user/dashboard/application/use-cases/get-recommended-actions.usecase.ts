import { DashboardRecommendedActionEntity } from '../../domain/entities/dashboard-recommended-action.entity';
import type { IDashboardRecommendationRepository } from '../../domain/repositories/dashboard-recommendation.repository.interface';
import { DASHBOARD_MAX_RECOMMENDED_ACTIONS } from '../dashboard.constants';
import type { DashboardRecommendedActionDTO } from '../dashboard.dto';
import type { IDashboardMapper } from '../dashboard.mapper';

export interface IGetRecommendedActionsUseCase {
  execute(userId: string): Promise<DashboardRecommendedActionDTO[]>;
}

export class GetRecommendedActionsUseCase implements IGetRecommendedActionsUseCase {
  constructor(
    private readonly _dashboardRepository: IDashboardRecommendationRepository,
    private readonly _dashboardMapper: IDashboardMapper
  ) {}

  async execute(userId: string): Promise<DashboardRecommendedActionDTO[]> {
    const context = await this._dashboardRepository.getRecommendationContext(userId);
    const actions: DashboardRecommendedActionEntity[] = [];

    if (context.latestIncompleteTracker) {
      const tracker = context.latestIncompleteTracker;

      actions.push(
        new DashboardRecommendedActionEntity({
          type: 'continue_tracker',
          title: `Continue "${tracker.title}"`,
          description: `You are ${Math.round(tracker.completionPercentage)}% through`,
          link: `/trackers/${tracker.id}/roadmap`,
        })
      );
    }

    if (context.totalTrackers === 0) {
      actions.push(
        new DashboardRecommendedActionEntity({
          type: 'create_tracker',
          title: 'Create your first tracker',
          description: 'Use AI to build a personalized learning roadmap',
          link: '/trackers/create',
        })
      );
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
    );

    return actions
      .slice(0, DASHBOARD_MAX_RECOMMENDED_ACTIONS)
      .map((action) => this._dashboardMapper.toRecommendedAction(action));
  }
}
