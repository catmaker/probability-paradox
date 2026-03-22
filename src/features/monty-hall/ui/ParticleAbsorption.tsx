import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, BufferGeometry, Float32BufferAttribute, PointsMaterial } from 'three'
import * as THREE from 'three'

interface ParticleAbsorptionProps {
  fromPosition: [number, number, number] // 꽝 문 위치
  toPosition: [number, number, number]   // 흡수될 문 위치
  active: boolean
}

const PARTICLE_COUNT = 120

export const ParticleAbsorption = ({ fromPosition, toPosition, active }: ParticleAbsorptionProps) => {
  const pointsRef = useRef<Points>(null)
  // 각 파티클의 진행도 (0 = from, 1 = to)
  const progress = useRef<Float32Array>(new Float32Array(PARTICLE_COUNT).fill(0))
  // 각 파티클의 속도 (랜덤하게 다르게)
  const speeds = useRef<Float32Array>(
    new Float32Array(PARTICLE_COUNT).map(() => 0.005 + Math.random() * 0.01)
  )

  const { positions, initialOffsets } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    // from 위치 주변에 랜덤 분산
    const initialOffsets = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      initialOffsets[i * 3] = (Math.random() - 0.5) * 2
      initialOffsets[i * 3 + 1] = (Math.random() - 0.5) * 2
      initialOffsets[i * 3 + 2] = (Math.random() - 0.5) * 0.5
      positions[i * 3] = fromPosition[0] + initialOffsets[i * 3]
      positions[i * 3 + 1] = fromPosition[1] + initialOffsets[i * 3 + 1]
      positions[i * 3 + 2] = fromPosition[2] + initialOffsets[i * 3 + 2]
    }
    return { positions, initialOffsets }
  }, [fromPosition])

  const geometry = useMemo(() => {
    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    return geo
  }, [positions])

  const material = useMemo(
    () => new PointsMaterial({ color: '#4488ff', size: 0.06, transparent: true, opacity: 0.8 }),
    []
  )

  useFrame(() => {
    if (!pointsRef.current || !active) return
    const pos = pointsRef.current.geometry.attributes.position

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // 진행도 증가 (1 넘으면 리셋 → 반복 흡수 효과)
      progress.current[i] = (progress.current[i] + speeds.current[i]) % 1

      const t = progress.current[i]
      // from 주변 랜덤 위치 → to 위치로 lerp
      const fromX = fromPosition[0] + initialOffsets[i * 3] * (1 - t)
      const fromY = fromPosition[1] + initialOffsets[i * 3 + 1] * (1 - t)
      const fromZ = fromPosition[2] + initialOffsets[i * 3 + 2] * (1 - t)

      pos.setXYZ(
        i,
        THREE.MathUtils.lerp(fromX, toPosition[0], t),
        THREE.MathUtils.lerp(fromY, toPosition[1], t),
        THREE.MathUtils.lerp(fromZ, toPosition[2], t)
      )
    }
    pos.needsUpdate = true
  })

  if (!active) return null

  return <points ref={pointsRef} geometry={geometry} material={material} />
}
