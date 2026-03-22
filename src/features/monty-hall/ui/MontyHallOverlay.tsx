import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  ['꽝이 하나 열렸습니다. 바꾸시겠습니까?', '진행자가 문을 열었습니다. 꽝이군요.', '하나가 탈락했습니다. 선택을 바꿀 수 있습니다.'],
  ['또 꽝을 열어줬군요. 친절하지 않나요?', '진행자는 항상 꽝을 엽니다. 눈치채셨나요?', '매번 꽝만 열리는 게 이상하지 않나요?'],
  ['진행자는 정답을 알고 있습니다.', '꽝을 여는 건 우연이 아닙니다.', '왜 진행자는 절대 정답을 열지 않을까요?'],
  ['패턴이 보이기 시작하나요?', '아직도 50:50이라 생각하시나요?', '숫자가 무언가를 말하고 있습니다.'],
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

export const MontyHallOverlay = () => {
  const [showIntro, setShowIntro] = useState(true)
  const [dismissedAt, setDismissedAt] = useState<number | null>(null)

  const stage = useMontyHallStore((s) => s.stage)
  const totalPlays = useMontyHallStore((s) => s.totalPlays)
  const switchWins = useMontyHallStore((s) => s.switchWins)
  const stayWins = useMontyHallStore((s) => s.stayWins)
  const switchPlays = useMontyHallStore((s) => s.switchPlays)
  const stayPlays = useMontyHallStore((s) => s.stayPlays)
  const lastWon = useMontyHallStore((s) => s.lastWon)
  const { decideSwitchOrStay, reset, simulateOne } = useMontyHallStore((s) => s.actions)

  // 바꾸기가 2승 이상 앞서거나, 10판 이상이면 무조건 트리거
  const showCognitiveBias = stage === 'pick'
    && (totalPlays >= 10 || (totalPlays >= 5 && switchWins - stayWins >= 2))
    && (dismissedAt === null || totalPlays >= dismissedAt + 3)

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
            className="flex gap-4 justify-center pointer-events-auto mb-8"
          >
            <GhostButton onClick={() => decideSwitchOrStay(true)}>⟳ 바꾸기</GhostButton>
            <GhostButton variant="muted" onClick={() => decideSwitchOrStay(false)}>✦ 유지</GhostButton>
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
                  </>
                )}
              </div>
            )}
            <GhostButton onClick={reset}>다시 도전하기</GhostButton>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 인지 부조화 모달 — 바꾸기가 앞서기 시작하면 */}
      <Modal open={showCognitiveBias}>
        <div className="text-center" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p className="text-cyan-500 text-xs font-cinzel tracking-[0.3em] uppercase">— 잠깐 —</p>
          <p className="text-cyan-200 text-xl font-cinzel leading-relaxed">
            {totalPlays}번을 해봤습니다.<br />
            바꾸기 {switchWins}승, 유지 {stayWins}승.<br />
            우연이라고 생각하시나요?
          </p>
          <p className="text-cyan-600 text-sm leading-relaxed">
            100번을 돌려보면 답이 보입니다.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <GhostButton variant="muted" className="flex-1" onClick={() => setDismissedAt(totalPlays)}>
              더 해볼게요
            </GhostButton>
            <GhostButton className="flex-1" onClick={simulateOne}>
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
