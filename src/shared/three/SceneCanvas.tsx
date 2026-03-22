import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import type { ReactNode } from 'react'

interface SceneCanvasProps {
  children: ReactNode
  orbitControls?: boolean
}

export const SceneCanvas = ({ children, orbitControls = false }: SceneCanvasProps) => (
  <Canvas
    camera={{ position: [0, 2, 10], fov: 60 }}
    style={{ background: '#080818' }}
    shadows={{ type: THREE.PCFShadowMap }}
    gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
  >
    <ambientLight intensity={0.05} />
    <Environment preset="night" />
    {orbitControls && <OrbitControls enablePan={false} />}
    {children}
    <EffectComposer>
      <Bloom
        intensity={1.2}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
    </EffectComposer>
  </Canvas>
)
