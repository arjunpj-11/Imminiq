import type {
  AuthUser,
  OAuthFormattedUserSource,
} from '../../domain/types/auth.types'

export const formatAuthUser = (
  user: OAuthFormattedUserSource
): AuthUser => ({
  _id: user._id.toString(),
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  phone: user.phone,
  role: user.role,
  status: user.status,
  emailVerified: user.emailVerified,
  phoneVerified: user.phoneVerified,
  isPremium: user.isPremium,
  avatarUrl: user.avatarUrl,
  onboardingCompleted: user.onboardingCompleted,
})
