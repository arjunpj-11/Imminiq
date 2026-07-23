import { useMutation } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { COMMUNITY_ENDPOINTS } from '../constants/community.constants';

export type ReportTrackerReason =
  | 'incorrect_or_misleading'
  | 'unsafe_or_offensive'
  | 'spam_or_low_quality'
  | 'copyright_or_plagiarism'
  | 'broken_learning_path'
  | 'privacy_concern'
  | 'other';

export const useReportCommunityTracker = () =>
  useMutation({
    mutationFn: ({
      trackerId,
      reason,
      details,
    }: {
      trackerId: string;
      reason: ReportTrackerReason;
      details: string;
    }) => api.post(COMMUNITY_ENDPOINTS.reportTracker(trackerId), { reason, details }),
    onSuccess: () =>
      toast.success('Report submitted', 'An administrator will review this tracker.'),
    onError: (error) => toast.error('Report failed', getUserFacingError(error)),
  });
