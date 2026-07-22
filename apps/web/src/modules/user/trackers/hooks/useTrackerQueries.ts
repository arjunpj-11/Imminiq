import { keepPreviousData, useQuery } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import { TRACKER_API_PATHS } from '../constants/tracker-api.constants';
import type {
  IApiResponse,
  LessonAnswerAttempt,
  LessonCodeSubmission,
  LessonCodeSubmissionAction,
  LessonGeneratedQuestion,
  LessonQuestionSolution,
  LessonQuestionSolutionDoubt,
  PersistedLessonChatMessage,
  ITracker,
  ITrackerLessonResponse,
  ITrackerListQuery,
  ITrackerListResponse,
  ITrackerRoadmapResponse,
  ITrackerSummary,
  ITrackerTopicContribution,
  ITrackerClanOverview,
  ITrackerClanMessage,
  ITrackerClanChallenge,
  ITrackerClanChallengeHistory,
} from '../types/tracker.types';
import { trackerKeys } from './trackers.query-keys';

const unwrap = <T>(response: IApiResponse<T>) => response.data;

export const useTrackerSummary = () => {
  return useQuery({
    queryKey: trackerKeys.summary(),

    queryFn: async () => {
      const response = await api.get<IApiResponse<ITrackerSummary>>(TRACKER_API_PATHS.summary);

      return unwrap(response.data);
    },
  });
};

export const useTrackerDomains = (search: string) => {
  return useQuery({
    queryKey: trackerKeys.domains(search),
    queryFn: async () => {
      const response = await api.get<IApiResponse<string[]>>(TRACKER_API_PATHS.domains, {
        params: { search },
      });
      return unwrap(response.data);
    },
    staleTime: 60_000,
  });
};

export const useTrackers = (query: ITrackerListQuery = {}) => {
  return useQuery({
    queryKey: trackerKeys.list(query),

    queryFn: async () => {
      const response = await api.get<IApiResponse<ITrackerListResponse>>(TRACKER_API_PATHS.root, {
        params: query,
      });

      return unwrap(response.data);
    },

    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};

export const useTrackerDetails = (trackerId?: string) => {
  return useQuery({
    queryKey: trackerKeys.detail(trackerId || ''),
    enabled: Boolean(trackerId),

    queryFn: async () => {
      const response = await api.get<IApiResponse<ITracker>>(
        TRACKER_API_PATHS.detail(trackerId || '')
      );

      return unwrap(response.data);
    },
  });
};

export const useTrackerRoadmap = (trackerId?: string, enabled = true) => {
  return useQuery({
    queryKey: trackerKeys.roadmap(trackerId || ''),
    enabled: Boolean(trackerId) && enabled,
    refetchOnWindowFocus: true,

    queryFn: async () => {
      const response = await api.get<IApiResponse<ITrackerRoadmapResponse>>(
        TRACKER_API_PATHS.roadmap(trackerId || '')
      );

      return unwrap(response.data);
    },
  });
};

export const useTrackerTopicContributions = (trackerId?: string, enabled = true) => {
  return useQuery({
    queryKey: trackerKeys.contributions(trackerId || ''),
    enabled: Boolean(trackerId) && enabled,
    queryFn: async () => {
      const response = await api.get<IApiResponse<ITrackerTopicContribution[]>>(
        TRACKER_API_PATHS.topicContributions(trackerId || '')
      );
      return unwrap(response.data);
    },
  });
};

export const useTrackerClan = (trackerId?: string, enabled = true) =>
  useQuery({
    queryKey: trackerKeys.clan(trackerId || ''),
    enabled: Boolean(trackerId) && enabled,
    queryFn: async () => {
      const response = await api.get<IApiResponse<ITrackerClanOverview>>(
        TRACKER_API_PATHS.clan(trackerId || '')
      );
      return unwrap(response.data);
    },
  });

export const useTrackerClanMessages = (trackerId?: string, enabled = true) =>
  useQuery({
    queryKey: trackerKeys.clanMessages(trackerId || ''),
    enabled: Boolean(trackerId) && enabled,
    queryFn: async () => {
      const response = await api.get<IApiResponse<ITrackerClanMessage[]>>(
        TRACKER_API_PATHS.clanMessages(trackerId || ''),
        { params: { limit: 60 } }
      );
      return unwrap(response.data);
    },
  });

export const useTrackerClanChallenges = (trackerId?: string, enabled = true) =>
  useQuery({
    queryKey: trackerKeys.clanChallenges(trackerId || ''),
    enabled: Boolean(trackerId) && enabled,
    refetchInterval: 10_000,
    refetchOnMount: 'always',
    queryFn: async () => {
      const response = await api.get<IApiResponse<ITrackerClanChallenge[]>>(
        TRACKER_API_PATHS.clanChallenges(trackerId || '')
      );
      return unwrap(response.data);
    },
  });

export const useTrackerClanChallenge = (
  trackerId?: string,
  challengeId?: string,
  enabled = true
) =>
  useQuery({
    queryKey: trackerKeys.clanChallenge(trackerId || '', challengeId || ''),
    enabled: Boolean(trackerId && challengeId) && enabled,
    refetchInterval: 10_000,
    queryFn: async () => {
      const response = await api.get<IApiResponse<ITrackerClanChallenge>>(
        TRACKER_API_PATHS.clanChallenge(trackerId || '', challengeId || '')
      );
      return unwrap(response.data);
    },
  });

export const useTrackerClanChallengeHistory = (
  trackerId?: string,
  challengeId?: string,
  enabled = true
) =>
  useQuery({
    queryKey: trackerKeys.clanChallengeHistory(trackerId || '', challengeId || ''),
    enabled: Boolean(trackerId && challengeId) && enabled,
    queryFn: async () => {
      const response = await api.get<IApiResponse<ITrackerClanChallengeHistory>>(
        TRACKER_API_PATHS.clanChallengeHistory(trackerId || '', challengeId || '')
      );
      return unwrap(response.data);
    },
  });

export const useActiveTrackerClanChallenge = (enabled = true) =>
  useQuery({
    queryKey: trackerKeys.activeClanChallenge(),
    enabled,
    refetchInterval: 10_000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const response = await api.get<IApiResponse<ITrackerClanChallenge | null>>(
        TRACKER_API_PATHS.activeClanChallenge
      );
      return unwrap(response.data);
    },
  });

export const useTrackerLesson = (trackerId?: string, subtopicId?: string, enabled = true) => {
  return useQuery({
    queryKey: trackerKeys.lesson(trackerId || '', subtopicId || ''),
    enabled: Boolean(trackerId && subtopicId) && enabled,

    queryFn: async () => {
      const response = await api.get<IApiResponse<ITrackerLessonResponse>>(
        TRACKER_API_PATHS.lesson(trackerId || '', subtopicId || '')
      );

      return unwrap(response.data);
    },
  });
};

export const useLessonChatHistory = (trackerId?: string, subtopicId?: string) => {
  return useQuery({
    queryKey: trackerKeys.lessonChat(trackerId || '', subtopicId || ''),
    enabled: Boolean(trackerId && subtopicId),

    queryFn: async () => {
      const response = await api.get<IApiResponse<PersistedLessonChatMessage[]>>(
        TRACKER_API_PATHS.lessonChat(trackerId || '', subtopicId || '')
      );

      return unwrap(response.data);
    },
  });
};

export const useLessonAnswerAttempts = (trackerId?: string, subtopicId?: string) => {
  return useQuery({
    queryKey: trackerKeys.lessonAnswerAttempts(trackerId || '', subtopicId || ''),
    enabled: Boolean(trackerId && subtopicId),

    queryFn: async () => {
      const response = await api.get<IApiResponse<LessonAnswerAttempt[]>>(
        TRACKER_API_PATHS.lessonAnswerAttempts(trackerId || '', subtopicId || '')
      );

      return unwrap(response.data);
    },
  });
};

export const useLessonCodeSubmissions = (
  trackerId?: string,
  subtopicId?: string,
  action?: LessonCodeSubmissionAction
) => {
  return useQuery({
    queryKey: trackerKeys.lessonCodeSubmissions(trackerId || '', subtopicId || '', action),
    enabled: Boolean(trackerId && subtopicId),

    queryFn: async () => {
      const response = await api.get<IApiResponse<LessonCodeSubmission[]>>(
        TRACKER_API_PATHS.lessonCodeSubmissions(trackerId || '', subtopicId || ''),
        {
          params: action ? { action } : undefined,
        }
      );

      return unwrap(response.data);
    },
  });
};

export const useLessonGeneratedQuestions = (trackerId?: string, subtopicId?: string) => {
  return useQuery({
    queryKey: trackerKeys.lessonGeneratedQuestions(trackerId || '', subtopicId || ''),
    enabled: Boolean(trackerId && subtopicId),

    queryFn: async () => {
      const response = await api.get<IApiResponse<LessonGeneratedQuestion[]>>(
        TRACKER_API_PATHS.lessonQuestions(trackerId || '', subtopicId || '')
      );

      return unwrap(response.data);
    },
  });
};

export const useLessonQuestionSolution = (
  trackerId?: string,
  subtopicId?: string,
  question?: string
) => {
  return useQuery({
    queryKey: trackerKeys.lessonQuestionSolution(trackerId || '', subtopicId || '', question || ''),
    enabled: Boolean(trackerId && subtopicId && question),

    queryFn: async () => {
      const response = await api.get<IApiResponse<LessonQuestionSolution | null>>(
        TRACKER_API_PATHS.lessonQuestionSolution(trackerId || '', subtopicId || ''),
        {
          params: {
            question,
          },
        }
      );

      return unwrap(response.data);
    },
  });
};

export const useLessonQuestionSolutionDoubts = (
  trackerId?: string,
  subtopicId?: string,
  question?: string
) => {
  return useQuery({
    queryKey: trackerKeys.lessonQuestionSolutionDoubts(
      trackerId || '',
      subtopicId || '',
      question || ''
    ),
    enabled: Boolean(trackerId && subtopicId && question),

    queryFn: async () => {
      const response = await api.get<IApiResponse<LessonQuestionSolutionDoubt[]>>(
        TRACKER_API_PATHS.lessonQuestionSolutionDoubts(trackerId || '', subtopicId || ''),
        {
          params: {
            question,
          },
        }
      );

      return unwrap(response.data);
    },
  });
};
