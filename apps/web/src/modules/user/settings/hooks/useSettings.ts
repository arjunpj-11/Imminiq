import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { SETTINGS_API_PATHS } from '../constants/settings-tabs.constants';
import { settingsKeys } from './settings.query-keys';
import type {
  IApiEnvelope,
  INotificationSettings,
  IPrivacySettings,
  IUpdateAppearancePayload,
  IUpdateNotificationsPayload,
  IUpdatePrivacyPayload,
  IUserSettings,
  DataPrivacyRequest,
} from '../types/settings.types';

const unwrap = <T>(response: { data: IApiEnvelope<T> }) => {
  return response.data.data;
};

const useSettingsMutation = <TPayload>(request: (payload: TPayload) => Promise<IUserSettings>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: request,
    onSuccess: async (settings) => {
      queryClient.setQueryData(settingsKeys.all, settings);
      await queryClient.invalidateQueries({
        queryKey: settingsKeys.all,
        exact: false,
        refetchType: 'active',
      });
    },
  });
};

export const useSettings = () => {
  return useQuery({
    queryKey: settingsKeys.all,
    queryFn: async () => {
      const response = await api.get<IApiEnvelope<IUserSettings>>(SETTINGS_API_PATHS.root);

      return unwrap(response);
    },
  });
};

export const useAppearanceSettings = () =>
  useQuery({
    queryKey: settingsKeys.appearance(),
    queryFn: async () => {
      const response = await api.get<IApiEnvelope<IUserSettings['appearance']>>(
        SETTINGS_API_PATHS.appearance
      );

      return unwrap(response);
    },
  });

export const useNotificationSettings = () =>
  useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn: async () => {
      const response = await api.get<IApiEnvelope<INotificationSettings>>(
        SETTINGS_API_PATHS.notifications
      );

      return unwrap(response);
    },
  });

export const usePrivacySettings = () =>
  useQuery({
    queryKey: settingsKeys.privacy(),
    queryFn: async () => {
      const response = await api.get<IApiEnvelope<IPrivacySettings>>(SETTINGS_API_PATHS.privacy);

      return unwrap(response);
    },
  });

export const useDataPrivacyRequests = () =>
  useQuery({
    queryKey: settingsKeys.privacyRequests(),
    queryFn: async () => unwrap((await api.get<IApiEnvelope<DataPrivacyRequest[]>>(SETTINGS_API_PATHS.privacyRequests))),
  });

export const useSubmitDataPrivacyRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { type: DataPrivacyRequest['type']; details: string }) =>
      unwrap(await api.post<IApiEnvelope<DataPrivacyRequest>>(SETTINGS_API_PATHS.privacyRequests, payload)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.privacyRequests() }),
  });
};

export const useCancelDataPrivacyRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestId: string) =>
      unwrap(await api.delete<IApiEnvelope<DataPrivacyRequest>>(SETTINGS_API_PATHS.privacyRequest(requestId))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: settingsKeys.privacyRequests() }),
  });
};

export const useUpdateAppearance = () =>
  useSettingsMutation<IUpdateAppearancePayload>(async (payload) => {
    const response = await api.patch<IApiEnvelope<IUserSettings>>(
      SETTINGS_API_PATHS.appearance,
      payload
    );

    return unwrap(response);
  });

export const useUpdateNotifications = () =>
  useSettingsMutation<IUpdateNotificationsPayload>(async (payload) => {
    const response = await api.patch<IApiEnvelope<IUserSettings>>(
      SETTINGS_API_PATHS.notifications,
      payload
    );

    return unwrap(response);
  });

export const useUpdatePrivacy = () =>
  useSettingsMutation<IUpdatePrivacyPayload>(async (payload) => {
    const response = await api.patch<IApiEnvelope<IUserSettings>>(
      SETTINGS_API_PATHS.privacy,
      payload
    );

    return unwrap(response);
  });

export const useResetSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await api.post<IApiEnvelope<IUserSettings>>(SETTINGS_API_PATHS.reset);

      return unwrap(response);
    },

    onSuccess: async (settings) => {
      queryClient.setQueryData(settingsKeys.all, settings);
      await queryClient.invalidateQueries({
        queryKey: settingsKeys.all,
        exact: false,
        refetchType: 'active',
      });
    },
  });
};
