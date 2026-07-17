import type { RoadmapTreeEntity } from '../entities/roadmap-tree.entity';

export interface ITrackerCreationRoadmapRepository {
  getRoadmapTree(trackerId: string): Promise<RoadmapTreeEntity>;
}
