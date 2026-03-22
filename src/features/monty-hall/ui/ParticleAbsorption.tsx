import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Points } from 'three'

interface ParticleAbsorptionProps {
  fromPosition: [number, number, number]
  toPosition: [number, number, number]
  active: boolean
}

const PARTICLE_COUNT = 80

export const ParticleAbsorption = ({ fromPosition, toPosition, active }: ParticleAbsorptionProps) => {
  const pointsRef = useRef<Points>(null)
  const progress = useRef<Float32Array>(
    new Float32Array(PARTICLE_COUNT).map((_, i) => i / PARTICLE_COUNT) // 균등 분산 시작
  )
  const speeds = useRef<Float32Array>(
    new Float32Array(PARTICLE_COUNT).map(() => 0.004 + Math.random() * 0.006)
  )
  // 각 파티클의 호 높이 (랜덤)
  const arcHeights = useRef<Float32Array>(
    new Float32Array(PARTICLE_COUNT).map(() => 3 + Math.random() * 2)
  )

  const from = new THREE.Vector3(...fromPosition)
  const to = new THREE.Vector3(...toPosition)

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3))
    return geo
  }, [])

  const material = useMemo(
    () => new THREE.PointsMaterial({ color: '#44aaff', size: 0.08, transparent: true, opacity: 0.9 }),
    []
  )

  useFrame(() => {
    if (!pointsRef.current || !active) return
    const pos = pointsRef.current.geometry.attributes.position

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      progress.current[i] = (progress.current[i] + speeds.current[i]) % 1
      const t = progress.current[i]

      // 호(arc) 경로: 위로 솟았다가 내려오는 포물선
      const x = THREE.MathUtils.lerp(from.x, to.x, t)
      const z = THREE.MathUtils.lerp(from.z, to.z, t)
      const y = THREE.MathUtils.lerp(from.y, to.y, t) + arcHeights.current[i] * Math.sin(t * Math.PI)

      pos.setXYZ(i, x, y, z)
    }
    pos.needsUpdate = true
  })

  if (!active) return null

  return <points ref={pointsRef} geometry={geometry} material={material} />
}
