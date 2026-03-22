import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useMontyHallStore } from '../model/store'
import { GhostButton } from '@/shared/ui/GhostButton'
import { Modal } from '@/shared/ui/Modal'

/* ── 멘트 풀 ── */
const pickMessages = [
  '어느 문이 당신을 부르고 있나요?',
  '이번엔 어디에 숨어있을까요?',
  '직감을 믿어보세요.',
  '세 개의 문. 하나의 정답.',
  '고르세요. 후회는 나중에.',
  '느낌이 오는 문이 있나요?',
  '운명의 문을 고르세요.',
  '이번엔 다를까요?',
  '같은 문을 또 고르시겠습니까?',
  '망설이면 질 수도 있습니다.',
]

const revealTiers = [
  ['진행자가 당신이 고르지 않은 문 중 꽝 하나를 제거했습니다.', '진행자가 일부러 꽝 문만 제거했습니다.', '문이 줄어든 게 아니라, 진행자가 꽝을 하나 걷어냈습니다.'],
  ['또 꽝이 제거됐습니다. 이 선택은 랜덤이 아닙니다.', '진행자는 정답을 알고 꽝만 치웁니다.', '왜 진행자는 늘 꽝만 없앨 수 있을까요?'],
  ['핵심은 문이 열린 게 아니라, 누가 제거했느냐입니다.', '진행자가 정답을 피해서 제거했다는 점이 중요합니다.', '그 제거는 정보입니다. 그냥 이벤트가 아닙니다.'],
  ['이제도 반반처럼 느껴지나요?', '문 하나가 사라졌는데, 확률도 반씩 나뉜 걸까요?', '진행자의 선택이 왜 중요한지 보이기 시작하나요?'],
]

const resultCommentTiers = [
  ['한 번 더 해보세요.', '아직 판단하기 이릅니다.'],
  ['슬슬 패턴이 보이나요?', '우연치고는 좀 그렇지 않나요?'],
  ['데이터는 거짓말하지 않습니다.', '숫자를 보세요. 느껴지나요?'],
  ['직관과 수학, 어느 쪽이 맞을까요?', '아직도 반반이라 생각하시나요?'],
]

const winMessages = ['정답입니다.', '맞혔군요.', '운이 좋았을까요, 실력이었을까요?', '이번엔 맞았습니다.', '축하합니다. 하지만 다음에도?']
const loseMessages = ['빗나갔습니다.', '아쉽군요.', '이번엔 운이 없었나요?', '틀렸습니다.', '선택이 빗나갔습니다.']

const pick = (arr: string[], i: number) => arr[i % arr.length]
const pickTier = (tiers: string[][], plays: number) => {
  const tier = Math.min(Math.floor(plays / 3), tiers.length - 1)
  return tiers[tier][plays % tiers[tier].length]
}

type IntuitionAnswer = 'fifty-fifty' | 'switch'

export const MontyHallOverlay = () => {
  const navigate = useNavigate()
  const [showIntro, setShowIntro] = useState(true)
  const [insightDismissed, setInsightDismissed] = useState(false)
  const [intuitionAnswers, setIntuitionAnswers] = useState<IntuitionAnswer[]>([])
  const [currentIntuition, setCurrentIntuition] = useState<{ round: number; answer: IntuitionAnswer } | null>(null)

  const stage = useMontyHallStore((s) => s.stage)
  const totalPlays = useMontyHallStore((s) => s.totalPlays)
  const switchWins = useMontyHallStore((s) => s.switchWins)
  const stayWins = useMontyHallStore((s) => s.stayWins)
  const lastWon = useMontyHallStore((s) => s.lastWon)
  const { decideSwitchOrStay, reset, restartAll, simulateOne } = useMontyHallStore((s) => s.actions)

  const intuitionChecks = intuitionAnswers.length
  const feltFiftyFifty = intuitionAnswers.filter((answer) => answer === 'fifty-fifty').length
  const sensedSwitchEdge = intuitionChecks - feltFiftyFifty
  const shouldAskIntuition = stage === 'reveal' && totalPlays === 1 && intuitionChecks === 0 && !insightDismissed
  const showInsightModal = stage === 'pick' && totalPlays >= 3 && intuitionChecks >= 1 && !insightDismissed
  const currentIntuitionAnswer = currentIntuition?.round === totalPlays ? currentIntuition.answer : null
  const canDecide = !shouldAskIntuition || currentIntuitionAnswer !== null
  const feltMostlyFiftyFifty = feltFiftyFifty >= Math.ceil(intuitionChecks / 2)
  const showTheoryHint = intuitionChecks >= 3 || insightDismissed || totalPlays >= 5

  const handleDecision = (doSwitch: boolean) => {
    if (shouldAskIntuition) {
      if (currentIntuitionAnswer === null) return
      setIntuitionAnswers((answers) => [...answers, currentIntuitionAnswer])
    }
    decideSwitchOrStay(doSwitch)
  }

  const handleReset = () => {
    setInsightDismissed(false)
    setIntuitionAnswers([])
    setCurrentIntuition(null)
    reset()
  }

  const handleSimulateTruth = () => {
    setInsightDismissed(true)
    simulateOne()
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between px-4" style={{ paddingTop: '2.5rem', paddingBottom: '2rem' }}>

      {/* 상단 안내 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${stage}-${totalPlays}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-center space-y-2"
        >
          <p className="text-cyan-500/60 text-sm tracking-[0.3em] uppercase font-cinzel">Monty Hall Paradox</p>
          <p className="text-cyan-300 text-xl tracking-widest font-cinzel">
            {stage === 'pick' && pick(pickMessages, totalPlays)}
            {stage === 'reveal' && pickTier(revealTiers, totalPlays)}
            {stage === 'result' && (lastWon ? pick(winMessages, totalPlays) : pick(loseMessages, totalPlays))}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* 바꾸기/유지 & 결과 */}
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div
            key="reveal-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex flex-col items-center gap-4 mb-8 w-full max-w-md"
          >
            {shouldAskIntuition && (
              <div className="w-full bg-black/60 backdrop-blur border border-cyan-900/50 rounded-xl text-center" style={{ padding: '1rem 1.1rem' }}>
                <p className="text-cyan-500 text-[11px] tracking-[0.3em] uppercase font-cinzel">Intuition Check</p>
                <p className="text-cyan-200 text-sm leading-relaxed" style={{ marginTop: '0.6rem' }}>
                  진행자가 꽝 문 하나를 제거했습니다.<br />
                  지금은 어떻게 느껴지나요?
                </p>
                <div className="grid grid-cols-2 gap-3" style={{ marginTop: '0.9rem' }}>
                  <GhostButton
                    type="button"
                    variant={currentIntuitionAnswer === 'fifty-fifty' ? 'primary' : 'muted'}
                    className="w-full"
                    onClick={() => setCurrentIntuition({ round: totalPlays, answer: 'fifty-fifty' })}
                  >
                    반반 같아요
                  </GhostButton>
                  <GhostButton
                    type="button"
                    variant={currentIntuitionAnswer === 'switch' ? 'primary' : 'muted'}
                    className="w-full"
                    onClick={() => setCurrentIntuition({ round: totalPlays, answer: 'switch' })}
                  >
                    바꾸기가 유리해요
                  </GhostButton>
                </div>
                <p className="text-cyan-700 text-[11px]" style={{ marginTop: '0.6rem' }}>
                  이번 한 번만 묻습니다.
                </p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <GhostButton
                onClick={() => handleDecision(true)}
                disabled={!canDecide}
                className="disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ⟳ 바꾸기
              </GhostButton>
              <GhostButton
                variant="muted"
                onClick={() => handleDecision(false)}
                disabled={!canDecide}
                className="disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✦ 유지
              </GhostButton>
            </div>
          </motion.div>
        )}
        {stage === 'result' && (
          <motion.div
            key="result-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto flex flex-col items-center gap-4 w-full max-w-sm mb-8"
          >
            {totalPlays > 0 && (
              <div className="w-full bg-black/60 backdrop-blur border border-cyan-900/50 rounded-xl text-xs text-cyan-500" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <p className="text-cyan-400 text-center text-xs font-cinzel tracking-widest" style={{ marginBottom: '0.5rem' }}>
                  {totalPlays < 3 ? '한 번 더 해보세요.' : pickTier(resultCommentTiers, totalPlays)}
                </p>
                {totalPlays > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>바꾸기 전략</span>
                      <span>{switchWins} / {totalPlays}회 ({Math.round(switchWins / totalPlays * 100)}%)</span>
                    </div>
                    <div className="h-1.5 bg-cyan-950 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full transition-all duration-500" style={{ width: `${(switchWins / totalPlays) * 100}%` }} />
                    </div>
                    <div className="flex justify-between" style={{ marginTop: '0.25rem' }}>
                      <span>유지 전략</span>
                      <span>{stayWins} / {totalPlays}회 ({Math.round(stayWins / totalPlays * 100)}%)</span>
                    </div>
                    <div className="h-1.5 bg-cyan-950 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-700 rounded-full transition-all duration-500" style={{ width: `${(stayWins / totalPlays) * 100}%` }} />
                    </div>
                    <p className="text-cyan-700 text-center text-[11px] leading-relaxed" style={{ marginTop: '0.5rem' }}>
                      {showTheoryHint ? (
                        <>
                          짧은 표본은 흔들려도 이 문제의 이론값은<br />
                          바꾸기 66.7% · 유지 33.3%입니다.
                        </>
                      ) : (
                        <>
                          아직은 결과가 흔들릴 수 있습니다.<br />
                          몇 판만 더 해보면 패턴이 보이기 시작합니다.
                        </>
                      )}
                    </p>
                  </>
                )}
              </div>
            )}
            {totalPlays >= 3 && (
              <GhostButton onClick={handleSimulateTruth} className="w-full max-w-xs">
                1,000회 시뮬레이션 보기
              </GhostButton>
            )}
            <div className="flex gap-3">
              <GhostButton variant="muted" onClick={() => navigate('/')}>홈으로</GhostButton>
              <GhostButton variant="muted" onClick={restartAll}>처음부터 다시</GhostButton>
              <GhostButton onClick={handleReset}>한 판 더 하기</GhostButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 직관 설명 모달 */}
      <Modal open={showInsightModal}>
        <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p className="text-cyan-500 text-xs font-cinzel tracking-[0.3em] uppercase">— 잠깐 —</p>
          <p className="text-cyan-200 text-xl font-cinzel leading-relaxed">
            {feltMostlyFiftyFifty ? (
              <>
                {intuitionChecks}번 중 {feltFiftyFifty}번,<br />
                반반처럼 느끼셨습니다.
              </>
            ) : (
              <>
                이미 눈치채고 계셨네요.<br />
                {sensedSwitchEdge}번은 바꾸기가 더 유리하다고 보셨습니다.
              </>
            )}
          </p>
          <p className="text-cyan-600 text-sm leading-relaxed">
            {feltMostlyFiftyFifty
              ? '하지만 이 문제는 공개 뒤에도 50:50이 아닙니다. 처음 고른 문은 1/3, 남은 한 문은 2/3를 가집니다.'
              : '맞습니다. 진행자가 꽝을 하나 치워도 처음 선택의 1/3은 그대로 남고, 나머지 2/3가 한 문으로 몰립니다.'}
          </p>
          <p className="text-cyan-700 text-xs leading-relaxed">
            운은 잠깐 흔들려도 구조는 흔들리지 않습니다.<br />
            1,000번을 돌리면 그 윤곽이 훨씬 또렷해집니다.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <GhostButton variant="muted" className="flex-1" onClick={() => setInsightDismissed(true)}>
              한 판 더 볼게요
            </GhostButton>
            <GhostButton className="flex-1" onClick={handleSimulateTruth}>
              ✦ 진실 보기
            </GhostButton>
          </div>
        </div>
      </Modal>

      {/* 인트로 모달 */}
      <Modal open={showIntro && stage === 'pick' && totalPlays === 0}>
        <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p className="text-cyan-500 text-xs font-cinzel tracking-[0.3em] uppercase">— The Monty Hall Paradox —</p>
          <p className="text-cyan-200 text-lg font-cinzel leading-relaxed">
            세 개의 문 뒤에<br />하나의 정답이 있습니다.
          </p>
          <div className="text-cyan-600 text-xs leading-relaxed" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <p>문 하나를 고르세요.</p>
            <p>진행자가 꽝 문 하나를 열어줍니다.</p>
            <p>선택을 바꿀 기회가 주어집니다.</p>
          </div>
          <p className="text-cyan-700 text-xs">바꾸는 것과 유지하는 것, 어느 쪽이 유리할까요?</p>
          <GhostButton className="w-full" onClick={() => setShowIntro(false)}>
            ✦ 시작하기
          </GhostButton>
        </div>
      </Modal>
    </div>
  )
}
