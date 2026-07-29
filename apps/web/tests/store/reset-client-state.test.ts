import { afterEach, describe, expect, it } from 'vitest';

import { queryClient } from '../../src/lib/queryClient';
import { useMockTestsStore } from '../../src/modules/user/mock-tests/store/useMockTestsStore';
import { useTrackerCreationStore } from '../../src/modules/user/tracker-creation/store/useTrackerCreationStore';
import { useProfileStore } from '../../src/modules/user/users/store/useProfileStore';
import { resetClientState } from '../../src/store/reset-client-state';
import { useAuthStore } from '../../src/store/useAuthStore';

describe('resetClientState', () => {
  afterEach(() => resetClientState());

  it('clears authenticated server data and user-scoped workflow state together', () => {
    queryClient.setQueryData(['private-user-data'], { secret: true });
    useAuthStore.getState().setUser({
      _id: 'user-1',
      username: 'learner',
      role: 'user',
    });
    useTrackerCreationStore.getState().saveStep1({
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
    expect(useTrackerCreationStore.getState().step1Data).toBeNull();
    expect(useMockTestsStore.getState().generateDraft.topic).toBe('');
    expect(useProfileStore.getState().editPanelOpen).toBe(false);
  });
});
