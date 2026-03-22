import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMontyHallStore } from '../model/store'
import { SceneCanvas } from '@/shared/three/SceneCanvas'
import { MontyHallScene } from './MontyHallScene'
import { MontyHallOverlay } from './MontyHallOverlay'
import { DoorPositionBridge } from './DoorPositionBridge'
import { SimulationOverlay } from './SimulationOverlay'

export const MontyHallPage = () => {
  const [doorPositions, setDoorPositions] = useState<{ x: number; y: number }[]>([])
  const stage = useMontyHallStore((s) => s.stage)
  const selectedDoor = useMontyHallStore((s) => s.selectedDoor)
  const isSimulated = useMontyHallStore((s) => s.isSimulated)
  const revealedDoor = useMontyHallStore((s) => s.revealedDoor)

  const handlePositionUpdate = useCallback((positions: { x: number; y: number }[]) => {
    setDoorPositions(positions)
  }, [])

  // 남은 닫힌 문 (선택도 아니고 꽝도 아닌)
  const remainingDoor = [0, 1, 2].find((d) => d !== selectedDoor && d !== revealedDoor)
  const showLabels = stage === 'reveal' && selectedDoor !== null && revealedDoor !== null

  return (
    <div className="w-screen h-screen relative bg-[#080818]">
      <SceneCanvas>
        <MontyHallScene />
        <DoorPositionBridge onUpdate={handlePositionUpdate} />
      </SceneCanvas>

      <MontyHallOverlay />

      {/* 시뮬레이션 모드 */}
      <AnimatePresence>
        {(stage === 'simulating' || (stage === 'result' && isSimulated)) && <SimulationOverlay />}
      </AnimatePresence>

      {/* 확률 라벨 오버레이 */}
      <AnimatePresence>
        {showLabels && doorPositions.length === 3 && (
          <>
            {/* 선택한 문: 33.3% */}
            <motion.div
              key="selected-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute pointer-events-none text-center"
              style={{
                left: doorPositions[selectedDoor!].x,
                top: doorPositions[selectedDoor!].y,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="text-cyan-600 text-xs tracking-widest mb-0.5 font-cinzel">YOUR CHOICE</div>
              <div className="text-cyan-400 text-2xl font-bold font-cinzel">33.3%</div>
            </motion.div>

            {/* 꽝 문 */}
            <motion.div
              key="revealed-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute pointer-events-none text-center"
              style={{
                left: doorPositions[revealedDoor!].x,
                top: doorPositions[revealedDoor!].y,
                transform: 'translateX(-50%)',
              }}
            >
              <div className="text-red-700/80 text-xs tracking-[0.3em] font-cinzel">VOID</div>
            </motion.div>

            {/* 남은 문: 66.6% */}
            {remainingDoor !== undefined && (
              <motion.div
                key="remaining-label"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute pointer-events-none text-center"
                style={{
                  left: doorPositions[remainingDoor].x,
                  top: doorPositions[remainingDoor].y,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="text-cyan-300 text-xs tracking-widest mb-0.5 font-cinzel">SWITCH</div>
                <div className="text-cyan-300 text-2xl font-bold font-cinzel">66.6%</div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
