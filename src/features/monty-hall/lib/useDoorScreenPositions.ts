import { useState } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const DOOR_POSITIONS: [number, number, number][] = [
  [-2.5, -1.2, 0],
  [0, -1.2, 0],
  [2.5, -1.2, 0],
]

// 3D 월드 좌표 → 화면 픽셀 좌표 변환
const toScreenPos = (pos: THREE.Vector3, camera: THREE.Camera, size: { width: number; height: number }) => {
  const v = pos.clone().project(camera)
  return {
    x: (v.x * 0.5 + 0.5) * size.width,
    y: (-v.y * 0.5 + 0.5) * size.height,
  }
}

export const useDoorScreenPositions = () => {
  const { camera, size } = useThree()
  const [positions, setPositions] = useState<{ x: number; y: number }[]>([])

  useFrame(() => {
    const newPos = DOOR_POSITIONS.map(([x, y, z]) =>
      toScreenPos(new THREE.Vector3(x + 0.5, y - 1.5, z), camera, size)
    )
    setPositions(newPos)
  })

  return positions
}
