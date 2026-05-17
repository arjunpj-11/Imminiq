import { User } from '../../../../infrastructure/database/models/user.model'
import { ModerationAppeal } from '../../../../infrastructure/database/models/moderation-appeal.model'

import type {
  CreateModerationAppealInput,
  ModerationAppealRepository,
} from '../../domain/repositories/moderation-appeal.repository.interface'
import type {
  RestrictedModerationAppealUser,
  ActiveModerationAppealRecord,
} from '../../domain/types/moderation-appeal.types'

const normalizePhone = (phone: string) => {
  return phone.trim().replace(/\s/g, '')
}

const normalizeIdentifier = (identifier: string) => {
  const value = identifier.trim()
  const isEmail = value.includes('@')

  return {
    value: isEmail ? value.toLowerCase() : normalizePhone(value),
    isEmail,
  }
}

export const mongoModerationAppealRepository: ModerationAppealRepository = {
  findRestrictedUserByIdentifier: async (
    identifier: string
  ): Promise<RestrictedModerationAppealUser | null> => {
    const normalized = normalizeIdentifier(identifier)

    const user = await User.findOne({
      ...(normalized.isEmail
        ? { email: normalized.value }
        : { phone: normalized.value }),
      status: {
        $in: ['blocked', 'banned', 'paused', 'deactivated'],
      },
      deletedAt: null,
    })

    return user
  },

  findActiveAppealForUser: async (
    userId: string
  ): Promise<ActiveModerationAppealRecord | null> => {
    const appeal = await ModerationAppeal.findOne({
      userId,
      status: {
        $in: ['pending', 'under_review'],
      },
      deletedAt: null,
    }).sort({ createdAt: -1 })

    return appeal
  },

  caseIdExists: async (caseId: string): Promise<boolean> => {
    return !!(await ModerationAppeal.exists({
      caseId,
      deletedAt: null,
    }))
  },

  createAppeal: async (
    data: CreateModerationAppealInput
  ): Promise<ActiveModerationAppealRecord> => {
    const appeal = await ModerationAppeal.create({
      userId: data.userId,
      caseId: data.caseId,
      identifier: data.identifier.trim().toLowerCase(),
      appealReason: data.appealReason.trim(),
      status: 'pending',
    })

    return appeal
  },

  findLatestActiveAppealForRestrictedIdentifier: async (
    identifier: string
  ): Promise<ActiveModerationAppealRecord | null> => {
    const normalized = normalizeIdentifier(identifier)

    const user = await User.findOne({
      ...(normalized.isEmail
        ? { email: normalized.value }
        : { phone: normalized.value }),
      status: {
        $in: ['blocked', 'banned', 'paused', 'deactivated'],
      },
      deletedAt: null,
    })

    if (!user) {
      return null
    }

    const appeal = await ModerationAppeal.findOne({
      userId: user._id,
      status: {
        $in: ['pending', 'under_review'],
      },
      deletedAt: null,
    }).sort({ createdAt: -1 })

    return appeal
  },
}
