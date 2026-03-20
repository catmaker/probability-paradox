import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import type { ReactNode } from 'react'

interface SceneCanvasProps {
  children: ReactNode
  orbitControls?: boolean
}

// 모든 역설 씬이 공유하는 기본 캔버스
export const SceneCanvas = ({ children, orbitControls = false }: SceneCanvasProps) => (
  <Canvas
    camera={{ position: [0, 0, 8], fov: 60 }}
    style={{ background: '#050510' }}
    shadows
  >
    <ambientLight intensity={0.05} />
    <Environment preset="night" />
    {orbitControls && <OrbitControls enablePan={false} />}
    {children}
  </Canvas>
)
