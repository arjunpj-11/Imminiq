import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import api from '../../../lib/axios';
import { ROUTES } from '../../../routes/config/route-paths';
import { resetClientState } from '../../../store/reset-client-state';
import { AUTH_API_PATHS } from '../constants/auth.constants';

export const useLogout = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await api.post(AUTH_API_PATHS.logout);
    },
    onSettled: () => {
      resetClientState();
      navigate(ROUTES.login, { replace: true });
    },
  });
};
