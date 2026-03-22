import { create } from 'zustand'

export type GameStage = 'pick' | 'reveal' | 'result' | 'simulating'

interface MontyHallState {
  stage: GameStage
  selectedDoor: number | null
  revealedDoor: number | null
  prizeDoor: number
  lastWon: boolean | null
  isSimulated: boolean
  // 실제 플레이 통계
  totalPlays: number
  switchWins: number
  stayWins: number
  switchPlays: number
  stayPlays: number
  // 시뮬레이션 통계 (별도)
  simTotal: number
  simSwitchWins: number
  simStayWins: number
  actions: {
    pickDoor: (door: number) => void
    decideSwitchOrStay: (doSwitch: boolean) => void
    reset: () => void
    simulateOne: () => void
    stopSimulation: () => void
  }
}

const randomDoor = () => Math.floor(Math.random() * 3)

export const useMontyHallStore = create<MontyHallState>((set, get) => ({
  stage: 'pick',
  selectedDoor: null,
  revealedDoor: null,
  prizeDoor: randomDoor(),
  lastWon: null,
  isSimulated: false,
  totalPlays: 0,
  switchWins: 0,
  stayWins: 0,
  switchPlays: 0,
  stayPlays: 0,
  simTotal: 0,
  simSwitchWins: 0,
  simStayWins: 0,
  actions: {
    pickDoor: (door) => {
      const { prizeDoor } = get()
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
        lastWon: won,
        totalPlays: s.totalPlays + 1,
        switchWins: s.switchWins + (doSwitch && won ? 1 : !doSwitch && !won ? 1 : 0),  // 바꿔서 이겼거나, 유지해서 졌으면(=바꿨으면 이겼을)
        stayWins: s.stayWins + (!doSwitch && won ? 1 : doSwitch && !won ? 1 : 0),       // 유지해서 이겼거나, 바꿔서 졌으면(=유지했으면 이겼을)
        switchPlays: s.switchPlays + (doSwitch ? 1 : 0),
        stayPlays: s.stayPlays + (!doSwitch ? 1 : 0),
      }))
    },
    simulateOne: () => {
      const prize = randomDoor()
      const pick = randomDoor()
      const candidates = [0, 1, 2].filter((d) => d !== pick && d !== prize)
      const revealed = candidates[Math.floor(Math.random() * candidates.length)]
      const switched = [0, 1, 2].find((d) => d !== pick && d !== revealed)!
      const switchWon = switched === prize
      const stayWon = pick === prize
      set((s) => ({
        stage: 'simulating',
        simTotal: s.simTotal + 1,
        simSwitchWins: s.simSwitchWins + (switchWon ? 1 : 0),
        simStayWins: s.simStayWins + (stayWon ? 1 : 0),
        lastWon: switchWon,
      }))
    },
    stopSimulation: () => set({ stage: 'result', isSimulated: true }),
    reset: () => set({
      stage: 'pick',
      selectedDoor: null,
      revealedDoor: null,
      lastWon: null,
      isSimulated: false,
      simTotal: 0,
      simSwitchWins: 0,
      simStayWins: 0,
      prizeDoor: randomDoor(),
    }),
  },
}))
