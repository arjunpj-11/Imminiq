import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import {
  Strategy as GitHubStrategy,
  Profile as GitHubProfile,
} from 'passport-github2'
import type { VerifyCallback } from 'passport-oauth2'
import { env } from '../../config/env'
import { authRepository } from '../../modules/auth/auth.repository'

const normalizeUsernameBase = (value: string) => {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 20) || `user${Date.now()}`
  )
}

const generateUniqueUsername = async (baseValue: string) => {
  const base = normalizeUsernameBase(baseValue)

  let username = base
  let counter = 1

  while (await authRepository.usernameExists(username)) {
    username = `${base}${counter}`
    counter++
  }

  return username
}

export const initPassport = () => {
  console.log('OAuth config:', {
  serverUrl: env.SERVER_URL,
  githubClientId: Boolean(env.GITHUB_CLIENT_ID),
  githubClientSecret: Boolean(env.GITHUB_CLIENT_SECRET),
  githubCallbackURL: `${env.SERVER_URL}/api/auth/oauth/github/callback`,
})
  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${env.SERVER_URL}/api/auth/oauth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase()
          const avatarUrl = profile.photos?.[0]?.value
          const fullName = profile.displayName || 'Google User'

          if (!email) {
            return done(null, false, {
              message: 'Google account does not provide an email address',
            })
          }

          let user = await authRepository.findByEmail(email)

          if (!user) {
            const username = await generateUniqueUsername(
              profile.displayName || email.split('@')[0]
            )

            user = await authRepository.createOAuthUser({
              fullName,
              email,
              username,
              avatarUrl,
              provider: 'google',
              providerId: profile.id,
            })
          }

          return done(null, user as unknown as Express.User)
        } catch (error) {
          return done(error)
        }
      }
    )
  )

  passport.use(
    'github',
    new GitHubStrategy(
      {
        clientID: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL: `${env.SERVER_URL}/api/auth/oauth/github/callback`,
        scope: ['user:email'],
      },
      async (
  _accessToken: string,
  _refreshToken: string,
  profile: GitHubProfile,
  done: VerifyCallback
) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase()
          const avatarUrl = profile.photos?.[0]?.value
          const fullName =
            profile.displayName || profile.username || 'GitHub User'

          if (!email) {
            return done(null, false, {
              message: 'GitHub account does not provide an email address',
            })
          }

          let user = await authRepository.findByEmail(email)

          if (!user) {
            const username = await generateUniqueUsername(
              profile.username || profile.displayName || email.split('@')[0]
            )

            user = await authRepository.createOAuthUser({
              fullName,
              email,
              username,
              avatarUrl,
              provider: 'github',
              providerId: profile.id,
            })
          }

         return done(null, user as unknown as Express.User)
        } catch (error) {
          return done(error)
        }
      }
    )
  )
}

export default passport