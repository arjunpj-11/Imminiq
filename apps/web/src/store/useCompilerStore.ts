import { create } from 'zustand'

interface CompilerStore {
  code: string
  language: string
  output: string
  isRunning: boolean
  setCode: (code: string) => void
  setLanguage: (lang: string) => void
  setOutput: (output: string) => void
  setRunning: (v: boolean) => void
  reset: () => void
}

export const useCompilerStore = create<CompilerStore>((set) => ({
  code: '',
  language: 'python',
  output: '',
  isRunning: false,
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setOutput: (output) => set({ output }),
  setRunning: (v) => set({ isRunning: v }),
  reset: () => set({ code: '', output: '', isRunning: false }),
}))