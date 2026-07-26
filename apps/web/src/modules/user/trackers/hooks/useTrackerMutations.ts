import { useMutation, useQueryClient } from '@tanstack/react-query';

import api from '../../../../lib/axios';
import { TRACKER_API_PATHS } from '../constants/tracker-api.constants';
import { communityKeys } from '../../community';
import { dashboardKeys } from '../../dashboard';
import { activityQueryKeys } from '../../activity';
import { activityQueryKeys as profileActivityKeys } from '../../../../hooks/activity/activity.query-keys';
import type {
  IApiResponse,
  ICreateSubtopicPayload,
  ICreateTopicPayload,
  ICreateTrackerPayload,
  PublishTrackerPayload,
  ITracker,
  ITrackerTopicContribution,
  IUpdateSubtopicProgressPayload,
  IUpdateTrackerPayload,
  ITrackerClanOverview,
  ITrackerClanChallenge,
  ITrackerCloneSyncResult,
  ITrackerListResponse,
} from '../types/tracker.types';
import { trackerKeys } from './trackers.query-keys';
import { syncTrackerClanChallengeCache } from './syncTrackerClanChallengeCache';
import type { TrackerOutlineNode, TrackerOutlineTopic } from '../utils/tracker-outline';

export const useCreateTracker = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<ITracker>, Error, ICreateTrackerPayload>({
    mutationFn: async (payload) => {
      const response = await api.post<IApiResponse<ITracker>>(TRACKER_API_PATHS.root, payload);

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });
    },
  });
};

export const useUpdateTracker = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<ITracker>, Error, IUpdateTrackerPayload>({
    mutationFn: async ({ trackerId, ...payload }) => {
      const response = await api.patch<IApiResponse<ITracker>>(
        TRACKER_API_PATHS.detail(trackerId),
        payload
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      });
    },
  });
};

export const useDeleteTracker = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<ITracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response = await api.delete<IApiResponse<ITracker>>(
        TRACKER_API_PATHS.detail(trackerId)
      );

      return response.data;
    },

    onSuccess: (_response, trackerId) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });
      queryClient.removeQueries({
        queryKey: trackerKeys.detail(trackerId),
      });
      queryClient.invalidateQueries({
        queryKey: communityKeys.all,
      });
    },
  });
};

export const useArchiveTracker = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<ITracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response = await api.post<IApiResponse<ITracker>>(TRACKER_API_PATHS.archive(trackerId));

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });
    },
  });
};

export const useRestoreTracker = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<ITracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response = await api.post<IApiResponse<ITracker>>(TRACKER_API_PATHS.restore(trackerId));

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });
    },
  });
};

export const usePublishTracker = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<ITracker>, Error, PublishTrackerPayload>({
    mutationFn: async ({ trackerId, ...payload }) => {
      const response = await api.post<IApiResponse<ITracker>>(
        TRACKER_API_PATHS.publish(trackerId),
        payload
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.summary(),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      });
    },
  });
};

export const useUnpublishTracker = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<ITracker>, Error, string>({
    mutationFn: async (trackerId) => {
      const response = await api.post<IApiResponse<ITracker>>(
        TRACKER_API_PATHS.unpublish(trackerId)
      );

      return response.data;
    },

    onSuccess: (_response, trackerId) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(trackerId),
      });
    },
  });
};

export const useCreateTrackerTopic = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<unknown>, Error, ICreateTopicPayload>({
    mutationFn: async ({ trackerId, ...payload }) => {
      const response = await api.post<IApiResponse<unknown>>(
        TRACKER_API_PATHS.topics(trackerId),
        payload
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.roadmap(variables.trackerId),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });
    },
  });
};

export const useCreateTrackerSubtopic = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<unknown>, Error, ICreateSubtopicPayload>({
    mutationFn: async ({ trackerId, topicId, ...payload }) => {
      const response = await api.post<IApiResponse<unknown>>(
        TRACKER_API_PATHS.subtopics(trackerId, topicId),
        payload
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.roadmap(variables.trackerId),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.all,
      });
    },
  });
};

type ImportTrackerOutlinePayload =
  | {
      trackerId: string;
      kind: 'topics';
      topics: TrackerOutlineTopic[];
      uploadAsFile?: boolean;
    }
  | {
      trackerId: string;
      kind: 'subtopics';
      topicId: string;
      parentSubtopicId?: string;
      subtopics: TrackerOutlineNode[];
      uploadAsFile?: boolean;
    };

export const useImportTrackerOutline = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { topicsAdded: number; subtopicsAdded: number },
    Error,
    ImportTrackerOutlinePayload
  >({
    mutationFn: async ({ trackerId, uploadAsFile = false, ...outline }) => {
      const serializedOutline = JSON.stringify(outline);
      const payload =
        uploadAsFile || new Blob([serializedOutline]).size >= 80 * 1024
          ? (() => {
              const form = new FormData();
              form.append(
                'file',
                new File([serializedOutline], 'tracker-outline.json', {
                  type: 'application/json',
                })
              );
              return form;
            })()
          : outline;
      const response = await api.post<
        IApiResponse<{ topicsAdded: number; subtopicsAdded: number }>
      >(TRACKER_API_PATHS.importOutline(trackerId), payload);
      return response.data.data;
    },
    onSettled: (_response, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: trackerKeys.roadmap(variables.trackerId) });
      queryClient.invalidateQueries({ queryKey: trackerKeys.detail(variables.trackerId) });
      queryClient.invalidateQueries({ queryKey: trackerKeys.all });
    },
  });
};

export const useCreateTopicContribution = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IApiResponse<ITrackerTopicContribution>,
    Error,
    { trackerId: string; topicId: string }
  >({
    mutationFn: async ({ trackerId, topicId }) => {
      const response = await api.post<IApiResponse<ITrackerTopicContribution>>(
        TRACKER_API_PATHS.createTopicContribution(trackerId, topicId)
      );
      return response.data;
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: trackerKeys.contributions(variables.trackerId) });
    },
  });
};

export const useReviewTopicContribution = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IApiResponse<ITrackerTopicContribution>,
    Error,
    {
      trackerId: string;
      contributionId: string;
      action: 'approve' | 'reject';
      reviewNote?: string;
    }
  >({
    mutationFn: async ({ trackerId, contributionId, ...payload }) => {
      const response = await api.patch<IApiResponse<ITrackerTopicContribution>>(
        TRACKER_API_PATHS.reviewTopicContribution(trackerId, contributionId),
        payload
      );
      return response.data;
    },
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: trackerKeys.contributions(variables.trackerId) });
      queryClient.invalidateQueries({ queryKey: trackerKeys.roadmap(variables.trackerId) });
      queryClient.invalidateQueries({ queryKey: trackerKeys.detail(variables.trackerId) });
      queryClient.invalidateQueries({ queryKey: trackerKeys.all });
    },
  });
};

const useClanMutation = <TVariables>(
  operation: (variables: TVariables) => Promise<IApiResponse<ITrackerClanOverview>>,
  trackerIdOf: (variables: TVariables) => string
) => {
  const queryClient = useQueryClient();
  return useMutation<IApiResponse<ITrackerClanOverview>, Error, TVariables>({
    mutationFn: operation,
    onSuccess: (response, variables) => {
      const trackerId = trackerIdOf(variables);
      queryClient.setQueryData(trackerKeys.clan(trackerId), response.data);
      queryClient.setQueriesData<ITrackerListResponse>(
        { queryKey: trackerKeys.lists() },
        (current) =>
          current
            ? {
                ...current,
                trackers: current.trackers.map((tracker) =>
                  tracker._id === trackerId ||
                  tracker.sourceTrackerId === trackerId ||
                  tracker.clonedFrom?.trackerId === trackerId
                    ? {
                        ...tracker,
                        clanRole:
                          response.data.role === 'outsider' ? undefined : response.data.role,
                      }
                    : tracker
                ),
              }
            : current
      );
      queryClient.invalidateQueries({ queryKey: trackerKeys.clan(trackerId) });
      queryClient.invalidateQueries({ queryKey: trackerKeys.all });
    },
  });
};

export const useRequestTrackerClanJoin = () =>
  useClanMutation(
    async ({ trackerId }: { trackerId: string }) =>
      (await api.post<IApiResponse<ITrackerClanOverview>>(TRACKER_API_PATHS.clanJoin(trackerId)))
        .data,
    ({ trackerId }) => trackerId
  );

export const useReviewTrackerClanJoin = () =>
  useClanMutation(
    async ({
      trackerId,
      requestId,
      action,
    }: {
      trackerId: string;
      requestId: string;
      action: 'approve' | 'reject';
    }) =>
      (
        await api.patch<IApiResponse<ITrackerClanOverview>>(
          TRACKER_API_PATHS.clanJoinRequest(trackerId, requestId),
          { action }
        )
      ).data,
    ({ trackerId }) => trackerId
  );

export const useUpdateTrackerClanMember = () =>
  useClanMutation(
    async ({
      trackerId,
      memberId,
      role,
    }: {
      trackerId: string;
      memberId: string;
      role: 'co_owner' | 'member';
    }) =>
      (
        await api.patch<IApiResponse<ITrackerClanOverview>>(
          TRACKER_API_PATHS.clanMember(trackerId, memberId),
          { role }
        )
      ).data,
    ({ trackerId }) => trackerId
  );

export const useRemoveTrackerClanMember = () =>
  useClanMutation(
    async ({ trackerId, memberId }: { trackerId: string; memberId: string }) =>
      (
        await api.delete<IApiResponse<ITrackerClanOverview>>(
          TRACKER_API_PATHS.clanMember(trackerId, memberId)
        )
      ).data,
    ({ trackerId }) => trackerId
  );

export const useLeaveTrackerClan = () =>
  useClanMutation(
    async ({ trackerId }: { trackerId: string }) =>
      (await api.delete<IApiResponse<ITrackerClanOverview>>(TRACKER_API_PATHS.clanLeave(trackerId)))
        .data,
    ({ trackerId }) => trackerId
  );

export const useTransferTrackerClanOwnership = () =>
  useClanMutation(
    async ({ trackerId, newOwnerId }: { trackerId: string; newOwnerId: string }) =>
      (
        await api.post<IApiResponse<ITrackerClanOverview>>(
          TRACKER_API_PATHS.clanTransfer(trackerId),
          { newOwnerId }
        )
      ).data,
    ({ trackerId }) => trackerId
  );

export const useRespondTrackerClanRoleInvitation = () =>
  useClanMutation(
    async ({
      trackerId,
      invitationId,
      action,
    }: {
      trackerId: string;
      invitationId: string;
      action: 'accept' | 'decline';
    }) =>
      (
        await api.patch<IApiResponse<ITrackerClanOverview>>(
          TRACKER_API_PATHS.clanRoleInvitation(trackerId, invitationId),
          { action }
        )
      ).data,
    ({ trackerId }) => trackerId
  );

export const useFetchTrackerClanChanges = () => {
  const queryClient = useQueryClient();
  return useMutation<IApiResponse<ITrackerCloneSyncResult>, Error, { trackerId: string }>({
    mutationFn: async ({ trackerId }) =>
      (
        await api.post<IApiResponse<ITrackerCloneSyncResult>>(
          TRACKER_API_PATHS.clanFetchChanges(trackerId)
        )
      ).data,
    onSuccess: (_response, { trackerId }) => {
      queryClient.invalidateQueries({ queryKey: trackerKeys.all });
      queryClient.invalidateQueries({ queryKey: trackerKeys.clan(trackerId) });
    },
  });
};

const useClanChallengeMutation = <TVariables>(
  operation: (variables: TVariables) => Promise<IApiResponse<ITrackerClanChallenge>>,
  trackerIdOf: (variables: TVariables) => string
) => {
  const queryClient = useQueryClient();
  return useMutation<IApiResponse<ITrackerClanChallenge>, Error, TVariables>({
    mutationFn: operation,
    onSuccess: (response, variables) => {
      const trackerId = trackerIdOf(variables);
      syncTrackerClanChallengeCache(queryClient, trackerId, response.data);
      queryClient.invalidateQueries({ queryKey: trackerKeys.clanChallenges(trackerId) });
      queryClient.invalidateQueries({ queryKey: trackerKeys.activeClanChallenge() });
    },
  });
};

export const useCreateTrackerClanChallenge = () =>
  useClanChallengeMutation(
    async ({
      trackerId,
      ...payload
    }: {
      trackerId: string;
      opponentId?: string;
      durationMinutes: number;
      questionCount: number;
    }) =>
      (
        await api.post<IApiResponse<ITrackerClanChallenge>>(
          TRACKER_API_PATHS.clanChallenges(trackerId),
          payload
        )
      ).data,
    ({ trackerId }) => trackerId
  );

export const useAcceptTrackerClanChallenge = () =>
  useClanChallengeMutation(
    async ({ trackerId, challengeId }: { trackerId: string; challengeId: string }) =>
      (
        await api.post<IApiResponse<ITrackerClanChallenge>>(
          TRACKER_API_PATHS.clanChallengeAccept(trackerId, challengeId)
        )
      ).data,
    ({ trackerId }) => trackerId
  );

export const useDeclineTrackerClanChallenge = () =>
  useClanChallengeMutation(
    async ({ trackerId, challengeId }: { trackerId: string; challengeId: string }) =>
      (
        await api.post<IApiResponse<ITrackerClanChallenge>>(
          TRACKER_API_PATHS.clanChallengeDecline(trackerId, challengeId)
        )
      ).data,
    ({ trackerId }) => trackerId
  );

export const useCancelTrackerClanChallenge = () =>
  useClanChallengeMutation(
    async ({ trackerId, challengeId }: { trackerId: string; challengeId: string }) =>
      (
        await api.post<IApiResponse<ITrackerClanChallenge>>(
          TRACKER_API_PATHS.clanChallengeCancel(trackerId, challengeId)
        )
      ).data,
    ({ trackerId }) => trackerId
  );

export const useQuitTrackerClanChallenge = () =>
  useClanChallengeMutation(
    async ({ trackerId, challengeId }: { trackerId: string; challengeId: string }) =>
      (
        await api.post<IApiResponse<ITrackerClanChallenge>>(
          TRACKER_API_PATHS.clanChallengeQuit(trackerId, challengeId)
        )
      ).data,
    ({ trackerId }) => trackerId
  );

export const useExtendTrackerClanChallenge = () =>
  useClanChallengeMutation(
    async ({
      trackerId,
      challengeId,
      questionCount,
    }: {
      trackerId: string;
      challengeId: string;
      questionCount: 10 | 20;
    }) =>
      (
        await api.post<IApiResponse<ITrackerClanChallenge>>(
          TRACKER_API_PATHS.clanChallengeExtend(trackerId, challengeId),
          { questionCount }
        )
      ).data,
    ({ trackerId }) => trackerId
  );

export const useSubmitTrackerClanChallenge = () =>
  useClanChallengeMutation(
    async ({
      trackerId,
      challengeId,
      answers,
    }: {
      trackerId: string;
      challengeId: string;
      answers: Array<{ questionId: string; answer: string }>;
    }) =>
      (
        await api.post<IApiResponse<ITrackerClanChallenge>>(
          TRACKER_API_PATHS.clanChallengeSubmit(trackerId, challengeId),
          { answers }
        )
      ).data,
    ({ trackerId }) => trackerId
  );

export const useChooseTrackerClanCheckpoint = () =>
  useClanChallengeMutation(
    async ({
      trackerId,
      challengeId,
      decision,
    }: {
      trackerId: string;
      challengeId: string;
      decision: 'attempt' | 'skip';
    }) =>
      (
        await api.post<IApiResponse<ITrackerClanChallenge>>(
          TRACKER_API_PATHS.clanChallengeCheckpoint(trackerId, challengeId),
          { decision }
        )
      ).data,
    ({ trackerId }) => trackerId
  );

export const useAnswerTrackerClanNode = () =>
  useClanChallengeMutation(
    async ({
      trackerId,
      challengeId,
      questionId,
      answer,
    }: {
      trackerId: string;
      challengeId: string;
      questionId: string;
      answer: string;
    }) =>
      (
        await api.post<IApiResponse<ITrackerClanChallenge>>(
          TRACKER_API_PATHS.clanChallengeAnswer(trackerId, challengeId),
          { questionId, answer }
        )
      ).data,
    ({ trackerId }) => trackerId
  );

export const useTrackerClanChallengePower = () =>
  useClanChallengeMutation(
    async ({ trackerId, challengeId }: { trackerId: string; challengeId: string }) =>
      (
        await api.post<IApiResponse<ITrackerClanChallenge>>(
          TRACKER_API_PATHS.clanChallengePower(trackerId, challengeId)
        )
      ).data,
    ({ trackerId }) => trackerId
  );

export const useUpdateTrackerTopic = () => {
  const queryClient = useQueryClient();
  return useMutation<
    IApiResponse<null>,
    Error,
    { trackerId: string; topicId: string; title: string; description: string }
  >({
    mutationFn: async ({ trackerId, topicId, ...payload }) =>
      (await api.patch<IApiResponse<null>>(TRACKER_API_PATHS.topic(trackerId, topicId), payload))
        .data,
    onSuccess: (_response, { trackerId }) => {
      queryClient.invalidateQueries({ queryKey: trackerKeys.roadmap(trackerId) });
      queryClient.invalidateQueries({ queryKey: trackerKeys.detail(trackerId) });
    },
  });
};

export const useDeleteTrackerTopic = () => {
  const queryClient = useQueryClient();
  return useMutation<IApiResponse<null>, Error, { trackerId: string; topicId: string }>({
    mutationFn: async ({ trackerId, topicId }) =>
      (await api.delete<IApiResponse<null>>(TRACKER_API_PATHS.topic(trackerId, topicId))).data,
    onSuccess: (_response, { trackerId }) => {
      queryClient.invalidateQueries({ queryKey: trackerKeys.roadmap(trackerId) });
      queryClient.invalidateQueries({ queryKey: trackerKeys.detail(trackerId) });
      queryClient.invalidateQueries({ queryKey: trackerKeys.all });
    },
  });
};

export const useDeleteTrackerSubtopic = () => {
  const queryClient = useQueryClient();
  return useMutation<IApiResponse<null>, Error, { trackerId: string; subtopicId: string }>({
    mutationFn: async ({ trackerId, subtopicId }) =>
      (await api.delete<IApiResponse<null>>(TRACKER_API_PATHS.subtopic(trackerId, subtopicId)))
        .data,
    onSuccess: (_response, { trackerId }) => {
      queryClient.invalidateQueries({ queryKey: trackerKeys.roadmap(trackerId) });
      queryClient.invalidateQueries({ queryKey: trackerKeys.detail(trackerId) });
      queryClient.invalidateQueries({ queryKey: trackerKeys.all });
    },
  });
};

export const useUpdateSubtopicProgress = () => {
  const queryClient = useQueryClient();

  return useMutation<IApiResponse<unknown>, Error, IUpdateSubtopicProgressPayload>({
    mutationFn: async ({ trackerId, subtopicId, ...payload }) => {
      const response = await api.patch<IApiResponse<unknown>>(
        TRACKER_API_PATHS.subtopicProgress(trackerId, subtopicId),
        payload
      );

      return response.data;
    },

    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({
        queryKey: trackerKeys.roadmap(variables.trackerId),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.lesson(variables.trackerId, variables.subtopicId),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.detail(variables.trackerId),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.summary(),
      });

      queryClient.invalidateQueries({
        queryKey: trackerKeys.lists(),
      });

      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: activityQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: profileActivityKeys.all });
    },
  });
};
