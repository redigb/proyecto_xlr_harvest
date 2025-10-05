import * as THREE from 'three'
import { useMemo, useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'

type V3 = [number, number, number]

function CropPlot({
  pos = [0, 0.01, 0],
  size = 8,
  grooves = 6,
  growth = 0.8,
  seed = 1,
}: {
  pos?: V3
  size?: number
  grooves?: number
  growth?: number
  seed?: number
}) {
  const soilColor = '#C59B6D'
  const grooveColor = '#AA825C'

  const count = 24
  const pumpRef = useRef<THREE.InstancedMesh>(null!)
  const stemRef = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const positions = useMemo(() => {
    const rand = (n: number) => {
      const x = Math.sin(n * 12.9898 + seed) * 43758.5453
      return x - Math.floor(x)
    }
    const arr: V3[] = []
    const cols = 6
    const rows = 4
    const spacingX = (size - 2) / cols
    const spacingZ = (size - 2) / rows
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const jx = (rand(r * cols + c) - 0.5) * 0.5
        const jz = (rand(r * cols + c + 99) - 0.5) * 0.5
        const x = -size / 2 + 1 + c * spacingX + jx
        const z = -size / 2 + 1 + r * spacingZ + jz
        arr.push([x, 0.02, z])
      }
    }
    return arr
  }, [size, seed])

  useEffect(() => {
    positions.forEach((p, i) => {
      dummy.position.set(p[0], p[1], p[2])
      dummy.scale.setScalar(0.6 * growth)
      dummy.updateMatrix()
      pumpRef.current.setMatrixAt(i, dummy.matrix)
      dummy.position.set(p[0], p[1] + 0.35 * growth, p[2])
      dummy.scale.set(0.15 * growth, 0.35 * growth, 0.15 * growth)
      dummy.updateMatrix()
      stemRef.current.setMatrixAt(i, dummy.matrix)
    })
    pumpRef.current.instanceMatrix.needsUpdate = true
    stemRef.current.instanceMatrix.needsUpdate = true
  }, [positions, growth, dummy])

  useFrame(({ clock }) => {
    const s = 1 + Math.sin(clock.getElapsedTime() * 1.5) * 0.02
    for (let i = 0; i < count; i++) {
      pumpRef.current.getMatrixAt(i, dummy.matrix)
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
      dummy.scale.multiplyScalar(s)
      dummy.updateMatrix()
      pumpRef.current.setMatrixAt(i, dummy.matrix)

      stemRef.current.getMatrixAt(i, dummy.matrix)
      dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale)
      dummy.scale.multiply(new THREE.Vector3(1, s, 1))
      dummy.updateMatrix()
      stemRef.current.setMatrixAt(i, dummy.matrix)
    }
    pumpRef.current.instanceMatrix.needsUpdate = true
    stemRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <group position={pos}>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial color={soilColor} />
      </mesh>
      {Array.from({ length: grooves }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.03, -size / 2 + (i + 1) * (size / (grooves + 1))]}
          rotation-x={-Math.PI / 2}
          receiveShadow
        >
          <planeGeometry args={[size * 0.92, 0.25]} />
          <meshStandardMaterial color={grooveColor} />
        </mesh>
      ))}
      <instancedMesh ref={pumpRef} args={[undefined, undefined, count]} castShadow receiveShadow>
        <sphereGeometry args={[0.35, 12, 10]} />
        <meshStandardMaterial color={'#F28F3B'} />
      </instancedMesh>
      <instancedMesh ref={stemRef} args={[undefined, undefined, count]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 6]} />
        <meshStandardMaterial color={'#2E7D32'} />
      </instancedMesh>
    </group>
  )
}

export const TerrainTreeJs: React.FC = () => {
  // PLANO SIMPLE, MUY GRANDE, UN POCO MÁS ABAJO
  const groundGeo = useMemo(() => new THREE.PlaneGeometry(200, 200, 1, 1), [])
  const groundMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#4CAF50',
        roughness: 1,
        metalness: 0,
      }),
    []
  )

  return (
    <group>
      {/* plano grande verde */}
      <mesh
        geometry={groundGeo}
        material={groundMat}
        position={[0, -0.05, 0]}
        rotation-x={-Math.PI / 2}
        receiveShadow
      />
      {/* parcelas visibles */}
      <CropPlot pos={[-10, 0.01, 0]} growth={0.35} seed={1} />
      <CropPlot pos={[-10, 0.01, -10]} growth={0.65} seed={2} />
      <CropPlot pos={[0, 0.01, -10]} growth={0.9} seed={3} />
      <CropPlot pos={[10, 0.01, -10]} growth={0.5} seed={4} />
      <CropPlot pos={[10, 0.01, 0]} growth={0.75} seed={5} />
    </group>
  )
}
