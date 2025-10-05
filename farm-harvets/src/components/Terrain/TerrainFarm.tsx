import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'

// -------- 🌱 CULTIVOS GENERALES -------- //
type V3 = [number, number, number]

function random(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

// 🔸 Base de campo genérico
function CropPlot({
  pos = [0, 0.01, 0],
  size = 8,
  grooves = 6,
  soilColor = '#C59B6D',
  grooveColor = '#AA825C',
}: {
  pos?: V3
  size?: number
  grooves?: number
  soilColor?: string
  grooveColor?: string
}) {
  return (
    <group position={pos}>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color={soilColor} flatShading />
      </mesh>
      {Array.from({ length: grooves }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.02, -size / 2 + (i + 1) * (size / (grooves + 1))]}
          rotation-x={-Math.PI / 2}
          receiveShadow
        >
          <planeGeometry args={[size * 0.92, 0.25]} />
          <meshStandardMaterial color={grooveColor} flatShading />
        </mesh>
      ))}
    </group>
  )
}

// -------- 🌽 MAÍZ -------- //
function CornField({ pos = [0, 0.02, 0], count = 30, height = 1.5 }: { pos?: V3; count?: number; height?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      const x = (random(i) - 0.5) * 6
      const z = (random(i + 50) - 0.5) * 6
      dummy.position.set(x, height / 2, z)
      dummy.scale.set(0.1, height, 0.1)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [count, height])

  return (
    <group position={pos}>
      <CropPlot size={8} />
      <instancedMesh ref={ref} args={[undefined, undefined, count]}>
        <cylinderGeometry args={[0.05, 0.1, height, 6]} />
        <meshStandardMaterial color={'#388E3C'} />
      </instancedMesh>
    </group>
  )
}

// -------- 🍅 TOMATES -------- //
function TomatoField({ pos = [0, 0.02, 0], count = 20 }: { pos?: V3; count?: number }) {
  const fruitRef = useRef<THREE.InstancedMesh>(null!)
  const stemRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      const x = (random(i) - 0.5) * 6
      const z = (random(i + 99) - 0.5) * 6
      // tallo
      dummy.position.set(x, 0.3, z)
      dummy.scale.set(0.1, 0.6, 0.1)
      dummy.updateMatrix()
      stemRef.current.setMatrixAt(i, dummy.matrix)
      // fruto
      dummy.position.set(x, 0.7, z)
      dummy.scale.setScalar(0.2)
      dummy.updateMatrix()
      fruitRef.current.setMatrixAt(i, dummy.matrix)
    }
    fruitRef.current.instanceMatrix.needsUpdate = true
    stemRef.current.instanceMatrix.needsUpdate = true
  }, [count])

  return (
    <group position={pos}>
      <CropPlot size={8} />
      <instancedMesh ref={stemRef} args={[undefined, undefined, count]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
        <meshStandardMaterial color={'#2E7D32'} />
      </instancedMesh>
      <instancedMesh ref={fruitRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.15, 10, 10]} />
        <meshStandardMaterial color={'#E53935'} />
      </instancedMesh>
    </group>
  )
}

// -------- 🌻 GIRASOLES -------- //
function SunflowerField({ pos = [0, 0.02, 0], count = 20 }: { pos?: V3; count?: number }) {
  const ref = useRef<THREE.Group>(null!)

  useEffect(() => {
    if (!ref.current) return
    ref.current.children.forEach((child, i) => {
      const x = (random(i) - 0.5) * 6
      const z = (random(i + 12) - 0.5) * 6
      child.position.set(x, 0, z)
    })
  }, [])

  return (
    <group position={pos} ref={ref}>
      <CropPlot size={8} />
      {Array.from({ length: count }).map((_, i) => (
        <group key={i}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1.2, 6]} />
            <meshStandardMaterial color={'#4CAF50'} />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <circleGeometry args={[0.3, 12]} />
            <meshStandardMaterial color={'#FFEB3B'} />
          </mesh>
          <mesh position={[0, 1.2, 0]}>
            <circleGeometry args={[0.1, 10]} />
            <meshStandardMaterial color={'#5D4037'} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// -------- 🌾 ESCENA COMPLETA -------- //
export const TerrainFarm: React.FC = () => {
  const groundGeo = useMemo(() => new THREE.PlaneGeometry(60, 60, 32, 32), [])
  const groundMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#7CB342', flatShading: true }),
    []
  )

  return (
    <group>
      {/* terreno base */}
      <mesh geometry={groundGeo} material={groundMat} rotation-x={-Math.PI / 2} receiveShadow />

      {/* parcelas de cultivos */}
      <CornField pos={[-10, 0.02, 10]} />
      <TomatoField pos={[10, 0.02, 10]} />
      <SunflowerField pos={[0, 0.02, -10]} />
    </group>
  )
}
