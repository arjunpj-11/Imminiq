import { queryClient } from '../lib/queryClient';
import { useMockTestsStore } from '../modules/user/mock-tests/store/useMockTestsStore';
import { useTrackerCreationStore } from '../modules/user/tracker-creation/store/useTrackerCreationStore';
import { useProfileStore } from '../modules/user/users/store/useProfileStore';
import { useAuthStore } from './useAuthStore';

/** Clears all user-scoped state so cached data cannot leak into a later session. */
export const resetClientState = () => {
  queryClient.clear();
  useTrackerCreationStore.getState().reset();
  useMockTestsStore.getState().resetGenerateDraft();
  useProfileStore.getState().closeAllProfileOverlays();
  useAuthStore.getState().clearAuth();
};
