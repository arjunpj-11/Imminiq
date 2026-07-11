import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { STORAGE_KEYS } from '../../../lib/storage/storage-keys'
import { safeSessionStateStorage, safeSessionStorage } from '../../../lib/storage/safe-storage'
import type { Level } from '../types/onboarding.types'

interface IOnboardingStepOneDraft {
  goal: string
  topic: string
}

interface IOnboardingStepTwoDraft {
  level: Level
  hoursPerDay: number
}

interface IOnboardingStore {
  currentStep: 1 | 2
  step1Data: IOnboardingStepOneDraft | null
  step2Data: IOnboardingStepTwoDraft | null
  setStep: (step: 1 | 2) => void
  saveStep1: (data: IOnboardingStepOneDraft) => void
  saveStep2: (data: Partial<IOnboardingStepTwoDraft> & Pick<IOnboardingStepTwoDraft, 'level'>) => void
  reset: () => void
}

const readLegacyStepOne = (): IOnboardingStepOneDraft | null => {
  const topic =
    safeSessionStorage.get('imminiq_topic') ||
    safeSessionStorage.get('imminiq_draft_topic') ||
    ''
  const goal =
    safeSessionStorage.get('imminiq_goal') ||
    safeSessionStorage.get('imminiq_draft_goal') ||
    ''

  return topic || goal ? { topic, goal } : null
}

const readLegacyLevel = (): Level => {
  const value = safeSessionStorage.get('imminiq_level')
  return value === 'beginner' || value === 'advanced' ? value : 'intermediate'
}

export const useOnboardingStore = create<IOnboardingStore>()(
  persist(
    (set) => ({
      currentStep: 1,
      step1Data: readLegacyStepOne(),
      step2Data: { level: readLegacyLevel(), hoursPerDay: 1 },
      setStep: (currentStep) => set({ currentStep }),
      saveStep1: (step1Data) => set({ step1Data, currentStep: 2 }),
      saveStep2: (data) =>
        set((state) => ({
          step2Data: {
            level: data.level,
            hoursPerDay: data.hoursPerDay ?? state.step2Data?.hoursPerDay ?? 1,
          },
        })),
      reset: () =>
        set({
          currentStep: 1,
          step1Data: null,
          step2Data: { level: 'intermediate', hoursPerDay: 1 },
        }),
    }),
    {
      name: STORAGE_KEYS.onboardingDraft,
      storage: createJSONStorage(() => safeSessionStateStorage),
      partialize: ({ currentStep, step1Data, step2Data }) => ({
        currentStep,
        step1Data,
        step2Data,
      }),
    },
  ),
)

export const getOnboardingSnapshot = () => useOnboardingStore.getState()
