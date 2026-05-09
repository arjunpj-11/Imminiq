import { create } from 'zustand'

interface OnboardingStore {
  currentStep: 1 | 2
  step1Data: { goal: string; topic: string } | null
  step2Data: { level: string; hoursPerDay: number } | null
  setStep: (step: 1 | 2) => void
  saveStep1: (data: { goal: string; topic: string }) => void
  saveStep2: (data: { level: string; hoursPerDay: number }) => void
  reset: () => void
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentStep: 1,
  step1Data: null,
  step2Data: null,
  setStep: (step) => set({ currentStep: step }),
  saveStep1: (data) => set({ step1Data: data }),
  saveStep2: (data) => set({ step2Data: data }),
  reset: () => set({ currentStep: 1, step1Data: null, step2Data: null }),
}))