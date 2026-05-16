import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/axios'
import { useSettingsStore } from './useSettingsStore'
import type {
  ApiEnvelope,
  GestureSettings,
  NotificationSettings,
  PrivacySettings,
  UpdateAccountSettingsPayload,
  UpdateAIBehaviourPayload,
  UpdateAppearancePayload,
  UpdateCodeEditorPayload,
  UpdateCompilerPayload,
  UpdateEmailDigestPayload,
  UpdateGesturesPayload,
  UpdateLearningJourneyPayload,
  UpdateNotificationsPayload,
  UpdatePrivacyPayload,
  UpdateQuietHoursPayload,
  UserSettings,
} from '../../types/settings.types'

const SETTINGS_KEY = ['settings'] as const

const unwrap = <T,>(response: { data: ApiEnvelope<T> }) => {
  return response.data.data
}

const useSettingsMutation = <TPayload,>(
  request: (payload: TPayload) => Promise<UserSettings>
) => {
  const queryClient = useQueryClient()
  const setSettings = useSettingsStore((state) => state.setSettings)

  return useMutation({
    mutationFn: request,
    onSuccess: async (settings) => {
      setSettings(settings)
      await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY })
    },
  })
}

export const useSettings = () => {
  const setSettings = useSettingsStore((state) => state.setSettings)

  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: async () => {
      const response =
        await api.get<ApiEnvelope<UserSettings>>('/settings')

      const settings = unwrap(response)
      setSettings(settings)

      return settings
    },
  })
}

export const useAppearanceSettings = () =>
  useQuery({
    queryKey: ['settings', 'appearance'],
    queryFn: async () => {
      const response =
        await api.get<ApiEnvelope<UserSettings['appearance']>>(
          '/settings/appearance'
        )

      return unwrap(response)
    },
  })

export const useNotificationSettings = () =>
  useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: async () => {
      const response =
        await api.get<ApiEnvelope<NotificationSettings>>(
          '/settings/notifications'
        )

      return unwrap(response)
    },
  })

export const usePrivacySettings = () =>
  useQuery({
    queryKey: ['settings', 'privacy'],
    queryFn: async () => {
      const response =
        await api.get<ApiEnvelope<PrivacySettings>>('/settings/privacy')

      return unwrap(response)
    },
  })

export const useGestureSettings = () =>
  useQuery({
    queryKey: ['settings', 'gestures'],
    queryFn: async () => {
      const response =
        await api.get<ApiEnvelope<GestureSettings>>('/settings/gestures')

      return unwrap(response)
    },
  })

export const useUpdateAccountSettings = () =>
  useSettingsMutation<UpdateAccountSettingsPayload>(async (payload) => {
    const response = await api.patch<ApiEnvelope<UserSettings>>(
      '/settings/account',
      payload
    )

    return unwrap(response)
  })

export const useUpdateAppearance = () =>
  useSettingsMutation<UpdateAppearancePayload>(async (payload) => {
    const response = await api.patch<ApiEnvelope<UserSettings>>(
      '/settings/appearance',
      payload
    )

    return unwrap(response)
  })

export const useUpdateNotifications = () =>
  useSettingsMutation<UpdateNotificationsPayload>(async (payload) => {
    const response = await api.patch<ApiEnvelope<UserSettings>>(
      '/settings/notifications',
      payload
    )

    return unwrap(response)
  })

export const useUpdateQuietHours = () =>
  useSettingsMutation<UpdateQuietHoursPayload>(async (payload) => {
    const response = await api.patch<ApiEnvelope<UserSettings>>(
      '/settings/notifications/quiet-hours',
      payload
    )

    return unwrap(response)
  })

export const useUpdateEmailDigest = () =>
  useSettingsMutation<UpdateEmailDigestPayload>(async (payload) => {
    const response = await api.patch<ApiEnvelope<UserSettings>>(
      '/settings/notifications/email-digest',
      payload
    )

    return unwrap(response)
  })

export const useUpdatePrivacy = () =>
  useSettingsMutation<UpdatePrivacyPayload>(async (payload) => {
    const response = await api.patch<ApiEnvelope<UserSettings>>(
      '/settings/privacy',
      payload
    )

    return unwrap(response)
  })

export const useUpdateCodeEditor = () =>
  useSettingsMutation<UpdateCodeEditorPayload>(async (payload) => {
    const response = await api.patch<ApiEnvelope<UserSettings>>(
      '/settings/code-editor',
      payload
    )

    return unwrap(response)
  })

export const useUpdateCompiler = () =>
  useSettingsMutation<UpdateCompilerPayload>(async (payload) => {
    const response = await api.patch<ApiEnvelope<UserSettings>>(
      '/settings/compiler',
      payload
    )

    return unwrap(response)
  })

export const useUpdateAIBehaviour = () =>
  useSettingsMutation<UpdateAIBehaviourPayload>(async (payload) => {
    const response = await api.patch<ApiEnvelope<UserSettings>>(
      '/settings/ai-behavior',
      payload
    )

    return unwrap(response)
  })

export const useUpdateLearningJourney = () =>
  useSettingsMutation<UpdateLearningJourneyPayload>(async (payload) => {
    const response = await api.patch<ApiEnvelope<UserSettings>>(
      '/settings/learning-journey',
      payload
    )

    return unwrap(response)
  })

export const useUpdateGestures = () =>
  useSettingsMutation<UpdateGesturesPayload>(async (payload) => {
    const response = await api.patch<ApiEnvelope<UserSettings>>(
      '/settings/gestures',
      payload
    )

    return unwrap(response)
  })

export const useResetSettings = () => {
  const queryClient = useQueryClient()
  const setSettings = useSettingsStore((state) => state.setSettings)

  return useMutation({
    mutationFn: async () => {
      const response =
        await api.post<ApiEnvelope<UserSettings>>('/settings/reset')

      return unwrap(response)
    },

    onSuccess: async (settings) => {
      setSettings(settings)
      await queryClient.invalidateQueries({ queryKey: SETTINGS_KEY })
    },
  })
}