import { SceneCanvas } from '@/shared/three/SceneCanvas'
import { MontyHallScene } from '@/features/monty-hall/ui/MontyHallScene'

export const MontyHallPage = () => (
  <div className="w-screen h-screen relative bg-[#050510]">
    <SceneCanvas>
      <MontyHallScene />
    </SceneCanvas>
    {/* HTML 오버레이 UI는 여기에 absolute로 올림 */}
  </div>
)
