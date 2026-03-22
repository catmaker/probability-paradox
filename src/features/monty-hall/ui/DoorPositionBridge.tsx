import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

const DOOR_WORLD_POSITIONS: [number, number, number][] = [
  [-2.5, -1.2, 0],
  [0, -1.2, 0],
  [2.5, -1.2, 0],
]

interface Props {
  onUpdate: (positions: { x: number; y: number }[]) => void
}

export const DoorPositionBridge = ({ onUpdate }: Props) => {
  const { camera, size } = useThree()

  useFrame(() => {
    const positions = DOOR_WORLD_POSITIONS.map(([x, y, z]) => {
      // 문 중앙 (x + 0.52 * 0.6 보정) + 문 바로 아래
      const v = new THREE.Vector3(x, y - 0.3, z).project(camera)
      return {
        x: (v.x * 0.5 + 0.5) * size.width,
        y: (-v.y * 0.5 + 0.5) * size.height,
      }
    })
    onUpdate(positions)
  })

  return null
}
