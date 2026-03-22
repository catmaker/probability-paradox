import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useMontyHallStore } from '../model/store'
import type { Mesh } from 'three'

interface DoorProps {
  index: number
  position: [number, number, number]
}

export const Door = ({ index, position }: DoorProps) => {
  const doorRef = useRef<Mesh>(null)

  const stage = useMontyHallStore((s) => s.stage)
  const selectedDoor = useMontyHallStore((s) => s.selectedDoor)
  const revealedDoor = useMontyHallStore((s) => s.revealedDoor)
  const pickDoor = useMontyHallStore((s) => s.actions.pickDoor)

  const isSelected = selectedDoor === index
  const isRevealed = revealedDoor === index
  const isClickable = stage === 'pick' || (stage === 'reveal' && !isRevealed && !isSelected)

  // 문이 열릴 때 Y축으로 회전 (피벗이 문 왼쪽 끝에 있다고 가정)
  useFrame(() => {
    if (!doorRef.current) return
    const targetRotation = isRevealed ? -Math.PI / 2 : 0
    // 매 프레임 목표값으로 lerp (부드러운 애니메이션)
    doorRef.current.rotation.y += (targetRotation - doorRef.current.rotation.y) * 0.08
  })

  return (
    // 피벗을 문 왼쪽 끝으로 옮기기 위해 group으로 감쌈
    <group position={position}>
      <mesh
        ref={doorRef}
        position={[0.5, 0, 0]} // 문 중심을 오른쪽으로 이동해 왼쪽 끝이 피벗이 되게
        onClick={() => isClickable && pickDoor(index)}
        castShadow
      >
        <boxGeometry args={[1, 2, 0.1]} />
        <meshStandardMaterial
          color={isSelected ? '#00aaff' : isRevealed ? '#333344' : '#1a1a2e'}
          emissive={isSelected ? '#003366' : '#000000'}
          emissiveIntensity={isSelected ? 0.5 : 0}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* 문틀 */}
      <mesh position={[0.5, 0, -0.06]}>
        <boxGeometry args={[1.15, 2.15, 0.05]} />
        <meshStandardMaterial color="#0a0a1a" roughness={1} />
      </mesh>

      {/* 선택된 문 포인트 라이트 */}
      {isSelected && <pointLight position={[0.5, 0, 1]} color="#00aaff" intensity={2} distance={3} />}
    </group>
  )
}
