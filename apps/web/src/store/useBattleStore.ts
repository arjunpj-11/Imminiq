import { create } from 'zustand'

interface BattleStore {
  battleId: string | null
  currentQuestion: object | null
  myScore: number
  opponentScore: number
  timeLeft: number
  isActive: boolean
  setBattle: (id: string) => void
  setQuestion: (q: object) => void
  updateScores: (mine: number, theirs: number) => void
  setTimeLeft: (t: number) => void
  endBattle: () => void
}

export const useBattleStore = create<BattleStore>((set) => ({
  battleId: null,
  currentQuestion: null,
  myScore: 0,
  opponentScore: 0,
  timeLeft: 0,
  isActive: false,
  setBattle: (id) => set({ battleId: id, isActive: true }),
  setQuestion: (q) => set({ currentQuestion: q }),
  updateScores: (mine, theirs) => set({ myScore: mine, opponentScore: theirs }),
  setTimeLeft: (t) => set({ timeLeft: t }),
  endBattle: () => set({ battleId: null, isActive: false, currentQuestion: null }),
}))