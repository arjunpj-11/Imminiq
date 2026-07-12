import { create } from 'zustand'

import type { DifficultyLevel, QuestionType } from '../types/mock-tests.types'

export interface IGenerateMockTestDraft {
  topic: string
  difficulty: DifficultyLevel
  questionCount: number
  timeLimitMinutes: number
  questionTypes: QuestionType[]
}

interface IMockTestsStore {
  generateDraft: IGenerateMockTestDraft
  updateGenerateDraft: (patch: Partial<IGenerateMockTestDraft>) => void
  resetGenerateDraft: () => void
}

const defaultDraft: IGenerateMockTestDraft = {
  topic: '',
  difficulty: 'medium',
  questionCount: 10,
  timeLimitMinutes: 30,
  questionTypes: ['mcq'],
}

export const useMockTestsStore = create<IMockTestsStore>((set) => ({
  generateDraft: defaultDraft,
  updateGenerateDraft: (patch) =>
    set((state) => ({
      generateDraft: { ...state.generateDraft, ...patch },
    })),
  resetGenerateDraft: () => set({ generateDraft: defaultDraft }),
}))
