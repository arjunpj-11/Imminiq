import { getOnboardingSnapshot } from '../store/useOnboardingStore';
import type { Level } from '../types/onboarding.types';

export const getInitialLevel = (): Level =>
  getOnboardingSnapshot().step2Data?.level ?? 'intermediate';

export const getOnboardingContext = () => {
  const state = getOnboardingSnapshot();

  return {
    topic: state.step1Data?.topic ?? '',
    goal: state.step1Data?.goal ?? '',
    level: state.step2Data?.level ?? 'intermediate',
  };
};
