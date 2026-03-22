import { motion, AnimatePresence } from 'framer-motion'
import { useMontyHallStore } from '../model/store'

export const MontyHallOverlay = () => {
  const stage = useMontyHallStore((s) => s.stage)
  const selectedDoor = useMontyHallStore((s) => s.selectedDoor)
  const totalPlays = useMontyHallStore((s) => s.totalPlays)
  const switchWins = useMontyHallStore((s) => s.switchWins)
  const stayWins = useMontyHallStore((s) => s.stayWins)
  const { decideSwitchOrStay, reset } = useMontyHallStore((s) => s.actions)

  const showCognitiveBias = totalPlays === 5 && stage === 'pick'

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">

      {/* 상단 안내 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="text-center text-cyan-400 text-sm tracking-widest"
        >
          {stage === 'pick' && '문을 선택하세요'}
          {stage === 'reveal' && '진행자가 꽝을 공개했습니다. 바꾸시겠습니까?'}
          {stage === 'result' && '결과를 확인하세요'}
        </motion.div>
      </AnimatePresence>

      {/* 바꾸기 / 유지 버튼 */}
      <AnimatePresence>
        {stage === 'reveal' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-4 justify-center pointer-events-auto"
          >
            <button
              onClick={() => decideSwitchOrStay(true)}
              className="px-6 py-3 border border-cyan-400 text-cyan-400 rounded-xl hover:bg-cyan-400/10 transition-all"
            >
              바꾸기
            </button>
            <button
              onClick={() => decideSwitchOrStay(false)}
              className="px-6 py-3 border border-cyan-800 text-cyan-700 rounded-xl hover:bg-cyan-900/20 transition-all"
            >
              유지
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 결과 + 통계 */}
      <AnimatePresence>
        {stage === 'result' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto flex flex-col items-center gap-4"
          >
            {/* 통계 바 */}
            {totalPlays > 0 && (
              <div className="w-full max-w-sm bg-black/60 backdrop-blur border border-cyan-900 rounded-xl p-4 text-xs text-cyan-500 space-y-2">
                <div className="flex justify-between">
                  <span>바꿔서 승리</span>
                  <span>{switchWins} / {totalPlays} ({Math.round(switchWins / totalPlays * 100)}%)</span>
                </div>
                <div className="h-1.5 bg-cyan-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full transition-all duration-500"
                    style={{ width: `${(switchWins / totalPlays) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between">
                  <span>유지해서 승리</span>
                  <span>{stayWins} / {totalPlays} ({Math.round(stayWins / totalPlays * 100)}%)</span>
                </div>
                <div className="h-1.5 bg-cyan-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-700 rounded-full transition-all duration-500"
                    style={{ width: `${(stayWins / totalPlays) * 100}%` }}
                  />
                </div>
              </div>
            )}
            <button
              onClick={reset}
              className="px-6 py-3 border border-cyan-400 text-cyan-400 rounded-xl hover:bg-cyan-400/10 transition-all pointer-events-auto"
            >
              다시 하기
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 인지 부조화 모달 (5회 후) */}
      <AnimatePresence>
        {showCognitiveBias && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-auto"
          >
            <div className="bg-black/70 backdrop-blur-md border border-cyan-800 rounded-2xl p-8 max-w-sm text-center space-y-4">
              <p className="text-cyan-300 text-lg leading-relaxed">
                당신의 직관은 50:50이라고<br />속삭이고 있지 않나요?
              </p>
              <p className="text-cyan-600 text-sm">진실은 다릅니다.</p>
              <button
                onClick={() => {/* TODO: 확률 해체 시각화 트리거 */}}
                className="px-6 py-3 bg-cyan-500/20 border border-cyan-400 text-cyan-300 rounded-xl hover:bg-cyan-400/30 transition-all"
              >
                진실 보기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
