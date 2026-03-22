import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { Fog } from 'three'
import { Door } from './Door'

const DOOR_POSITIONS: [number, number, number][] = [
  [-2.5, -1.2, 0],
  [0, -1.2, 0],
  [2.5, -1.2, 0],
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

  useEffect(() => {
    scene.fog = new Fog('#050510', 10, 30)
    return () => { scene.fog = null }
  }, [scene])

  return (
    <>
      <ResponsiveCamera />

      <ambientLight intensity={0.8} color="#445599" />
      <pointLight position={[0, 5, 3]} color="#88aaff" intensity={25} distance={30} />
      <pointLight position={[-4, 2, 2]} color="#6688ff" intensity={18} distance={22} />
      <pointLight position={[4, 2, 2]} color="#6688ff" intensity={18} distance={22} />
      <pointLight position={[0, 0, 4]} color="#7799ff" intensity={15} distance={18} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#08081a" roughness={1} />
      </mesh>

      {DOOR_POSITIONS.map((pos, i) => (
        <Door key={i} index={i} position={pos} />
      ))}
    </>
  )
}
