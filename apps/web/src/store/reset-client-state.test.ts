import { afterEach, describe, expect, it } from 'vitest';

import { queryClient } from '../lib/queryClient';
import { useMockTestsStore } from '../modules/user/mock-tests/store/useMockTestsStore';
import { useOnboardingStore } from '../modules/user/tracker-creation/store/useOnboardingStore';
import { useProfileStore } from '../modules/user/users/store/useProfileStore';
import { resetClientState } from './reset-client-state';
import { useAuthStore } from './useAuthStore';

describe('resetClientState', () => {
  afterEach(() => resetClientState());

  it('clears authenticated server data and user-scoped workflow state together', () => {
    queryClient.setQueryData(['private-user-data'], { secret: true });
    useAuthStore.getState().setUser({
      _id: 'user-1',
      username: 'learner',
      role: 'user',
    });
    useOnboardingStore.getState().saveStep1({
      goal: 'Prepare for an exam',
      topic: 'Algorithms',
      preferredLanguage: 'English',
    });
    useMockTestsStore.getState().updateGenerateDraft({ topic: 'Algorithms' });
    useProfileStore.getState().openEditPanel();

    resetClientState();

    expect(queryClient.getQueryData(['private-user-data'])).toBeUndefined();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useOnboardingStore.getState().step1Data).toBeNull();
    expect(useMockTestsStore.getState().generateDraft.topic).toBe('');
    expect(useProfileStore.getState().editPanelOpen).toBe(false);
  });
});
