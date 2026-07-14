import { useMutation } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import { TRACKER_API_PATHS } from '../constants/tracker-api.constants';

type ExistingTopic = {
  id: string;
  title: string;
  description?: string;
};

type ExistingSubtopic = {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
};

export type VerifyTrackerTopicPayload = {
  trackerId: string;
  trackerTitle: string;
  topicTitle: string;
  topicDescription?: string;
  existingTopics?: ExistingTopic[];
};

export type VerifyTrackerSubtopicPayload = {
  trackerId: string;
  trackerTitle: string;
  topicId: string;
  topicTitle: string;
  topicDescription?: string;
  subtopicTitle: string;
  subtopicDescription?: string;
  difficulty?: string;
  existingSubtopics?: ExistingSubtopic[];
};

export type TrackerAiVerificationResult = {
  verified: boolean;
  message: string;
  polishedTitle: string;
  polishedDescription: string;
};

type ApiVerificationResponse = {
  success?: boolean;
  message?: string;
  data?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object' && !Array.isArray(value));

const getBoolean = (source: Record<string, unknown>, keys: string[]): boolean =>
  keys.some((key) => source[key] === true);

const getString = (source: Record<string, unknown>, keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
};

const normalizeVerificationResponse = (
  payload: ApiVerificationResponse
): TrackerAiVerificationResult => {
  // Unwrap ApiResponse wrapper: { success, message, data: <actual AI result> }
  const source = isRecord(payload.data) ? payload.data : payload;

  const verified = getBoolean(source, [
    'verified',
    'isVerified',
    'valid',
    'isValid',
    'allowed',
    'canAdd',
  ]);

  const message =
    getString(source, ['message', 'reason']) ||
    payload.message ||
    (verified
      ? 'AI verified this item. You can add it now.'
      : 'AI rejected this item because it does not belong here.');

  const polishedTitle = getString(source, ['polishedTitle', 'title']) || '';

  const polishedDescription = getString(source, ['polishedDescription', 'description']) || '';

  return {
    verified,
    message,
    polishedTitle,
    polishedDescription,
  };
};

export const useVerifyTrackerTopic = () => {
  return useMutation({
    mutationFn: async (
      payload: VerifyTrackerTopicPayload
    ): Promise<TrackerAiVerificationResult> => {
      const { trackerId, ...body } = payload;

      const response = await api.post<ApiVerificationResponse>(
        TRACKER_API_PATHS.verifyTopics(trackerId),
        body
      );

      // response.data = axios layer ({ success, message, data: {...} })
      // response.data.data = actual AI result ({ verified, message, polishedTitle, ... })
      return normalizeVerificationResponse(response.data);
    },
  });
};

export const useVerifyTrackerSubtopic = () => {
  return useMutation({
    mutationFn: async (
      payload: VerifyTrackerSubtopicPayload
    ): Promise<TrackerAiVerificationResult> => {
      const { trackerId, topicId, ...body } = payload;

      const response = await api.post<ApiVerificationResponse>(
        TRACKER_API_PATHS.verifySubtopics(trackerId, topicId),
        body
      );

      // response.data = axios layer ({ success, message, data: {...} })
      // response.data.data = actual AI result ({ verified, message, polishedTitle, ... })
      return normalizeVerificationResponse(response.data);
    },
  });
};
