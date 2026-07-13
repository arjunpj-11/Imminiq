import type { IModerationAppealCommandRepository } from './moderation-appeal-command.repository.interface'
import type { IModerationAppealQueryRepository } from './moderation-appeal-query.repository.interface'

export interface IModerationAppealRepository
  extends IModerationAppealQueryRepository,
    IModerationAppealCommandRepository {}

export type { CreateModerationAppealInput } from './moderation-appeal-command.repository.interface'