import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/axios'
import type {
  ApiEnvelope,
  ChangeEmailPayload,
  ChangePasswordPayload,
  DeleteAccountPayload,
  DisableTwoFactorPayload,
  DisableTwoFactorResponse,
  SecurityOverview,
  TwoFactorSetupResponse,
  VerifyTwoFactorSetupPayload,
  VerifyTwoFactorSetupResponse,
} from '../../types/settings.types'

const SECURITY_KEY = ['security', 'overview'] as const

type EmailChangeRequestResponse = {
  pendingEmail: string
  verificationSent: boolean
  expiresInMinutes: number
}

type VerifyEmailChangeResponse = {
  email: string
  emailVerified: boolean
  verified: boolean
  sessionsRevoked: boolean
}

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => {
  return response.data.data
}

// ─── SECURITY OVERVIEW ─────────────────────────────

export const useSecurityOverview = () =>
  useQuery({
    queryKey: SECURITY_KEY,
    queryFn: async () => {
      const response =
        await api.get<ApiEnvelope<SecurityOverview>>('/security/overview')

      return unwrap(response)
    },
    retry: false,
  })

// ─── REQUEST EMAIL CHANGE LINK ─────────────────────

export const useChangeEmail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ChangeEmailPayload) => {
      const response = await api.patch<
        ApiEnvelope<EmailChangeRequestResponse>
      >('/security/change-email', payload)

      return unwrap(response)
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SECURITY_KEY })
    },
  })
}

// ─── VERIFY EMAIL CHANGE TOKEN ─────────────────────

export const useVerifyEmailChange = () =>
  useMutation({
    mutationFn: async (token: string) => {
      const response = await api.post<
        ApiEnvelope<VerifyEmailChangeResponse>
      >('/security/verify-email-change', {
        token,
      })

      return unwrap(response)
    },
  })

// ─── CHANGE PASSWORD ───────────────────────────────

export const useChangePassword = () =>
  useMutation({
    mutationFn: async (payload: ChangePasswordPayload) => {
      const response = await api.patch<
        ApiEnvelope<{ sessionsRevoked: boolean }>
      >('/security/change-password', payload)

      return unwrap(response)
    },
  })

// ─── TERMINATE SESSION ─────────────────────────────

export const useTerminateSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.delete<
        ApiEnvelope<{
          revoked: boolean
          sessionId: string
        }>
      >(`/security/sessions/${sessionId}`)

      return unwrap(response)
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SECURITY_KEY })
    },
  })
}

// ─── SETUP TWO-FACTOR AUTH ─────────────────────────

export const useSetupTwoFactor = () =>
  useMutation({
    mutationFn: async () => {
      const response = await api.post<
        ApiEnvelope<TwoFactorSetupResponse>
      >('/security/2fa/setup')

      return unwrap(response)
    },
  })

// ─── VERIFY TWO-FACTOR SETUP ───────────────────────

export const useVerifyTwoFactorSetup = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: VerifyTwoFactorSetupPayload) => {
      const response = await api.post<
        ApiEnvelope<VerifyTwoFactorSetupResponse>
      >('/security/2fa/verify', payload)

      return unwrap(response)
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SECURITY_KEY })
    },
  })
}

// ─── DISABLE TWO-FACTOR AUTH ───────────────────────

export const useDisableTwoFactor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: DisableTwoFactorPayload) => {
      const response = await api.post<
        ApiEnvelope<DisableTwoFactorResponse>
      >('/security/2fa/disable', payload)

      return unwrap(response)
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: SECURITY_KEY })
    },
  })
}

// ─── DELETE ACCOUNT ────────────────────────────────

export const useDeleteAccount = () =>
  useMutation({
    mutationFn: async (payload: DeleteAccountPayload) => {
      const response = await api.delete<
        ApiEnvelope<{
          deleted: boolean
        }>
      >('/security/delete-account', {
        data: payload,
      })

      return unwrap(response)
    },
  })
