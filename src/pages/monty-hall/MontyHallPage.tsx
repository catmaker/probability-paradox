import { SceneCanvas } from '@/shared/three/SceneCanvas'
import { MontyHallScene } from '@/features/monty-hall/ui/MontyHallScene'
import { MontyHallOverlay } from '@/features/monty-hall/ui/MontyHallOverlay'

export const MontyHallPage = () => (
  <div className="w-screen h-screen relative bg-[#050510]">
    <SceneCanvas>
      <MontyHallScene />
    </SceneCanvas>
    <MontyHallOverlay />
  </div>
)
