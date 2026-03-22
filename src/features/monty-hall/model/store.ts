import { create } from 'zustand'

export type GameStage = 'pick' | 'reveal' | 'result' | 'simulating'

interface MontyHallState {
  sessionId: number
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
    restartAll: () => void
    simulateOne: () => void
    simulateBatch: (count: number) => void
    stopSimulation: () => void
  }
}

const randomDoor = () => Math.floor(Math.random() * 3)

const runSimulationBatch = (count: number) => {
  let switchWins = 0
  let stayWins = 0

  for (let i = 0; i < count; i++) {
    const prize = randomDoor()
    const pick = randomDoor()
    const candidates = [0, 1, 2].filter((d) => d !== pick && d !== prize)
    const revealed = candidates[Math.floor(Math.random() * candidates.length)]
    const switched = [0, 1, 2].find((d) => d !== pick && d !== revealed)!

    if (switched === prize) switchWins++
    if (pick === prize) stayWins++
  }

  return { switchWins, stayWins }
}

export const useMontyHallStore = create<MontyHallState>((set, get) => ({
  sessionId: 0,
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
      const batch = runSimulationBatch(1)
      set((s) => ({
        stage: 'simulating',
        simTotal: s.simTotal + 1,
        simSwitchWins: s.simSwitchWins + batch.switchWins,
        simStayWins: s.simStayWins + batch.stayWins,
        lastWon: batch.switchWins > 0,
      }))
    },
    simulateBatch: (count) => {
      const batch = runSimulationBatch(count)
      set((s) => ({
        stage: 'simulating',
        simTotal: s.simTotal + count,
        simSwitchWins: s.simSwitchWins + batch.switchWins,
        simStayWins: s.simStayWins + batch.stayWins,
        lastWon: batch.switchWins >= batch.stayWins,
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
    restartAll: () => set((s) => ({
      sessionId: s.sessionId + 1,
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
    })),
  },
}))
