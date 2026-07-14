import type { RoadmapTreeEntity } from '../entities/roadmap-tree.entity';

export interface IOnboardingRoadmapRepository {
  getRoadmapTree(trackerId: string): Promise<RoadmapTreeEntity>;
}
