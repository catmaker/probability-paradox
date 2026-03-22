import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useMontyHallStore } from '../model/store'
import { GhostButton } from '@/shared/ui/GhostButton'
import { InfoTooltip } from '@/shared/ui/InfoTooltip'

const TOTAL = 1000
const INTERVAL_MS = 55
const BATCH_SIZE = 10

/* ── 문 아이콘 ── */
const DoorIcon = ({ label, glow, dead }: { label: string; glow?: boolean; dead?: boolean }) => (
  <div
    className={`rounded-lg border text-center ${dead ? 'border-cyan-900/30 bg-cyan-950/20' : glow ? 'border-cyan-400 bg-cyan-900/40' : 'border-cyan-800/50 bg-cyan-950/40'}`}
    style={{ width: 56, padding: '0.5rem 0', position: 'relative' }}
  >
    {dead && (
      <span className="absolute inset-0 flex items-center justify-center text-red-500/60 text-2xl font-bold">✕</span>
    )}
    <p className={`text-lg ${dead ? 'opacity-20' : ''}`}>🚪</p>
    <p className={`text-xs font-cinzel font-bold ${glow ? 'text-cyan-300' : dead ? 'text-cyan-900' : 'text-cyan-500'}`}>{label}</p>
  </div>
)

/* ── 경우의 수 테이블 셀 ── */
const Cell = ({ children, head, highlight }: { children: React.ReactNode; head?: boolean; highlight?: 'win' | 'lose' }) => (
  <td
    className={`text-xs text-center ${head ? 'text-cyan-500 font-cinzel font-bold' : highlight === 'win' ? 'text-cyan-300 font-bold' : highlight === 'lose' ? 'text-red-400/70' : 'text-cyan-600'}`}
    style={{ padding: '0.3rem 0.4rem', borderBottom: '1px solid #0c4a6e30' }}
  >
    {children}
  </td>
)

/* ── 슬라이드 데이터 ── */
const slides = [
  {
    key: 'table',
    render: () => (
      <>
        <p className="text-cyan-400 text-xs font-cinzel tracking-widest text-center">1 — 진짜 핵심은 첫 선택</p>
        <p className="text-cyan-500 text-xs text-center" style={{ marginTop: '0.25rem' }}>고요히 1번 문을 먼저 골랐다고 가정해봅시다.</p>
        <table className="w-full" style={{ marginTop: '0.6rem', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <Cell head> </Cell>
              <Cell head>1번</Cell>
              <Cell head>2번</Cell>
              <Cell head>3번</Cell>
              <Cell head>결과</Cell>
            </tr>
          </thead>
          <tbody>
            <tr>
              <Cell head>경우1</Cell>
              <Cell highlight="win">★</Cell>
              <Cell>✕</Cell>
              <Cell>✕</Cell>
              <Cell highlight="lose">유지 시 승</Cell>
            </tr>
            <tr>
              <Cell head>경우2</Cell>
              <Cell>✕</Cell>
              <Cell highlight="win">★</Cell>
              <Cell>✕</Cell>
              <Cell highlight="win">바꾸면 승</Cell>
            </tr>
            <tr>
              <Cell head>경우3</Cell>
              <Cell>✕</Cell>
              <Cell>✕</Cell>
              <Cell highlight="win">★</Cell>
              <Cell highlight="win">바꾸면 승</Cell>
            </tr>
          </tbody>
        </table>
        <p className="text-cyan-600 text-xs text-center" style={{ marginTop: '0.4rem' }}>
          ★ = 정답 &nbsp; ✕ = 꽝
        </p>
        <p className="text-cyan-300 text-xs text-center font-bold leading-relaxed" style={{ marginTop: '0.3rem' }}>
          처음 선택이 빗나갈 확률은 이미 2/3.<br />
          그래서 남은 한 문은 생각보다 무거운 확률을 품고 있습니다.
        </p>
      </>
    ),
  },
  {
    key: 'bias',
    render: () => (
      <>
        <p className="text-cyan-400 text-xs font-cinzel tracking-widest text-center">2 — 왜 끝내 반반처럼 느껴질까?</p>
        <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/30" style={{ marginTop: '0.7rem', padding: '0.9rem 1rem' }}>
          <p className="text-cyan-300 text-xs font-bold text-center">우리 뇌가 자주 하는 착각</p>
          <div className="text-cyan-500 text-xs leading-relaxed" style={{ marginTop: '0.55rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <p>두 개만 남은 장면은 고요해서, 확률도 반씩 나뉘어 보입니다.</p>
            <p>처음 고른 문을 지키는 쪽이 덜 아플 것처럼 느껴지기도 합니다.</p>
            <p>하지만 진행자의 제거는 우연이 아니라, 정답을 피한 선택입니다.</p>
          </div>
        </div>
        <p className="text-cyan-600 text-xs text-center leading-relaxed" style={{ marginTop: '0.65rem' }}>
          이 퍼즐은 확률 문제이면서 동시에<br />
          <span className="text-cyan-300 font-bold">직관이 조용히 미끄러지는 심리 문제</span>이기도 합니다.
        </p>
      </>
    ),
  },
  {
    key: 'transfer',
    render: () => (
      <>
        <p className="text-cyan-400 text-xs font-cinzel tracking-widest text-center">3 — 사라진 것처럼 보이는 2/3</p>
        <p className="text-cyan-500 text-xs text-center leading-relaxed" style={{ marginTop: '0.35rem' }}>
          처음 선택한 문은 끝까지 <span className="text-cyan-300 font-bold">1/3</span>입니다.<br />
          나머지 두 문 묶음은 시작부터 <span className="text-cyan-300 font-bold">2/3</span>였습니다.
        </p>
        <div className="flex justify-center items-end" style={{ gap: '1rem', marginTop: '0.75rem' }}>
          <div className="text-center">
            <DoorIcon label="1/3" glow />
            <p className="text-cyan-600 text-xs" style={{ marginTop: '0.25rem' }}>내 첫 선택</p>
          </div>
          <div className="text-center border border-dashed border-cyan-800/50 rounded-lg" style={{ padding: '0.4rem' }}>
            <div className="flex" style={{ gap: '0.25rem' }}>
              <DoorIcon label="" dead />
              <DoorIcon label="2/3" glow />
            </div>
            <p className="text-cyan-500 text-xs font-bold" style={{ marginTop: '0.25rem' }}>나머지 두 문 묶음</p>
          </div>
        </div>
        <p className="text-cyan-600 text-xs text-center leading-relaxed" style={{ marginTop: '0.6rem' }}>
          진행자가 꽝 하나를 치워도<br />
          <span className="text-cyan-300 font-bold">그 2/3는 공기처럼 흩어지지 않습니다.</span><br />
          남은 닫힌 문 하나가 조용히 그 무게를 이어받습니다.
        </p>
      </>
    ),
  },
  {
    key: 'letters',
    render: () => (
      <>
        <p className="text-cyan-400 text-xs font-cinzel tracking-widest text-center">4 — 이 문제는 세상을 소란스럽게 했다</p>
        <p className="text-cyan-500 text-xs text-center leading-relaxed" style={{ marginTop: '0.5rem' }}>
          1990년, 칼럼니스트 <span className="text-cyan-300 font-bold">Marilyn vos Savant</span>가<br />
          "바꾸는 편이 유리하다"고 답하자 긴 논쟁이 시작됐습니다.
        </p>
        <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/30" style={{ marginTop: '0.75rem', padding: '0.9rem 1rem' }}>
          <p className="text-cyan-300 text-lg font-bold text-center">약 10,000통</p>
          <p className="text-cyan-600 text-xs text-center leading-relaxed" style={{ marginTop: '0.35rem' }}>
            반박 편지가 쏟아졌고,<br />
            그중에는 박사 학위 소지자들도 적지 않았습니다.
          </p>
        </div>
        <p className="text-cyan-700 text-xs text-center leading-relaxed" style={{ marginTop: '0.6rem' }}>
          계산은 맞았지만, 사람의 직관은 그 문장을 쉽게 받아들이지 못했습니다.
        </p>
      </>
    ),
  },
  {
    key: 'erdos',
    render: () => (
      <>
        <p className="text-cyan-400 text-xs font-cinzel tracking-widest text-center">5 — 천재도 곧바로 믿지 못했다</p>
        <p className="text-cyan-500 text-xs text-center leading-relaxed" style={{ marginTop: '0.5rem' }}>
          이 혼란은 일반인에게만 머물지 않았습니다.
        </p>
        <div className="flex items-center justify-center gap-2" style={{ marginTop: '0.45rem' }}>
          <span className="text-cyan-500 text-xs">전설적인 수학자</span>
          <span className="inline-flex items-center gap-2 text-cyan-300 text-xs font-semibold">
            <span>Paul Erdős</span>
            <InfoTooltip
              content={
                <>
                  헝가리 출신의 전설적인 20세기 수학자입니다.
                  <br />
                  조합론과 수론 등 여러 분야에 큰 영향을 남겨, 이름만으로도 수학계의 상징처럼 통합니다.
                </>
              }
            />
          </span>
        </div>
        <p className="text-cyan-500 text-xs text-center leading-relaxed" style={{ marginTop: '0.45rem' }}>
          역시 시뮬레이션을 보기 전까지<br />
          이 결론을 선뜻 받아들이지 못한 것으로 알려져 있습니다.
        </p>
        <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/30" style={{ marginTop: '0.75rem', padding: '0.9rem 1rem' }}>
          <p className="text-cyan-300 text-sm font-bold text-center">직관은 똑똑함과 별개입니다</p>
          <p className="text-cyan-600 text-xs text-center leading-relaxed" style={{ marginTop: '0.4rem' }}>
            이 문제는 계산 능력보다<br />
            조건부 확률을 감각으로 받아들이기 어려운 지점에서 우리를 멈춰 세웁니다.
          </p>
        </div>
        <p className="text-cyan-700 text-xs text-center" style={{ marginTop: '0.55rem' }}>
          그래서 이 퍼즐은 오래 남습니다.
        </p>
      </>
    ),
  },
  {
    key: 'host',
    render: () => (
      <>
        <p className="text-cyan-400 text-xs font-cinzel tracking-widest text-center">6 — 현실의 몬티는 더 모호했다</p>
        <p className="text-cyan-500 text-xs text-center leading-relaxed" style={{ marginTop: '0.45rem' }}>
          이 퍼즐의 대답이 2/3가 되려면 규칙이 분명해야 합니다.<br />
          진행자는 <span className="text-cyan-300 font-bold">항상</span> 꽝을 열고,<br />
          <span className="text-cyan-300 font-bold">항상</span> 바꿀 기회를 줘야 합니다.
        </p>
        <p className="text-cyan-600 text-xs text-center leading-relaxed" style={{ marginTop: '0.65rem' }}>
          실제 TV 쇼에서는 그 규칙이 늘 고정된 것은 아니었습니다.<br />
          그래서 현실의 몬티는 퍼즐 속 몬티보다 한층 더 모호했습니다.
        </p>
        <p className="text-cyan-300 text-xs text-center font-bold leading-relaxed" style={{ marginTop: '0.6rem' }}>
          몬티홀은 확률 퍼즐이면서<br />
          "규칙이 흐려지면 답도 흐려지는 문제"이기도 합니다.
        </p>
      </>
    ),
  },
  {
    key: 'pigeon',
    render: () => (
      <>
        <p className="text-cyan-400 text-xs font-cinzel tracking-widest text-center">7 — 기묘한 비둘기 일화</p>
        <p className="text-cyan-500 text-xs text-center leading-relaxed" style={{ marginTop: '0.45rem' }}>
          반복 실험에서는 사람보다 비둘기가 더 빨리<br />
          "항상 바꾸기" 전략을 익힌다는 연구도 있습니다.
        </p>
        <div className="rounded-xl border border-cyan-900/40 bg-cyan-950/30" style={{ marginTop: '0.75rem', padding: '0.9rem 1rem' }}>
          <p className="text-cyan-300 text-sm font-bold text-center">인간은 자꾸 의미를 덧붙입니다</p>
          <p className="text-cyan-600 text-xs text-center leading-relaxed" style={{ marginTop: '0.35rem' }}>
            "이번엔 다를지도 몰라"<br />
            "처음 고른 걸 버리면 손해 같아"<br />
            같은 속삭임이 최적 전략을 방해합니다.
          </p>
        </div>
        <p className="text-cyan-300 text-xs text-center font-bold leading-relaxed" style={{ marginTop: '0.65rem' }}>
          너무 많이 의미를 부여해서 길을 잃는 문제.<br />
          그것이 몬티홀의 기묘함입니다.
        </p>
      </>
    ),
  },
]

export const SimulationOverlay = () => {
  const navigate = useNavigate()
  const simTotal = useMontyHallStore((s) => s.simTotal)
  const simSwitchWins = useMontyHallStore((s) => s.simSwitchWins)
  const simStayWins = useMontyHallStore((s) => s.simStayWins)
  const stage = useMontyHallStore((s) => s.stage)
  const { simulateBatch, stopSimulation, restartAll } = useMontyHallStore((s) => s.actions)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countRef = useRef(0)

  // 마운트 시 자동 시작 (카운트 초기화 후)
  useEffect(() => {
    useMontyHallStore.setState({ simTotal: 0, simSwitchWins: 0, simStayWins: 0 })
    countRef.current = 0
    intervalRef.current = setInterval(() => {
      const step = Math.min(BATCH_SIZE, TOTAL - countRef.current)
      simulateBatch(step)
      countRef.current += step
      if (countRef.current >= TOTAL) {
        clearInterval(intervalRef.current!)
        stopSimulation()
      }
    }, INTERVAL_MS)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [simulateBatch, stopSimulation])

  const isRunning = stage === 'simulating'
  const switchRate = simTotal > 0 ? Math.round(simSwitchWins / simTotal * 100) : 0
  const stayRate = simTotal > 0 ? Math.round(simStayWins / simTotal * 100) : 0
  const progress = Math.min(simTotal, TOTAL)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-black/90 backdrop-blur-md border border-cyan-800/60 rounded-2xl w-full max-w-sm mx-4" style={{ padding: '2rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* 헤더 */}
        <div className="text-center">
          <p className="text-cyan-500 text-xs font-cinzel tracking-[0.3em] uppercase">— 시뮬레이션 —</p>
          <p className="text-cyan-200 text-2xl font-cinzel font-bold" style={{ marginTop: '0.5rem' }}>
            {progress} <span className="text-cyan-700 text-base">/ {TOTAL}</span>
          </p>
          <p className="text-cyan-700 text-[11px] tracking-[0.22em]" style={{ marginTop: '0.35rem' }}>
            1,000번의 반복 속에서 패턴이 모습을 드러냅니다
          </p>
          {/* 전체 진행 바 */}
          <div className="h-1 bg-cyan-950 rounded-full overflow-hidden" style={{ marginTop: '0.5rem' }}>
            <motion.div
              className="h-full bg-cyan-800 rounded-full"
              animate={{ width: `${(progress / TOTAL) * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* 바꾸기 전략 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div className="flex justify-between text-xs">
            <span className="text-cyan-400 font-cinzel tracking-widest">바꾸기 전략</span>
            <span className="text-cyan-300 font-bold text-sm">{switchRate}%</span>
          </div>
          <div className="h-4 bg-cyan-950 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #0ea5e9, #22d3ee)' }}
              animate={{ width: `${switchRate}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <p className="text-cyan-700 text-xs text-right">{simSwitchWins}승 / {progress}회</p>
        </div>

        {/* 유지 전략 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div className="flex justify-between text-xs">
            <span className="text-cyan-800 font-cinzel tracking-widest">유지 전략</span>
            <span className="text-cyan-700 font-bold text-sm">{stayRate}%</span>
          </div>
          <div className="h-4 bg-cyan-950 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #1e3a5f, #1d4ed8)' }}
              animate={{ width: `${stayRate}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <p className="text-cyan-900 text-xs text-right">{simStayWins}승 / {progress}회</p>
        </div>

        {/* 완료 → 설명 슬라이드 */}
        {!isRunning && progress >= TOTAL && (
          <ExplainSlides switchRate={switchRate} stayRate={stayRate} />
        )}

        {/* 버튼 */}
        {!isRunning && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <GhostButton
              variant="muted"
              onClick={() => navigate('/')}
              className="flex-1 text-[12px] tracking-[0.16em] whitespace-nowrap"
              style={{ padding: '0.5rem 0.9rem' }}
            >
              홈으로
            </GhostButton>
            <GhostButton
              onClick={restartAll}
              className="flex-1 text-[12px] tracking-[0.12em] whitespace-nowrap"
              style={{ padding: '0.5rem 0.9rem' }}
            >
              ↩ 처음부터 다시
            </GhostButton>
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ── 설명 슬라이드 ── */
const ExplainSlides = ({ switchRate, stayRate }: { switchRate: number; stayRate: number }) => {
  const [step, setStep] = useState(0)
  const slide = slides[step]
  const isLast = step === slides.length - 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-cyan-900/50"
      style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
    >
      <div className="text-center">
        <p className="text-cyan-300 text-sm font-cinzel">
          바꾸기 {switchRate}% · 유지 {stayRate}%
        </p>
      </div>

      <div className="bg-cyan-950/40 border border-cyan-900/40 rounded-xl" style={{ padding: '1rem', minHeight: 180 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {slide.render()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 네비게이션 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="text-cyan-600 text-xs disabled:opacity-20"
        >← 이전</button>
        <div className="flex" style={{ gap: 4 }}>
          {slides.map((_, i) => (
            <div key={i} className={`rounded-full ${i === step ? 'bg-cyan-400' : 'bg-cyan-900'}`} style={{ width: 6, height: 6 }} />
          ))}
        </div>
        {!isLast ? (
          <button onClick={() => setStep((s) => s + 1)} className="text-cyan-400 text-xs">다음 →</button>
        ) : (
          <span className="text-cyan-700 text-xs">끝</span>
        )}
      </div>
    </motion.div>
  )
}
