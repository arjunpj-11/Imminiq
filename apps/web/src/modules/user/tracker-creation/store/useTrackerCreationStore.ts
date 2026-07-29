import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '../../../../lib/storage/storage-keys';
import { safeSessionStateStorage, safeSessionStorage } from '../../../../lib/storage/safe-storage';
import type { Level } from '../types/tracker-creation.types';
import type { ITrackerIntakeMessage, ITrackerIntakeProfile } from '../types/tracker-creation.types';

interface ITrackerCreationStepOneDraft {
  goal: string;
  topic: string;
  preferredLanguage: string;
}

interface ITrackerCreationStepTwoDraft {
  level: Level;
  hoursPerDay: number;
}

interface ITrackerCreationStore {
  currentStep: 1 | 2;
  step1Data: ITrackerCreationStepOneDraft | null;
  step2Data: ITrackerCreationStepTwoDraft | null;
  intakeMessages: ITrackerIntakeMessage[];
  intakeProfile: ITrackerIntakeProfile | null;
  activeRoadmapJobId: string | null;
  setStep: (step: 1 | 2) => void;
  saveStep1: (data: ITrackerCreationStepOneDraft) => void;
  saveStep2: (
    data: Partial<ITrackerCreationStepTwoDraft> & Pick<ITrackerCreationStepTwoDraft, 'level'>
  ) => void;
  saveIntake: (messages: ITrackerIntakeMessage[], profile?: ITrackerIntakeProfile) => void;
  clearIntake: () => void;
  setActiveRoadmapJobId: (jobId: string | null) => void;
  reset: () => void;
}

const readLegacyStepOne = (): ITrackerCreationStepOneDraft | null => {
  const topic =
    safeSessionStorage.get('imminiq_topic') || safeSessionStorage.get('imminiq_draft_topic') || '';
  const goal =
    safeSessionStorage.get('imminiq_goal') || safeSessionStorage.get('imminiq_draft_goal') || '';

  return topic || goal ? { topic, goal, preferredLanguage: 'English' } : null;
};

const readLegacyLevel = (): Level => {
  const value = safeSessionStorage.get('imminiq_level');
  return value === 'beginner' || value === 'advanced' ? value : 'intermediate';
};

const migrateLegacyTrackerCreationDraft = () => {
  if (safeSessionStorage.get(STORAGE_KEYS.trackerCreationDraft)) return;

  const legacyDraft = safeSessionStorage.get(STORAGE_KEYS.onboardingDraft);
  if (legacyDraft) safeSessionStorage.set(STORAGE_KEYS.trackerCreationDraft, legacyDraft);
};

migrateLegacyTrackerCreationDraft();

export const useTrackerCreationStore = create<ITrackerCreationStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      step1Data: readLegacyStepOne(),
      step2Data: { level: readLegacyLevel(), hoursPerDay: 1 },
      intakeMessages: [],
      intakeProfile: null,
      activeRoadmapJobId: null,
      setStep: (currentStep) => set({ currentStep }),
      saveStep1: (step1Data) => set({ step1Data, currentStep: 2 }),
      saveStep2: (data) =>
        set((state) => ({
          step2Data: {
            level: data.level,
            hoursPerDay: data.hoursPerDay ?? state.step2Data?.hoursPerDay ?? 1,
          },
        })),
      saveIntake: (intakeMessages, intakeProfile) =>
        set((state) => ({
          intakeMessages,
          intakeProfile: intakeProfile ?? state.intakeProfile,
        })),
      clearIntake: () => set({ intakeMessages: [], intakeProfile: null }),
      setActiveRoadmapJobId: (activeRoadmapJobId) => set({ activeRoadmapJobId }),
      reset: () =>
        set({
          currentStep: 1,
          step1Data: null,
          step2Data: { level: 'intermediate', hoursPerDay: 1 },
          intakeMessages: [],
          intakeProfile: null,
          activeRoadmapJobId: null,
        }),
    }),
    {
      name: STORAGE_KEYS.trackerCreationDraft,
      storage: createJSONStorage(() => safeSessionStateStorage),
      partialize: ({
        currentStep,
        step1Data,
        step2Data,
        intakeMessages,
        intakeProfile,
        activeRoadmapJobId,
      }) => ({
        currentStep,
        step1Data,
        step2Data,
        intakeMessages,
        intakeProfile,
        activeRoadmapJobId,
      }),
    }
  )
);

export const getTrackerCreationSnapshot = () => useTrackerCreationStore.getState();
