import { create } from 'zustand'
import type { MockTestFilter } from '../constants/mock-tests.constants'
import type { DifficultyLevel, QuestionType } from '../types/mock-tests.types'

type GenerateDraft = { topic: string; difficulty: DifficultyLevel; questionCount: number; timeLimitMinutes: number; questionTypes: QuestionType[] }

interface MockTestsStore {
  filter: MockTestFilter
  search: string
  generateDraft: GenerateDraft
  setFilter: (filter: MockTestFilter) => void
  setSearch: (search: string) => void
  updateGenerateDraft: (patch: Partial<GenerateDraft>) => void
  resetGenerateDraft: () => void
}

const defaultDraft: GenerateDraft = { topic: '', difficulty: 'medium', questionCount: 10, timeLimitMinutes: 30, questionTypes: ['mcq'] }

export const useMockTestsStore = create<MockTestsStore>((set) => ({
  filter: 'All',
  search: '',
  generateDraft: defaultDraft,
  setFilter: (filter) => set({ filter }),
  setSearch: (search) => set({ search }),
  updateGenerateDraft: (patch) => set((state) => ({ generateDraft: { ...state.generateDraft, ...patch } })),
  resetGenerateDraft: () => set({ generateDraft: defaultDraft }),
}))
