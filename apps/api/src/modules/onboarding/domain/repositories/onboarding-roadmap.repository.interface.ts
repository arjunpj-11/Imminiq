import type { RoadmapTreeEntity } from '../entities/roadmap-tree.entity'

export interface OnboardingRoadmapRepositoryContract {
  getRoadmapTree(trackerId: string): Promise<RoadmapTreeEntity>
}