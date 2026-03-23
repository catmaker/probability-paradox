import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/shared/ui/Modal'
import { BIRTHDAY_THRESHOLD, useBirthdayProblemStore, type BirthdayStage } from '../model/store'
import './birthday-problem.css'

const TOTAL_SIM_RUNS = 1000
const INTERVAL_MS = 40
const BATCH_SIZE = 20

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const DUPLICATE_GROUP_COLORS = [
  { border: '#d78647', glow: 'rgba(215, 134, 71, 0.18)', fill: 'rgba(58, 33, 22, 0.94)', accent: '#f1c38d' },
  { border: '#72a7d8', glow: 'rgba(114, 167, 216, 0.18)', fill: 'rgba(19, 34, 49, 0.94)', accent: '#c6e5ff' },
  { border: '#9f8ae0', glow: 'rgba(159, 138, 224, 0.18)', fill: 'rgba(31, 24, 49, 0.94)', accent: '#ddd2ff' },
  { border: '#7db6a1', glow: 'rgba(125, 182, 161, 0.18)', fill: 'rgba(19, 40, 34, 0.94)', accent: '#d4f4e5' },
  { border: '#d37f97', glow: 'rgba(211, 127, 151, 0.18)', fill: 'rgba(48, 23, 32, 0.94)', accent: '#ffd6e1' },
] as const

const SimCell = ({ children, head, highlight }: { children: ReactNode; head?: boolean; highlight?: 'warm' | 'cool' }) => (
  <td
    className={`birthday-problem__sim-cell ${head ? 'is-head' : ''} ${highlight ? `is-${highlight}` : ''}`}
  >
    {children}
  </td>
)

const NOTE_SLIDES = [
  {
    key: 'illusion',
    render: () => (
      <>
        <p className="birthday-problem__modal-eyebrow font-cinzel">1 — 첫 번째 착각</p>
        <h3 className="birthday-problem__simulation-title">자기중심적인 질문은 진실을 안개 너머로 숨깁니다</h3>
        <div className="birthday-problem__simulation-quote">
          <p>
            “이 방에 <span>나와 생일이 같은 사람</span>이 있을까?”
          </p>
        </div>
        <div className="birthday-problem__simulation-body">
          <p>우리는 이 기묘한 확률 앞을 마주할 때, 무의식적으로 지극히 자기중심적인 환영에 빠집니다.</p>
          <p>1년 365일 가운데 나의 생일은 단 하루뿐이기에, 기적은 아득히 멀게만 느껴집니다.</p>
          <p>하지만 이 방이 묻는 진짜 질문은 다릅니다. 누구든 상관없이, 아무 두 사람의 생일이 겹칠 수 있는가. 시선을 ‘나’에서 ‘공간 전체’로 옮기는 순간, 감춰져 있던 수학의 마법이 시작됩니다.</p>
        </div>
      </>
    ),
  },
  {
    key: 'lines',
    render: () => (
      <>
        <p className="birthday-problem__modal-eyebrow font-cinzel">2 — 보이지 않는 선들의 폭발</p>
        <h3 className="birthday-problem__simulation-title">눈에 보이는 것은 사람 수지만, 실제로 불어나는 것은 비교의 선입니다</h3>
        <table className="birthday-problem__sim-table">
          <thead>
            <tr>
              <SimCell head>인원</SimCell>
              <SimCell head>비교 쌍</SimCell>
              <SimCell head>겹칠 확률</SimCell>
            </tr>
          </thead>
          <tbody>
            <tr>
              <SimCell>10명</SimCell>
              <SimCell>45쌍</SimCell>
              <SimCell>11.7%</SimCell>
            </tr>
            <tr>
              <SimCell>20명</SimCell>
              <SimCell>190쌍</SimCell>
              <SimCell>41.1%</SimCell>
            </tr>
            <tr>
              <SimCell highlight="warm">23명</SimCell>
              <SimCell highlight="warm">253쌍</SimCell>
              <SimCell highlight="warm">50.7%</SimCell>
            </tr>
            <tr>
              <SimCell>30명</SimCell>
              <SimCell>435쌍</SimCell>
              <SimCell>70.6%</SimCell>
            </tr>
          </tbody>
        </table>
        <div className="birthday-problem__simulation-body">
          <p>방 안에 10명이 모이면 45가닥의 선이 허공에서 교차하고, 20명이 되면 그 선은 190가닥으로 얽힙니다.</p>
          <p>그리고 23명이 모이는 순간, 작은 방 안에는 무려 253가닥의 촘촘한 그물망이 완성됩니다.</p>
        </div>
        <p className="birthday-problem__simulation-caption">
          365일이라는 캔버스 위에 253번이나 무작위로 점을 찍는데, 단 한 번도 같은 자리에 떨어지지 않는 것이 오히려 더 기이한 일 아닐까요?
        </p>
      </>
    ),
  },
  {
    key: 'attack',
    render: () => (
      <>
        <p className="birthday-problem__modal-eyebrow font-cinzel">3 — 심연의 그림자</p>
        <h3 className="birthday-problem__simulation-title">이 직관의 붕괴는 현대 암호학에서 ‘생일 공격’이라는 이름으로 되살아납니다</h3>
        <div className="birthday-problem__simulation-quote">
          <p>
            목표는 <span>하나의 과녁</span>을 맞히는 것이 아니라,
            <br />
            <span>아무 두 결과나 서로 부딪히게 만드는 것</span>입니다.
          </p>
        </div>
        <div className="birthday-problem__simulation-compare">
          <div className="birthday-problem__simulation-compare-card">
            <span className="font-cinzel">거의 불가능한 쪽</span>
            <strong>견고한 암호 하나를 정확히 꿰뚫기</strong>
            <p>특정한 하나를 직접 노리는 일은 너무 멀고 단단해 보입니다.</p>
          </div>
          <div className="birthday-problem__simulation-compare-card is-highlight">
            <span className="font-cinzel">실제로 더 쉬운 쪽</span>
            <strong>아무 두 암호가 우연히 충돌하게 만들기</strong>
            <p>어둠 속의 추적자들은 특정 하나를 맞히지 않고, 아무 둘이나 부딪히게 만듭니다.</p>
          </div>
        </div>
        <div className="birthday-problem__simulation-body">
          <p>그래서 이 문제는 단순한 지적 유희로 끝나지 않습니다. 현대 암호학의 가장 깊은 곳에서, 바로 이 빗나간 직관이 가장 날카로운 무기가 됩니다.</p>
          <p>“하나를 맞히는 것”보다 “아무거나 두 개가 부딪히게 만드는 것”이 훨씬 쉽다는 파괴적인 진실이 디지털 세계에서도 반복됩니다.</p>
        </div>
      </>
    ),
  },
  {
    key: 'origin',
    render: () => (
      <>
        <p className="birthday-problem__modal-eyebrow font-cinzel">4 — 23이라는 숫자가 남기는 것</p>
        <h3 className="birthday-problem__simulation-title">기억해야 할 것은 숫자 자체보다, 그 아래에서 팽창하는 이면의 구조입니다</h3>
        <div className="birthday-problem__simulation-quote">
          <p>
            “365일이나 있는데 왜 이렇게 빨리 겹치지?”
            <br />
            <span>이 서늘한 질문이 곧 이 퍼즐의 정체입니다.</span>
          </p>
        </div>
        <div className="birthday-problem__simulation-body">
          <p>이 계산의 원리는 허무할 정도로 단순하지만, 우리의 기억 속에는 지워지지 않는 흔적을 남깁니다. 그 이유는 이 진실이 인간의 본능적인 감각을 너무나도 완벽하게 배신하기 때문입니다.</p>
          <p>그러니 이 방을 나서는 순간 기억해야 할 것은 23이라는 작은 숫자 하나가 아닙니다. 눈에 보이는 표면보다, 그 이면에서 기하급수적으로 팽창하는 충돌의 기회입니다.</p>
          <p>그리고 우리의 직관은 언제나 우리를 기만할 준비가 되어 있다는, 조금은 서늘한 진실입니다.</p>
        </div>
      </>
    ),
  },
] as const

const getMonthDay = (dayOfYear: number) => {
  let remaining = dayOfYear

  for (let month = 0; month < DAYS_IN_MONTH.length; month += 1) {
    if (remaining <= DAYS_IN_MONTH[month]) {
      return { month: month + 1, day: remaining }
    }
    remaining -= DAYS_IN_MONTH[month]
  }

  return { month: 12, day: 31 }
}

const getPairCount = (count: number) => Math.floor((count * (count - 1)) / 2)

const getExactCollisionProbability = (count: number) => {
  if (count <= 1) return 0
  if (count > 365) return 1

  let allUnique = 1
  for (let index = 0; index < count; index += 1) {
    allUnique *= (365 - index) / 365
  }

  return 1 - allUnique
}

const getStageMessage = (stage: BirthdayStage, count: number, duplicateCount: number) => {
  if (stage === 'simulating') return '반복은 직관보다 차갑게 말합니다.'
  if (stage === 'explaining') return '숫자는 이미 조용히 답을 보여주었습니다.'
  if (stage === 'threshold') return '23명. 겹칠 확률은 이미 절반을 넘었습니다.'
  if (count === 0) return '한 명씩 불러들이며, 겹침이 시작되는 순간을 지켜보세요.'
  if (duplicateCount > 0) return '첫 충돌이 나타났습니다. 이제 이 장면이 얼마나 빨라지는지 보세요.'
  if (count < 10) return '아직은 아무 일도 없어 보입니다.'
  if (count < BIRTHDAY_THRESHOLD) return '비교 기회는 이미 생각보다 빠르게 쌓이고 있습니다.'
  return '사람은 많지 않아 보여도, 충돌 기회는 이미 충분히 많아졌습니다.'
}

const getScenePosition = (index: number) => {
  if (index === 0) {
    return { x: 50, y: 50, scale: 1.14, rotate: -3 }
  }

  let remaining = index - 1
  let ringIndex = 0
  let countInRing = 6

  while (remaining >= countInRing) {
    remaining -= countInRing
    ringIndex += 1
    countInRing = 6 + ringIndex * 4
  }

  const radius = 15 + ringIndex * 10.5
  const angle = (remaining / countInRing) * Math.PI * 2 - Math.PI / 2 + ringIndex * 0.18
  const verticalScale = Math.min(0.74 + ringIndex * 0.035, 0.92)

  return {
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * (radius * verticalScale),
    scale: Math.max(0.54, 1.02 - ringIndex * 0.08),
    rotate: Math.cos(angle) * 8,
  }
}

const getRoomZoom = (count: number) => {
  if (count <= 18) return 1
  if (count <= 30) return 0.94
  if (count <= 42) return 0.84
  if (count <= 56) return 0.74
  if (count <= 72) return 0.66
  return 0.58
}

const getRoomHeadline = (stage: BirthdayStage, count: number, duplicateCount: number) => {
  if (stage === 'simulating') return '이제는 한 번의 장면보다 전체 패턴이 중요합니다'
  if (stage === 'explaining') return '실험이 끝나면 기록이 열립니다'
  if (count === 0) return '방은 아직 비어 있습니다'
  if (duplicateCount > 0) return '같은 날짜가 조용히 모습을 드러냈습니다'
  if (count < 10) return '겉보기에는 아직 아무 일도 없습니다'
  if (count < BIRTHDAY_THRESHOLD) return '사람보다 비교 기회가 더 빨리 늘어나고 있습니다'
  return '이 방은 이미 임계점을 지나고 있습니다'
}

const getRoomCopy = (stage: BirthdayStage, count: number, duplicateCount: number, thresholdSeen: boolean) => {
  if (stage === 'simulating') {
    return '이제는 한 번의 예외보다, 같은 조건을 수백 번 반복했을 때 어떤 비율이 남는지 보는 단계입니다.'
  }
  if (stage === 'explaining') {
    return '시뮬레이션이 끝났습니다. 이제 마지막 노트에서 왜 23명이 놀라운 숫자인지, 왜 사람들은 자꾸 이 장면을 과소평가하는지 읽게 됩니다.'
  }
  if (count === 0) {
    return '처음에는 조용한 방에서 시작합니다. 한 명씩 불러들이며 언제 처음 충돌이 등장하는지 직접 확인해보세요.'
  }
  if (duplicateCount > 0) {
    return '같은 생일은 이미 나타났습니다. 하지만 핵심은 특정 날짜 자체보다, 이런 충돌이 점점 쉬워지는 구조에 있습니다.'
  }
  if (!thresholdSeen) {
    return '지금은 설명보다 체감이 먼저입니다. 조금씩 더 채우거나 빠르게 진행하며, 당신의 예상이 언제 흔들리는지 먼저 보세요.'
  }
  return '문턱을 한 번 본 뒤에는, 더 오래 지켜보거나 바로 반복 실험으로 넘어갈 수 있습니다.'
}

const getControlHint = (stage: BirthdayStage, count: number, thresholdSeen: boolean) => {
  if (stage === 'simulating' || stage === 'explaining') {
    return '시뮬레이션이 시작되면 마지막 해설과 유래는 오버레이 안에서 이어집니다.'
  }
  if (count === 0) {
    return '천천히 한 명씩 보거나, 조금 더 빠르게 장면을 진행할 수 있습니다.'
  }
  if (!thresholdSeen) {
    return '지금은 아직 체험 구간입니다. 설명은 뒤로 미루고, 당신의 고정관념이 언제 깨지는지만 먼저 확인해보세요.'
  }
  return '이제 시뮬레이션을 시작하면, 반복 결과 위에서 해석과 유래가 순서대로 열립니다.'
}

const getSceneStatement = (stage: BirthdayStage, count: number, duplicateCount: number) => {
  if (stage === 'simulating') return '23명을 계속 다시 불러들이며, 충돌이 얼마나 자주 나타나는지 확인합니다.'
  if (stage === 'explaining') return '이제 장면은 끝났고, 남은 것은 구조를 읽는 일입니다.'
  if (count === 0) return '몇 명쯤 모이면 같은 생일은 시작될까요?'
  if (duplicateCount > 0) return '방은 아직 작아 보이지만, 같은 날짜는 벌써 서로를 찾아냈습니다.'
  if (count < BIRTHDAY_THRESHOLD) return '아직 조용해 보여도, 서로를 비교할 수 있는 조합은 멈추지 않고 늘어납니다.'
  return '이제 겨우 23명인데, 겹칠 확률은 이미 절반을 넘습니다.'
}

const BirthdayIntroModal = ({ open, onStart }: { open: boolean; onStart: () => void }) => (
  <Modal open={open} panelClassName="max-w-2xl md:max-w-3xl">
    <div className="birthday-problem__modal">
      <p className="birthday-problem__modal-eyebrow font-cinzel">— The Birthday Problem —</p>
      <p className="birthday-problem__modal-title">
        몇 명쯤 모이면,<br />
        같은 생일은 시작될까요?
      </p>
      <div className="birthday-problem__modal-list">
        <p>사람을 한 명씩 방 안에 불러옵니다.</p>
        <p>같은 생일이 언제 처음 모습을 드러내는지 지켜봅니다.</p>
        <p>당신이 예상한 순간과 실제 순간이 같은지 확인합니다.</p>
      </div>
      <p className="birthday-problem__modal-copy">
        답은 먼저 말하지 않습니다. 지금은 설명보다 감각을 먼저 믿어보세요.
      </p>
      <div className="birthday-problem__modal-actions">
        <button type="button" className="birthday-problem__button" onClick={onStart}>
          시작하기
        </button>
      </div>
    </div>
  </Modal>
)

const BirthdayThresholdModal = ({
  open,
  onDismiss,
  onStartSimulation,
}: {
  open: boolean
  onDismiss: () => void
  onStartSimulation: () => void
}) => (
  <Modal open={open} panelClassName="max-w-2xl md:max-w-3xl">
    <div className="birthday-problem__modal">
      <p className="birthday-problem__modal-eyebrow font-cinzel">— 잠깐 —</p>
      <p className="birthday-problem__modal-title">
        이제 겨우 23명인데,<br />
        이미 절반을 넘었습니다.
      </p>
      <div className="birthday-problem__modal-stats">
        <div>
          <span className="font-cinzel">PEOPLE</span>
          <strong>23</strong>
        </div>
        <div>
          <span className="font-cinzel">PAIRS</span>
          <strong>253</strong>
        </div>
        <div>
          <span className="font-cinzel">CHANCE</span>
          <strong>50.7%</strong>
        </div>
      </div>
      <p className="birthday-problem__modal-copy">
        중요한 것은 생일 칸의 수가 아니라, 서로 부딪힐 기회가 얼마나 빨리 불어났느냐입니다.
      </p>
      <div className="birthday-problem__modal-actions">
        <button type="button" className="birthday-problem__button birthday-problem__button--muted" onClick={onDismiss}>
          조금 더 지켜보기
        </button>
        <button type="button" className="birthday-problem__button" onClick={onStartSimulation}>
          1000회 시뮬레이션
        </button>
      </div>
    </div>
  </Modal>
)

const BirthdaySimulationOverlay = ({
  open,
  sampleSize,
  stage,
  simTotal,
  simHits,
  onGoHome,
  onRestart,
}: {
  open: boolean
  sampleSize: number
  stage: BirthdayStage
  simTotal: number
  simHits: number
  onGoHome: () => void
  onRestart: () => void
}) => {
  const [slideIndex, setSlideIndex] = useState(0)
  const { simulateBatch, finishSimulation } = useBirthdayProblemStore((state) => state.actions)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!open) return
    if (stage !== 'simulating') return

    setSlideIndex(0)
    intervalRef.current = setInterval(() => {
      const remaining = TOTAL_SIM_RUNS - useBirthdayProblemStore.getState().simTotal
      const step = Math.min(BATCH_SIZE, remaining)

      simulateBatch(step)

      if (remaining <= BATCH_SIZE) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        finishSimulation()
      }
    }, INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [open, stage, simulateBatch, finishSimulation])

  const slide = NOTE_SLIDES[slideIndex]
  const progress = Math.min(simTotal, TOTAL_SIM_RUNS)
  const collisionRate = simTotal > 0 ? Math.round((simHits / simTotal) * 1000) / 10 : 0
  const misses = simTotal - simHits
  const missRate = simTotal > 0 ? Math.round((misses / simTotal) * 1000) / 10 : 0
  const isRunning = stage === 'simulating'
  const isLast = slideIndex === NOTE_SLIDES.length - 1

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="birthday-problem__simulation"
        >
          <div className="birthday-problem__simulation-panel">
            <div className="birthday-problem__simulation-header">
              <p className="birthday-problem__modal-eyebrow font-cinzel">— Simulation —</p>
              <p className="birthday-problem__simulation-count">
                {progress}
                <span> / {TOTAL_SIM_RUNS}</span>
              </p>
              <p className="birthday-problem__simulation-copy">
                {sampleSize}명을 계속 다시 불러들였을 때, 얼마나 자주 생일이 겹쳤는지 확인합니다.
              </p>
              <div className="birthday-problem__simulation-track">
                <motion.div
                  className="birthday-problem__simulation-bar"
                  animate={{ width: `${(progress / TOTAL_SIM_RUNS) * 100}%` }}
                  transition={{ duration: 0.12 }}
                />
              </div>
            </div>

            <div className="birthday-problem__simulation-rates">
              <div className="birthday-problem__simulation-rate is-hit">
                <span className="font-cinzel">MATCH</span>
                <strong>{collisionRate}%</strong>
                <p>{simHits}번 겹침</p>
              </div>
              <div className="birthday-problem__simulation-rate">
                <span className="font-cinzel">NO MATCH</span>
                <strong>{missRate}%</strong>
                <p>{misses}번 불일치</p>
              </div>
            </div>

            {!isRunning && progress >= TOTAL_SIM_RUNS && (
              <div className="birthday-problem__simulation-notes">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slide.key}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: 0.22 }}
                    className="birthday-problem__simulation-slide"
                  >
                    {slide.render()}
                  </motion.div>
                </AnimatePresence>

                <div className="birthday-problem__simulation-nav">
                  <button
                    type="button"
                    className="birthday-problem__simulation-link"
                    onClick={() => setSlideIndex((current) => Math.max(0, current - 1))}
                    disabled={slideIndex === 0}
                  >
                    ← 이전
                  </button>
                  <div className="birthday-problem__simulation-dots">
                    {NOTE_SLIDES.map((item, index) => (
                      <span key={item.key} className={index === slideIndex ? 'is-active' : ''} />
                    ))}
                  </div>
                  <button
                    type="button"
                    className={`birthday-problem__simulation-link ${isLast ? 'is-muted' : ''}`}
                    onClick={() => {
                      if (!isLast) setSlideIndex((current) => current + 1)
                    }}
                    disabled={isLast}
                  >
                    {isLast ? '끝' : '다음 →'}
                  </button>
                </div>
              </div>
            )}

            {!isRunning && (
              <div className="birthday-problem__simulation-actions">
                <button type="button" className="birthday-problem__button birthday-problem__button--muted" onClick={onGoHome}>
                  홈으로
                </button>
                <button type="button" className="birthday-problem__button" onClick={onRestart}>
                  처음부터 다시
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export const BirthdayProblemPage = () => {
  const navigate = useNavigate()
  const [showIntro, setShowIntro] = useState(true)
  const sessionId = useBirthdayProblemStore((state) => state.sessionId)
  const stage = useBirthdayProblemStore((state) => state.stage)
  const thresholdSeen = useBirthdayProblemStore((state) => state.thresholdSeen)
  const participants = useBirthdayProblemStore((state) => state.participants)
  const simulationSampleSize = useBirthdayProblemStore((state) => state.simulationSampleSize)
  const simTotal = useBirthdayProblemStore((state) => state.simTotal)
  const simHits = useBirthdayProblemStore((state) => state.simHits)
  const { addPerson, fillToThreshold, dismissThreshold, startSimulation, restartAll } = useBirthdayProblemStore((state) => state.actions)

  const dayMap = new Map<number, number[]>()
  participants.forEach((participant) => {
    const ids = dayMap.get(participant.dayOfYear) ?? []
    ids.push(participant.id)
    dayMap.set(participant.dayOfYear, ids)
  })

  const duplicateDays = [...dayMap.entries()].filter(([, ids]) => ids.length > 1)
  const duplicateSet = new Set(duplicateDays.map(([day]) => day))
  const duplicateColors = new Map(
    duplicateDays.map(([day], index) => [day, DUPLICATE_GROUP_COLORS[index % DUPLICATE_GROUP_COLORS.length]]),
  )
  const participantCount = participants.length
  const pairCount = getPairCount(participantCount)
  const exactProbability = getExactCollisionProbability(participantCount)
  const sceneParticipants = participants
  const stageMessage = getStageMessage(stage, participantCount, duplicateDays.length)
  const thresholdReached = participantCount >= BIRTHDAY_THRESHOLD
  const collisionRate = simTotal > 0 ? (simHits / simTotal) * 100 : 0
  const showChance = thresholdSeen || stage === 'threshold' || stage === 'simulating' || stage === 'explaining'
  const roomHeadline = getRoomHeadline(stage, participantCount, duplicateDays.length)
  const roomCopy = getRoomCopy(stage, participantCount, duplicateDays.length, thresholdSeen)
  const controlHint = getControlHint(stage, participantCount, thresholdSeen)
  const sceneStatement = getSceneStatement(stage, participantCount, duplicateDays.length)
  const canStartSimulation = thresholdSeen && thresholdReached && stage === 'gather'
  const fillButtonLabel = thresholdSeen || thresholdReached ? '문턱 도달' : '빠르게 진행하기'
  const roomZoom = getRoomZoom(participantCount)
  const collisionSummary =
    duplicateDays.length > 0
      ? duplicateDays
          .slice(0, 2)
          .map(([day, ids]) => {
            const date = getMonthDay(day)
            return `${String(date.month).padStart(2, '0')}/${String(date.day).padStart(2, '0')} · ${ids.length}명`
          })
          .join(' / ')
      : '아직 같은 생일은 나타나지 않았습니다.'

  const handleGoHome = () => {
    setShowIntro(true)
    restartAll()
    navigate('/')
  }

  const handleRestart = () => {
    setShowIntro(true)
    restartAll()
  }

  return (
    <div className="birthday-problem">
      <div className="birthday-problem__noise" aria-hidden />
      <div className="birthday-problem__grid" aria-hidden />
      <div className="birthday-problem__glow birthday-problem__glow--left" aria-hidden />
      <div className="birthday-problem__glow birthday-problem__glow--right" aria-hidden />
      <div className="birthday-problem__orbit birthday-problem__orbit--one" aria-hidden />
      <div className="birthday-problem__orbit birthday-problem__orbit--two" aria-hidden />

      <div className="birthday-problem__shell">
        <button type="button" className="birthday-problem__home font-cinzel" onClick={handleGoHome}>
          HOME
        </button>

        <main className="birthday-problem__experience">
          <section className="birthday-problem__room">
            <div
              className="birthday-problem__room-stage"
              style={{ ['--room-zoom' as const]: roomZoom } as CSSProperties}
            >
              <div className="birthday-problem__scene-shade birthday-problem__scene-shade--warm" aria-hidden />
              <div className="birthday-problem__scene-shade birthday-problem__scene-shade--cool" aria-hidden />
              <div className="birthday-problem__scene-ring birthday-problem__scene-ring--one" aria-hidden />
              <div className="birthday-problem__scene-ring birthday-problem__scene-ring--two" aria-hidden />
              <div className="birthday-problem__scene-core" aria-hidden />
              <div className="birthday-problem__room-vanishing" aria-hidden />
              <div className="birthday-problem__room-floor" aria-hidden />
              <div className="birthday-problem__room-radial" aria-hidden />

              <AnimatePresence>
                {sceneParticipants.map((participant, index) => {
                  const position = getScenePosition(index)
                  const date = getMonthDay(participant.dayOfYear)
                  const isDuplicate = duplicateSet.has(participant.dayOfYear)
                  const duplicateColor = isDuplicate ? duplicateColors.get(participant.dayOfYear) : null
                  const depth = Math.max(0, 100 - position.y)

                  return (
                    <div
                      key={participant.id}
                      className="birthday-problem__guest-anchor"
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                        zIndex: Math.round(position.y * 10),
                      }}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.72, y: 28 }}
                        animate={{ opacity: 1, scale: position.scale, y: 0 }}
                        exit={{ opacity: 0, scale: 0.72, y: 16 }}
                        transition={{ duration: 0.28, delay: Math.min(index * 0.018, 0.18) }}
                        className={`birthday-problem__guest ${isDuplicate ? 'is-duplicate' : ''}`}
                        style={
                          {
                            ['--guest-rotate' as const]: `${position.rotate}deg`,
                            ['--guest-depth' as const]: `${depth}px`,
                            ...(duplicateColor
                              ? {
                                  ['--birthday-duplicate-border' as const]: duplicateColor.border,
                                  ['--birthday-duplicate-glow' as const]: duplicateColor.glow,
                                  ['--birthday-duplicate-fill' as const]: duplicateColor.fill,
                                  ['--birthday-duplicate-accent' as const]: duplicateColor.accent,
                                }
                              : {}),
                          } as CSSProperties
                        }
                      >
                        <span className="birthday-problem__guest-shadow" aria-hidden />
                        <span className="birthday-problem__guest-glow" aria-hidden />
                        <span className="birthday-problem__guest-aura" aria-hidden />
                        <span className="birthday-problem__guest-silhouette" aria-hidden>
                          <span className="birthday-problem__guest-head" />
                          <span className="birthday-problem__guest-torso" />
                          <span className="birthday-problem__guest-legs" />
                        </span>
                        <span className="birthday-problem__guest-label font-cinzel">
                          GUEST {String(participant.id).padStart(2, '0')}
                        </span>
                        <span className="birthday-problem__guest-date">
                          {String(date.month).padStart(2, '0')}/{String(date.day).padStart(2, '0')}
                        </span>
                      </motion.div>
                    </div>
                  )
                })}
              </AnimatePresence>

              {participantCount === 0 && (
                <div className="birthday-problem__scene-empty">
                  <p className="font-cinzel">THE ROOM IS STILL EMPTY</p>
                  <span>사람을 한 명씩 불러오며, 겹침이 시작되는 순간을 지켜보세요.</span>
                </div>
              )}
            </div>

            <div className="birthday-problem__prompt birthday-problem__prompt--floating">
              <p className="birthday-problem__prompt-eyebrow font-cinzel">Birthday Problem</p>
              <h1 className="birthday-problem__prompt-name">생일 문제</h1>
              <p className="birthday-problem__prompt-title">{stageMessage}</p>
            </div>

            <div className="birthday-problem__scene-metrics">
              <div>
                <span className="font-cinzel">PEOPLE</span>
                <strong>{participantCount}</strong>
              </div>
              <div>
                <span className="font-cinzel">PAIRS</span>
                <strong>{pairCount}</strong>
              </div>
              <div>
                <span className="font-cinzel">CHANCE</span>
                <strong>{showChance ? `${(exactProbability * 100).toFixed(1)}%` : 'LOCK'}</strong>
              </div>
            </div>
            <section className="birthday-problem__dock">
              <div className="birthday-problem__dock-card birthday-problem__dock-card--reading">
                <p className="birthday-problem__sidebar-eyebrow font-cinzel">Current Room</p>
                <h2 className="birthday-problem__sidebar-title">{roomHeadline}</h2>
                <p className="birthday-problem__sidebar-copy">{roomCopy}</p>
                <p className="birthday-problem__sidebar-copy birthday-problem__sidebar-copy--soft">{sceneStatement}</p>
                <div className="birthday-problem__room-stats">
                  <div>
                    <span className="font-cinzel">Guests</span>
                    <strong>{participantCount}</strong>
                  </div>
                  <div>
                    <span className="font-cinzel">Pairs</span>
                    <strong>{pairCount}</strong>
                  </div>
                  <div>
                    <span className="font-cinzel">Collision</span>
                    <strong>{collisionSummary}</strong>
                  </div>
                </div>
              </div>

              <div className="birthday-problem__dock-card birthday-problem__dock-card--controls">
                <p className="birthday-problem__sidebar-eyebrow font-cinzel">Control</p>
                <div className="birthday-problem__controls birthday-problem__controls--inline">
                  <button type="button" className="birthday-problem__button" onClick={addPerson}>
                    한 명 추가
                  </button>
                  <button
                    type="button"
                    className="birthday-problem__button birthday-problem__button--muted"
                    onClick={fillToThreshold}
                    disabled={thresholdReached}
                  >
                    {fillButtonLabel}
                  </button>
                  <button
                    type="button"
                    className="birthday-problem__button birthday-problem__button--muted"
                    onClick={startSimulation}
                    disabled={!canStartSimulation}
                  >
                    1000회 시뮬레이션
                  </button>
                  <button type="button" className="birthday-problem__button birthday-problem__button--muted" onClick={handleRestart}>
                    처음부터 다시
                  </button>
                </div>
                <p className="birthday-problem__sidebar-copy birthday-problem__sidebar-copy--soft">{controlHint}</p>
                {simTotal > 0 && (
                  <div className="birthday-problem__live-rate">
                    <span className="font-cinzel">LATEST RUN</span>
                    <strong>{collisionRate.toFixed(1)}%</strong>
                    <p>{simTotal}번 중 {simHits}번 겹침</p>
                  </div>
                )}
              </div>
            </section>
          </section>
        </main>
      </div>

      <BirthdayIntroModal
        open={showIntro && stage === 'gather' && participantCount === 0}
        onStart={() => setShowIntro(false)}
      />

      <BirthdayThresholdModal
        open={stage === 'threshold'}
        onDismiss={dismissThreshold}
        onStartSimulation={startSimulation}
      />

      <BirthdaySimulationOverlay
        key={sessionId}
        open={stage === 'simulating' || stage === 'explaining'}
        sampleSize={simulationSampleSize}
        stage={stage}
        simTotal={simTotal}
        simHits={simHits}
        onGoHome={handleGoHome}
        onRestart={handleRestart}
      />
    </div>
  )
}
