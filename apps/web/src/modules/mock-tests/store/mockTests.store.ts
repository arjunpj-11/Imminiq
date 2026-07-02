import { create } from 'zustand'

import type { DifficultyLevel, QuestionType } from '../types/mock-tests.types'

export interface GenerateMockTestDraft {
  topic: string
  difficulty: DifficultyLevel
  questionCount: number
  timeLimitMinutes: number
  questionTypes: QuestionType[]
}

interface MockTestsStore {
  generateDraft: GenerateMockTestDraft
  updateGenerateDraft: (patch: Partial<GenerateMockTestDraft>) => void
  resetGenerateDraft: () => void
}

const defaultDraft: GenerateMockTestDraft = {
  topic: '',
  difficulty: 'medium',
  questionCount: 10,
  timeLimitMinutes: 30,
  questionTypes: ['mcq'],
}

export const useMockTestsStore = create<MockTestsStore>((set) => ({
  generateDraft: defaultDraft,
  updateGenerateDraft: (patch) =>
    set((state) => ({
      generateDraft: { ...state.generateDraft, ...patch },
    })),
  resetGenerateDraft: () => set({ generateDraft: defaultDraft }),
}))
