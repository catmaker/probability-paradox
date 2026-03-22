import { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useMontyHallStore } from '../model/store'
import '../lib/DissolveMaterial'
import * as THREE from 'three'
import type { Group, SpotLight as SpotLightType } from 'three'

interface DoorProps {
  index: number
  position: [number, number, number]
}

useGLTF.preload('/models/Door.glb')

export const Door = ({ index, position }: DoorProps) => {
  const { scene: doorScene } = useGLTF('/models/Door.glb')
  const clonedScene = useMemo(() => {
    const clone = doorScene.clone(true)
    // 머티리얼도 각각 독립 복제 (공유 머티리얼 문제 해결)
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = (child.material as THREE.MeshStandardMaterial).clone()
      }
    })
    return clone
  }, [doorScene])
  const groupRef = useRef<Group>(null)
  const spotRef = useRef<SpotLightType>(null)
  const targetRef = useRef(new THREE.Object3D())
  const { scene } = useThree()

  const prizeDoor = useMontyHallStore((s) => s.prizeDoor)
  const stage = useMontyHallStore((s) => s.stage)
  const selectedDoor = useMontyHallStore((s) => s.selectedDoor)
  const revealedDoor = useMontyHallStore((s) => s.revealedDoor)
  const pickDoor = useMontyHallStore((s) => s.actions.pickDoor)

  const isSelected = selectedDoor === index
  const isRevealed = revealedDoor === index
  const isPrize = prizeDoor === index && stage === 'result'
  const isClickable = stage === 'pick'

  // 디버그: 모델 크기 확인
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(clonedScene)
    const size = box.getSize(new THREE.Vector3())
    console.log(`Door[${index}] size:`, size, '| min.y:', box.min.y, '| max.y:', box.max.y)
  }, [clonedScene, index])

  // 선택/공개 상태에 따라 emissive 변경
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as THREE.MeshStandardMaterial
        mat.emissive = new THREE.Color(isRevealed ? '#111122' : '#000000')
        mat.emissiveIntensity = isRevealed ? 0.3 : 0
      }
    })
  }, [isSelected, isRevealed, clonedScene])

  // spotLight target 등록
  useEffect(() => {
    const target = targetRef.current
    target.position.set(position[0], 0, position[2])
    scene.add(target)
    return () => { scene.remove(target) }
  }, [scene, position])

  useEffect(() => {
    if (spotRef.current) spotRef.current.target = targetRef.current
  }, [isSelected])

  const dissolveProgress = useRef(0)

  // 리셋 시 opacity 복구
  useEffect(() => {
    if (stage === 'pick') {
      dissolveProgress.current = 0
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial
          mat.transparent = false
          mat.opacity = 1
        }
      })
    }
  }, [stage, clonedScene])

  useFrame(() => {
    // 꽝 문: dissolve 진행
    const target = isRevealed ? 1 : 0
    dissolveProgress.current += (target - dissolveProgress.current) * 0.03

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const mat = child.material as any
        if (mat.progress !== undefined) {
          mat.progress = dissolveProgress.current
        } else {
          // 일반 머티리얼 fallback
          const stdMat = mat as THREE.MeshStandardMaterial
          stdMat.transparent = true
          stdMat.opacity += ((isRevealed ? 0.0 : 1) - stdMat.opacity) * 0.05
        }
      }
    })
  })

  return (
    <group position={position}>
      {/* 투명 클릭 영역 */}
      <mesh position={[0, 1, 0]} onClick={() => isClickable && pickDoor(index)} visible={false}>
        <boxGeometry args={[1.2, 2.5, 0.5]} />
        <meshBasicMaterial />
      </mesh>

      {/* GLTF 문 모델 */}
      <group ref={groupRef}>
        <group scale={0.6} position={[0.52, 0, 0]}>
          <primitive object={clonedScene} />
        </group>
      </group>

      {/* 선택 시 강한 조명 — result에서 정답 문이 따로 있으면 끔 */}
      {isSelected && !isPrize && stage !== 'result' && (
        <>
          <pointLight position={[0.52, 1.2, 1.5]} color="#ffffff" intensity={20} distance={4} />
          <pointLight position={[0.52, 1.2, 1.5]} color="#88aaff" intensity={10} distance={5} />
        </>
      )}

      {/* 정답 문 — 골든 빛 */}
      {isPrize && (
        <>
          <pointLight position={[0.52, 1.2, 1.5]} color="#ffdd88" intensity={30} distance={5} />
          <pointLight position={[0.52, 3, 0]} color="#ffaa00" intensity={15} distance={6} />
        </>
      )}

      {isSelected && (
        <spotLight
          ref={spotRef}
          position={[0, 8, 0]}
          angle={0.18}
          penumbra={0.5}
          intensity={120}
          color="#88ccff"
          castShadow
          distance={14}
        />
      )}
    </group>
  )
}
