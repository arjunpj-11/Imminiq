import type { ModerationAppealCommandRepositoryContract } from './moderation-appeal-command.repository.interface'
import type { ModerationAppealQueryRepositoryContract } from './moderation-appeal-query.repository.interface'

export interface ModerationAppealRepositoryContract
  extends ModerationAppealQueryRepositoryContract,
    ModerationAppealCommandRepositoryContract {}

export type { CreateModerationAppealInput } from './moderation-appeal-command.repository.interface'
