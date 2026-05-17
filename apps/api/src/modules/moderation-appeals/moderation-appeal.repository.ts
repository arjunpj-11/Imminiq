import { User } from '../../infrastructure/database/models/user.model'
import { ModerationAppeal } from '../../infrastructure/database/models/moderation-appeal.model'

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

export const moderationAppealRepository = {
  findRestrictedUserByIdentifier: async (identifier: string) => {
    const normalized = normalizeIdentifier(identifier)

    return User.findOne({
      ...(normalized.isEmail
        ? { email: normalized.value }
        : { phone: normalized.value }),
      status: {
        $in: ['blocked', 'banned', 'paused', 'deactivated'],
      },
      deletedAt: null,
    })
  },

  findActiveAppealForUser: async (userId: string) => {
    return ModerationAppeal.findOne({
      userId,
      status: {
        $in: ['pending', 'under_review'],
      },
      deletedAt: null,
    }).sort({ createdAt: -1 })
  },

  caseIdExists: async (caseId: string) => {
    return !!(await ModerationAppeal.exists({
      caseId,
      deletedAt: null,
    }))
  },

  createAppeal: async (data: {
    userId: string
    caseId: string
    identifier: string
    appealReason: string
  }) => {
    return ModerationAppeal.create({
      userId: data.userId,
      caseId: data.caseId,
      identifier: data.identifier.trim().toLowerCase(),
      appealReason: data.appealReason.trim(),
      status: 'pending',
    })
  },
  findLatestActiveAppealForRestrictedIdentifier: async (
  identifier: string
) => {
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

  if (!appeal) {
    return null
  }

  return appeal
},
}