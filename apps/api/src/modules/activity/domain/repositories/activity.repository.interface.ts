import type { ActivityCommandRepositoryContract } from './activity-command.repository.interface'
import type { ActivityQueryRepositoryContract } from './activity-query.repository.interface'

export interface ActivityRepositoryContract
  extends ActivityQueryRepositoryContract,
    ActivityCommandRepositoryContract {}
