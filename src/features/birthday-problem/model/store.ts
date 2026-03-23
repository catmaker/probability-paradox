import { create } from 'zustand'

export interface BirthdayParticipant {
  id: number
  dayOfYear: number
}

export type BirthdayStage = 'gather' | 'threshold' | 'simulating' | 'explaining'

interface BirthdayProblemState {
  sessionId: number
  nextId: number
  stage: BirthdayStage
  thresholdSeen: boolean
  participants: BirthdayParticipant[]
  simulationSampleSize: number
  simTotal: number
  simHits: number
  actions: {
    addPerson: () => void
    fillToThreshold: () => void
    dismissThreshold: () => void
    startSimulation: () => void
    simulateBatch: (count: number) => void
    finishSimulation: () => void
    restartAll: () => void
  }
}

export const BIRTHDAY_THRESHOLD = 23

const DAYS_IN_YEAR = 365

const randomDayOfYear = () => Math.floor(Math.random() * DAYS_IN_YEAR) + 1

const createParticipant = (id: number): BirthdayParticipant => ({
  id,
  dayOfYear: randomDayOfYear(),
})

const buildParticipants = (startId: number, count: number) =>
  Array.from({ length: count }, (_, index) => createParticipant(startId + index))

const hasDuplicateBirthday = (count: number) => {
  const seen = new Set<number>()

  for (let index = 0; index < count; index += 1) {
    const day = randomDayOfYear()
    if (seen.has(day)) return true
    seen.add(day)
  }

  return false
}

export const useBirthdayProblemStore = create<BirthdayProblemState>((set, get) => ({
  sessionId: 0,
  nextId: 1,
  stage: 'gather',
  thresholdSeen: false,
  participants: [],
  simulationSampleSize: BIRTHDAY_THRESHOLD,
  simTotal: 0,
  simHits: 0,
  actions: {
    addPerson: () => {
      const { nextId, thresholdSeen } = get()
      set((state) => {
        const nextParticipants = [...state.participants, createParticipant(nextId)]
        const reachedThreshold = !thresholdSeen && nextParticipants.length >= BIRTHDAY_THRESHOLD

        return {
          participants: nextParticipants,
          nextId: nextId + 1,
          stage: reachedThreshold ? 'threshold' : state.stage === 'gather' ? 'gather' : state.stage,
          simTotal: 0,
          simHits: 0,
        }
      })
    },
    fillToThreshold: () => {
      const { nextId, participants, thresholdSeen } = get()
      const needed = Math.max(0, BIRTHDAY_THRESHOLD - participants.length)

      if (needed === 0) {
        if (!thresholdSeen) {
          set({ stage: 'threshold' })
        }
        return
      }

      set((state) => ({
        participants: [...state.participants, ...buildParticipants(nextId, needed)],
        nextId: nextId + needed,
        stage: !thresholdSeen ? 'threshold' : 'gather',
        simTotal: 0,
        simHits: 0,
      }))
    },
    dismissThreshold: () => set({
      stage: 'gather',
      thresholdSeen: true,
    }),
    startSimulation: () => set({
      stage: 'simulating',
      thresholdSeen: true,
      simulationSampleSize: BIRTHDAY_THRESHOLD,
      simTotal: 0,
      simHits: 0,
    }),
    simulateBatch: (count) => {
      const sampleSize = Math.max(get().simulationSampleSize, BIRTHDAY_THRESHOLD)
      let hits = 0

      for (let run = 0; run < count; run += 1) {
        if (hasDuplicateBirthday(sampleSize)) hits += 1
      }

      set((state) => ({
        simTotal: state.simTotal + count,
        simHits: state.simHits + hits,
      }))
    },
    finishSimulation: () => set({ stage: 'explaining' }),
    restartAll: () => set((state) => ({
      sessionId: state.sessionId + 1,
      nextId: 1,
      stage: 'gather',
      thresholdSeen: false,
      participants: [],
      simulationSampleSize: BIRTHDAY_THRESHOLD,
      simTotal: 0,
      simHits: 0,
    })),
  },
}))
