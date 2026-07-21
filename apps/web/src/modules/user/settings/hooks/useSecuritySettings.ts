import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { SETTINGS_API_PATHS } from '../constants/settings-tabs.constants';
import { settingsKeys } from './settings.query-keys';
import type {
  IApiEnvelope,
  IChangeEmailPayload,
  IChangePasswordPayload,
  IDeleteAccountPayload,
  IDisableTwoFactorPayload,
  IDisableTwoFactorResponse,
  ISecurityOverview,
  ITwoFactorSetupResponse,
  IVerifyTwoFactorSetupPayload,
  IVerifyTwoFactorSetupResponse,
  IDeleteAccountResponse,
} from '../types/settings.types';

type EmailChangeRequestResponse = {
  pendingEmail: string;
  verificationSent: boolean;
  expiresInMinutes: number;
};

const unwrap = <T>(response: { data: IApiEnvelope<T> }) => {
  return response.data.data;
};

// ─── SECURITY OVERVIEW ─────────────────────────────

export const useSecurityOverview = (options: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: settingsKeys.securityOverview(),
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const response = await api.get<IApiEnvelope<ISecurityOverview>>(
        SETTINGS_API_PATHS.securityOverview
      );

      return unwrap(response);
    },
    retry: false,
  });

// ─── REQUEST EMAIL CHANGE LINK ─────────────────────

export const useChangeEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IChangeEmailPayload) => {
      const response = await api.patch<IApiEnvelope<EmailChangeRequestResponse>>(
        SETTINGS_API_PATHS.changeEmail,
        payload
      );

      return unwrap(response);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.securityOverview() });
    },
  });
};

// ─── CHANGE PASSWORD ───────────────────────────────

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IChangePasswordPayload) => {
      const response = await api.patch<IApiEnvelope<{ sessionsRevoked: boolean }>>(
        SETTINGS_API_PATHS.changePassword,
        payload
      );

      return unwrap(response);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.securityOverview() });
    },
  });
};

// ─── TERMINATE SESSION ─────────────────────────────

export const useTerminateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.delete<
        IApiEnvelope<{
          revoked: boolean;
          sessionId: string;
        }>
      >(SETTINGS_API_PATHS.session(sessionId));

      return unwrap(response);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.securityOverview() });
    },
  });
};

// ─── SETUP TWO-FACTOR AUTH ─────────────────────────

export const useSetupTwoFactor = () =>
  useMutation({
    mutationFn: async () => {
      const response = await api.post<IApiEnvelope<ITwoFactorSetupResponse>>(
        SETTINGS_API_PATHS.twoFactorSetup
      );

      return unwrap(response);
    },
  });

// ─── VERIFY TWO-FACTOR SETUP ───────────────────────

export const useVerifyTwoFactorSetup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IVerifyTwoFactorSetupPayload) => {
      const response = await api.post<IApiEnvelope<IVerifyTwoFactorSetupResponse>>(
        SETTINGS_API_PATHS.twoFactorVerify,
        payload
      );

      return unwrap(response);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.securityOverview() });
    },
  });
};

// ─── DISABLE TWO-FACTOR AUTH ───────────────────────

export const useDisableTwoFactor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: IDisableTwoFactorPayload) => {
      const response = await api.post<IApiEnvelope<IDisableTwoFactorResponse>>(
        SETTINGS_API_PATHS.twoFactorDisable,
        payload
      );

      return unwrap(response);
    },

    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.securityOverview() });
    },
  });
};

// ─── DELETE ACCOUNT ────────────────────────────────

export const useDeleteAccount = () =>
  useMutation({
    mutationFn: async (payload: IDeleteAccountPayload): Promise<IDeleteAccountResponse> => {
      const response = await api.delete<IApiEnvelope<IDeleteAccountResponse>>(
        SETTINGS_API_PATHS.deleteAccount,
        {
          data: payload,
        }
      );

      return unwrap(response);
    },
  });
