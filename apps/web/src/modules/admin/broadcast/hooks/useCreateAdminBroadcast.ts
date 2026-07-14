import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../../lib/axios';
import { toast } from '../../../../lib/toast';
import { getUserFacingError } from '../../../../lib/user-facing-error';
import { ADMIN_BROADCAST_ENDPOINTS } from '../constants/admin-broadcast.constants';
import { adminBroadcastKeys } from './admin-broadcast.query-keys';

export const useCreateAdminBroadcast = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      title: string;
      message: string;
      audience: 'all' | 'active';
      deepLink?: string;
    }) => api.post(ADMIN_BROADCAST_ENDPOINTS.create, input),
    onMutate: () => ({
      toastId: toast.loading(
        'Sending broadcast…',
        'Creating notifications for the selected audience.'
      ),
    }),
    onSuccess: async (_data, _input, context) => {
      toast.update(context.toastId, {
        title: 'Broadcast sent',
        description: 'The delivery record is now available in broadcast history.',
        tone: 'success',
      });
      await client.invalidateQueries({ queryKey: adminBroadcastKeys.all });
    },
    onError: (error, _input, context) => {
      if (!context) return;
      toast.update(context.toastId, {
        title: 'Broadcast could not be sent',
        description: getUserFacingError(
          error,
          'Please check the audience and message, then retry.'
        ),
        tone: 'error',
        duration: 5600,
      });
    },
  });
};
