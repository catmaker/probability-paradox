import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Fog } from 'three'
import { Door } from './Door'
import { ParticleAbsorption } from './ParticleAbsorption'
import { useMontyHallStore } from '../model/store'

const DOOR_POSITIONS: [number, number, number][] = [
  [-3, 0, 0],
  [0, 0, 0],
  [3, 0, 0],
]

const ResponsiveCamera = () => {
  const { camera, size } = useThree()
  useEffect(() => {
    if ('fov' in camera) {
      camera.fov = size.width < 640 ? 90 : 60
      camera.updateProjectionMatrix()
    }
  }, [size, camera])
  return null
}

export const MontyHallScene = () => {
  const { scene } = useThree()
  const stage = useMontyHallStore((s) => s.stage)
  const revealedDoor = useMontyHallStore((s) => s.revealedDoor)
  const selectedDoor = useMontyHallStore((s) => s.selectedDoor)

  useEffect(() => {
    scene.fog = new Fog('#050510', 10, 30)
    return () => { scene.fog = null }
  }, [scene])

  // 파티클: 꽝 문 → 선택 안 된 나머지 닫힌 문으로 흡수
  const absorptionTarget = [0, 1, 2].find(
    (d) => d !== revealedDoor && d !== selectedDoor
  )
  const showParticles = stage === 'reveal' && revealedDoor !== null && absorptionTarget !== undefined

  return (
    <>
      <ResponsiveCamera />

      <pointLight position={[0, 5, 3]} color="#1a44ff" intensity={3} distance={15} />
      <pointLight position={[-4, 2, 2]} color="#0033aa" intensity={1.5} distance={10} />
      <pointLight position={[4, 2, 2]} color="#0033aa" intensity={1.5} distance={10} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#08081a" roughness={1} />
      </mesh>

      {DOOR_POSITIONS.map((pos, i) => (
        <Door key={i} index={i} position={pos} />
      ))}

      {/* 66.6% 파티클 흡수 애니메이션 */}
      {showParticles && (
        <ParticleAbsorption
          fromPosition={DOOR_POSITIONS[revealedDoor!]}
          toPosition={DOOR_POSITIONS[absorptionTarget]}
          active
        />
      )}
    </>
  )
}
