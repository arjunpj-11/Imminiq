import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import type {
  IApiEnvelope,
  IGestureSettings,
  INotificationSettings,
  IPrivacySettings,
  IUpdateAccountSettingsPayload,
  IUpdateAIBehaviourPayload,
  IUpdateAppearancePayload,
  IUpdateCodeEditorPayload,
  IUpdateCompilerPayload,
  IUpdateEmailDigestPayload,
  IUpdateGesturesPayload,
  IUpdateLearningJourneyPayload,
  IUpdateNotificationsPayload,
  IUpdatePrivacyPayload,
  IUpdateQuietHoursPayload,
  IUserSettings,
} from '../types/settings.types';

const SETTINGS_KEY = ['settings'] as const;

const unwrap = <T>(response: { data: IApiEnvelope<T> }) => {
  return response.data.data;
};

const useSettingsMutation = <TPayload>(request: (payload: TPayload) => Promise<IUserSettings>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: async (settings) => {
      queryClient.setQueryData(SETTINGS_KEY, settings);
      await queryClient.invalidateQueries({
        queryKey: SETTINGS_KEY,
        exact: false,
        refetchType: 'active',
      });
    },
  });
};

export const useSettings = () => {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: async () => {
      const response = await api.get<IApiEnvelope<IUserSettings>>('/settings');

      return unwrap(response);
    },
  });
};

export const useAppearanceSettings = () =>
  useQuery({
    queryKey: ['settings', 'appearance'],
    queryFn: async () => {
      const response =
        await api.get<IApiEnvelope<IUserSettings['appearance']>>('/settings/appearance');

      return unwrap(response);
    },
  });

export const useNotificationSettings = () =>
  useQuery({
    queryKey: ['settings', 'notifications'],
    queryFn: async () => {
      const response =
        await api.get<IApiEnvelope<INotificationSettings>>('/settings/notifications');

      return unwrap(response);
    },
  });

export const usePrivacySettings = () =>
  useQuery({
    queryKey: ['settings', 'privacy'],
    queryFn: async () => {
      const response = await api.get<IApiEnvelope<IPrivacySettings>>('/settings/privacy');

      return unwrap(response);
    },
  });

export const useGestureSettings = () =>
  useQuery({
    queryKey: ['settings', 'gestures'],
    queryFn: async () => {
      const response = await api.get<IApiEnvelope<IGestureSettings>>('/settings/gestures');

      return unwrap(response);
    },
  });

export const useUpdateAccountSettings = () =>
  useSettingsMutation<IUpdateAccountSettingsPayload>(async (payload) => {
    const response = await api.patch<IApiEnvelope<IUserSettings>>('/settings/account', payload);

    return unwrap(response);
  });

export const useUpdateAppearance = () =>
  useSettingsMutation<IUpdateAppearancePayload>(async (payload) => {
    const response = await api.patch<IApiEnvelope<IUserSettings>>('/settings/appearance', payload);

    return unwrap(response);
  });

export const useUpdateNotifications = () =>
  useSettingsMutation<IUpdateNotificationsPayload>(async (payload) => {
    const response = await api.patch<IApiEnvelope<IUserSettings>>(
      '/settings/notifications',
      payload
    );

    return unwrap(response);
  });

export const useUpdateQuietHours = () =>
  useSettingsMutation<IUpdateQuietHoursPayload>(async (payload) => {
    const response = await api.patch<IApiEnvelope<IUserSettings>>(
      '/settings/notifications/quiet-hours',
      payload
    );

    return unwrap(response);
  });

export const useUpdateEmailDigest = () =>
  useSettingsMutation<IUpdateEmailDigestPayload>(async (payload) => {
    const response = await api.patch<IApiEnvelope<IUserSettings>>(
      '/settings/notifications/email-digest',
      payload
    );

    return unwrap(response);
  });

export const useUpdatePrivacy = () =>
  useSettingsMutation<IUpdatePrivacyPayload>(async (payload) => {
    const response = await api.patch<IApiEnvelope<IUserSettings>>('/settings/privacy', payload);

    return unwrap(response);
  });

export const useUpdateCodeEditor = () =>
  useSettingsMutation<IUpdateCodeEditorPayload>(async (payload) => {
    const response = await api.patch<IApiEnvelope<IUserSettings>>('/settings/code-editor', payload);

    return unwrap(response);
  });

export const useUpdateCompiler = () =>
  useSettingsMutation<IUpdateCompilerPayload>(async (payload) => {
    const response = await api.patch<IApiEnvelope<IUserSettings>>('/settings/compiler', payload);

    return unwrap(response);
  });

export const useUpdateAIBehaviour = () =>
  useSettingsMutation<IUpdateAIBehaviourPayload>(async (payload) => {
    const response = await api.patch<IApiEnvelope<IUserSettings>>('/settings/ai-behavior', payload);

    return unwrap(response);
  });

export const useUpdateLearningJourney = () =>
  useSettingsMutation<IUpdateLearningJourneyPayload>(async (payload) => {
    const response = await api.patch<IApiEnvelope<IUserSettings>>(
      '/settings/learning-journey',
      payload
    );

    return unwrap(response);
  });

export const useUpdateGestures = () =>
  useSettingsMutation<IUpdateGesturesPayload>(async (payload) => {
    const response = await api.patch<IApiEnvelope<IUserSettings>>('/settings/gestures', payload);

    return unwrap(response);
  });

export const useResetSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<IApiEnvelope<IUserSettings>>('/settings/reset');

      return unwrap(response);
    },

    onSuccess: async (settings) => {
      queryClient.setQueryData(SETTINGS_KEY, settings);
      await queryClient.invalidateQueries({
        queryKey: SETTINGS_KEY,
        exact: false,
        refetchType: 'active',
      });
    },
  });
};
