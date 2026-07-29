import { getTrackerCreationSnapshot } from '../store/useTrackerCreationStore';
import type { Level } from '../types/tracker-creation.types';

export const getInitialLevel = (): Level =>
  getTrackerCreationSnapshot().step2Data?.level ?? 'intermediate';

export const getTrackerCreationContext = () => {
  const state = getTrackerCreationSnapshot();

  return {
    topic: state.step1Data?.topic ?? '',
    goal: state.step1Data?.goal ?? '',
    preferredLanguage: state.step1Data?.preferredLanguage ?? 'English',
    level: state.step2Data?.level ?? 'intermediate',
  };
};
