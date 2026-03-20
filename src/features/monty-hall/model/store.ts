import { create } from 'zustand'

export type GameStage = 'pick' | 'reveal' | 'decide' | 'result'

interface MontyHallState {
  stage: GameStage
  selectedDoor: number | null
  revealedDoor: number | null
  prizeDoor: number
  totalPlays: number
  switchWins: number
  stayWins: number
  actions: {
    pickDoor: (door: number) => void
    decideSwitchOrStay: (doSwitch: boolean) => void
    reset: () => void
  }
}

const randomDoor = () => Math.floor(Math.random() * 3)

export const useMontyHallStore = create<MontyHallState>((set, get) => ({
  stage: 'pick',
  selectedDoor: null,
  revealedDoor: null,
  prizeDoor: randomDoor(),
  totalPlays: 0,
  switchWins: 0,
  stayWins: 0,
  actions: {
    pickDoor: (door) => {
      const { prizeDoor } = get()
      // 진행자가 꽝 문 하나 공개 (선택한 문, 정답 문 제외)
      const candidates = [0, 1, 2].filter((d) => d !== door && d !== prizeDoor)
      const revealedDoor = candidates[Math.floor(Math.random() * candidates.length)]
      set({ selectedDoor: door, revealedDoor, stage: 'reveal' })
    },
    decideSwitchOrStay: (doSwitch) => {
      const { selectedDoor, revealedDoor, prizeDoor } = get()
      const finalDoor = doSwitch
        ? [0, 1, 2].find((d) => d !== selectedDoor && d !== revealedDoor)!
        : selectedDoor!
      const won = finalDoor === prizeDoor
      set((s) => ({
        stage: 'result',
        selectedDoor: finalDoor,
        totalPlays: s.totalPlays + 1,
        switchWins: s.switchWins + (doSwitch && won ? 1 : 0),
        stayWins: s.stayWins + (!doSwitch && won ? 1 : 0),
      }))
    },
    reset: () => set({ stage: 'pick', selectedDoor: null, revealedDoor: null, prizeDoor: randomDoor() }),
  },
}))
