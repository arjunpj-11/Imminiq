import { queryClient } from './queryClient';
import { useAppShellStore } from '../store/useAppShellStore';

export const refreshCurrentRoute = () => {
  useAppShellStore.getState().refreshCurrentRoute();
  void queryClient.invalidateQueries({ refetchType: 'active' });
};
