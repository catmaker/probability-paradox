import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMontyHallStore } from '../model/store'
import { GhostButton } from '@/shared/ui/GhostButton'

const TOTAL = 100
const INTERVAL_MS = 50

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
        <p className="text-cyan-400 text-xs font-cinzel tracking-widest text-center">1 — 모든 경우의 수</p>
        <p className="text-cyan-500 text-xs text-center" style={{ marginTop: '0.25rem' }}>1번 문을 골랐다고 합시다.</p>
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
        <p className="text-cyan-300 text-xs text-center font-bold" style={{ marginTop: '0.3rem' }}>
          바꾸면 3번 중 2번 이깁니다.
        </p>
      </>
    ),
  },
  {
    key: 'why',
    render: () => (
      <>
        <p className="text-cyan-400 text-xs font-cinzel tracking-widest text-center">2 — 왜 50:50이 아닌가?</p>
        <p className="text-cyan-500 text-xs text-center leading-relaxed" style={{ marginTop: '0.4rem' }}>
          처음 선택이 정답일 확률은 <span className="text-cyan-300 font-bold">1/3</span>.<br />
          즉, 처음 선택이 꽝일 확률은 <span className="text-cyan-300 font-bold">2/3</span>.
        </p>
        <div className="flex justify-center items-end" style={{ gap: '1rem', marginTop: '0.75rem' }}>
          <div className="text-center">
            <DoorIcon label="1/3" glow />
            <p className="text-cyan-600 text-xs" style={{ marginTop: '0.25rem' }}>내 선택</p>
          </div>
          <div className="text-center border border-dashed border-cyan-800/50 rounded-lg" style={{ padding: '0.4rem' }}>
            <div className="flex" style={{ gap: '0.25rem' }}>
              <DoorIcon label="" dead />
              <DoorIcon label="2/3" glow />
            </div>
            <p className="text-cyan-500 text-xs font-bold" style={{ marginTop: '0.25rem' }}>나머지 그룹</p>
          </div>
        </div>
        <p className="text-cyan-600 text-xs text-center leading-relaxed" style={{ marginTop: '0.6rem' }}>
          진행자가 꽝을 열어도<br />
          <span className="text-cyan-300 font-bold">그룹의 2/3는 사라지지 않습니다.</span><br />
          남은 한 문이 2/3를 혼자 가집니다.
        </p>
      </>
    ),
  },
  {
    key: 'hundred',
    render: () => (
      <>
        <p className="text-cyan-400 text-xs font-cinzel tracking-widest text-center">3 — 문이 100개라면?</p>
        <p className="text-cyan-500 text-xs text-center leading-relaxed" style={{ marginTop: '0.25rem' }}>
          직관적으로도 명확해집니다.
        </p>
        <div className="flex flex-wrap justify-center" style={{ gap: 2, marginTop: '0.75rem', maxWidth: 260, margin: '0.75rem auto 0' }}>
          {Array.from({ length: 100 }, (_, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: 8, height: 14,
                background: i === 0 ? '#22d3ee' : i === 99 ? '#facc15' : '#0c4a6e30',
                border: i === 0 ? '1px solid #22d3ee' : i === 99 ? '1px solid #facc15' : '1px solid #0c4a6e50',
              }}
            />
          ))}
        </div>
        <p className="text-cyan-300 text-xs text-center leading-relaxed" style={{ marginTop: '0.75rem' }}>
          1개를 고르고, 진행자가 <span className="font-bold">98개</span> 꽝을 열었습니다.
        </p>
        <p className="text-cyan-200 text-xs text-center" style={{ marginTop: '0.25rem' }}>
          내 문 = <span className="font-bold">1%</span> · 남은 문 = <span className="font-bold text-yellow-400">99%</span>
        </p>
        <p className="text-cyan-600 text-xs text-center" style={{ marginTop: '0.5rem' }}>
          그래도 50:50이라고 하시겠습니까?
        </p>
      </>
    ),
  },
  {
    key: 'origin',
    render: () => (
      <>
        <p className="text-cyan-400 text-xs font-cinzel tracking-widest text-center">4 — 몬티 홀의 유래</p>
        <p className="text-cyan-500 text-xs text-center leading-relaxed" style={{ marginTop: '0.5rem' }}>
          미국 TV 게임쇼<br />
          <span className="text-cyan-300 font-bold font-cinzel">"Let's Make a Deal"</span><br />
          진행자 <span className="text-cyan-300 font-bold">몬티 홀</span>의 이름에서 유래.
        </p>
        <p className="text-cyan-600 text-xs text-center leading-relaxed" style={{ marginTop: '0.6rem' }}>
          1975년 수학 문제로 처음 제시되었고,<br />
          1990년 <span className="text-cyan-400">메릴린 보스 사반트</span>가<br />
          잡지 칼럼에서 "바꿔야 한다"고 답하자<br />
          수천 명의 박사들이 틀렸다고 항의했습니다.
        </p>
        <p className="text-cyan-300 text-xs text-center font-bold leading-relaxed" style={{ marginTop: '0.6rem' }}>
          하지만 그녀가 옳았습니다.
        </p>
        <p className="text-cyan-700 text-xs text-center" style={{ marginTop: '0.4rem' }}>
          직관은 틀릴 수 있습니다.<br />
          수학은 거짓말하지 않습니다.
        </p>
      </>
    ),
  },
]

export const SimulationOverlay = () => {
  const simTotal = useMontyHallStore((s) => s.simTotal)
  const simSwitchWins = useMontyHallStore((s) => s.simSwitchWins)
  const simStayWins = useMontyHallStore((s) => s.simStayWins)
  const stage = useMontyHallStore((s) => s.stage)
  const { simulateOne, stopSimulation, reset } = useMontyHallStore((s) => s.actions)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countRef = useRef(0)

  // 마운트 시 자동 시작 (카운트 초기화 후)
  useEffect(() => {
    useMontyHallStore.setState({ simTotal: 0, simSwitchWins: 0, simStayWins: 0 })
    countRef.current = 0
    intervalRef.current = setInterval(() => {
      simulateOne()
      countRef.current++
      if (countRef.current >= TOTAL) {
        clearInterval(intervalRef.current!)
        stopSimulation()
      }
    }, INTERVAL_MS)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

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
            <GhostButton onClick={reset} className="flex-1">↩ 처음으로</GhostButton>
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
