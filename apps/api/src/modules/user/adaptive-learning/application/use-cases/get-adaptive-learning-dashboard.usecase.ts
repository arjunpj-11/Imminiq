import type { IAdaptiveLearningRepository } from '../../domain/repositories/adaptive-learning.repository.interface';
import type { AdaptiveLearningDashboardDTO } from '../adaptive-learning.dto';
import type { IAdaptiveLearningMapper } from '../adaptive-learning.mapper';

export interface IGetAdaptiveLearningDashboardUseCase {
  execute(userId: string): Promise<AdaptiveLearningDashboardDTO>;
}

export class GetAdaptiveLearningDashboardUseCase implements IGetAdaptiveLearningDashboardUseCase {
  constructor(
    private readonly _repository: IAdaptiveLearningRepository,
    private readonly _mapper: IAdaptiveLearningMapper
  ) {}

  async execute(userId: string): Promise<AdaptiveLearningDashboardDTO> {
    const [snapshot, profile, assessments, messages] = await Promise.all([
      this._repository.getLearnerSnapshot(userId),
      this._repository.getOrCreateProfile(userId),
      this._repository.listAssessments(userId, 8),
      this._repository.listAdvisorMessages(userId, 20),
    ]);

    const latestAssessment = assessments[0];
    const weakTopics = snapshot.recentPerformance
      .flatMap((item) => item.weakTopics)
      .filter((topic, index, all) => all.indexOf(topic) === index)
      .slice(0, 3);
    const suggestions = [
      ...(latestAssessment?.focusAreas ?? weakTopics).map(
        (topic) => `Review ${topic} before your next assessment.`
      ),
      ...snapshot.trackers
        .filter((tracker) => tracker.progressPercent > 0 && tracker.progressPercent < 100)
        .slice(0, 2)
        .map(
          (tracker) =>
            `Continue ${tracker.title} — ${Math.round(tracker.progressPercent)}% complete.`
        ),
    ].slice(0, 4);

    return this._mapper.toDashboard({
      profile,
      latestAssessment: latestAssessment ?? null,
      assessments,
      messages,
      suggestions:
        suggestions.length > 0
          ? suggestions
          : ['Complete a tracker lesson or mock test to unlock tailored guidance.'],
      learnerSummary: {
        trackerCount: snapshot.trackers.length,
        recentTestCount: snapshot.recentPerformance.length,
        averageScore: snapshot.averageScore,
        streakCount: snapshot.user.streakCount,
      },
    });
  }
}
