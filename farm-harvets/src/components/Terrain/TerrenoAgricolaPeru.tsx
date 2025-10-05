import * as THREE from 'three'
import { useMemo } from 'react'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js'

type Vec3 = [number, number, number]

function rand(seed: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

// 🌳 Árbol simple
function Tree({ position = [0, 0, 0] as Vec3, type = 'normal' }: { position?: Vec3; type?: string }) {
  let trunkColor = '#5B3A1C', leafColor = '#2E7D32', trunkHeight = 2
  if (type === 'tropical') { leafColor = '#1B5E20'; trunkHeight = 2.8 }
  if (type === 'andean') { leafColor = '#558B2F'; trunkHeight = 2.2 }
  if (type === 'palm') { leafColor = '#3EAD5D'; trunkHeight = 3.5 }

  return (
    <group position={position}>
      <mesh castShadow position={[0, trunkHeight / 2, 0]}>
        <cylinderGeometry args={[0.15, 0.25, trunkHeight, 6]} />
        <meshStandardMaterial color={trunkColor} />
      </mesh>
      <mesh castShadow position={[0, trunkHeight, 0]}>
        <sphereGeometry args={[0.8, 10, 10]} />
        <meshStandardMaterial color={leafColor} />
      </mesh>
    </group>
  )
}

// 🌾 Cultivo (pequeños cilindros)
function Crop({ pos = [0, 0.02, 0] as Vec3, color = '#4CAF50', count = 25, height = 0.6 }: { pos?: Vec3; color?: string; count?: number; height?: number }) {
  const ref = useMemo(() => new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.05, height, 6), new THREE.MeshStandardMaterial({ color }), count), [])
  const dummy = new THREE.Object3D()

  for (let i = 0; i < count; i++) {
    const x = (rand(i) - 0.5) * 8
    const z = (rand(i + 77) - 0.5) * 8
    dummy.position.set(x, height / 2, z)
    dummy.updateMatrix()
    ref.setMatrixAt(i, dummy.matrix)
  }

  ref.instanceMatrix.needsUpdate = true

  return <primitive object={ref} position={pos} />
}

// 🌅 Costa
function RegionCosta() {
  return (
    <group position={[-20, 0, 0]}>
      <Crop pos={[0, 0, 0]} color={'#9CCC65'} height={0.4} />
      <Crop pos={[4, 0, 2]} color={'#8BC34A'} height={0.8} />
      <Crop pos={[-4, 0, -2]} color={'#9E9D24'} height={0.6} />
      <Tree position={[4, 0, -3]} type="palm" />
      <Tree position={[-4, 0, 3]} type="palm" />
    </group>
  )
}

// 🏔️ Sierra
function RegionSierra() {
  return (
    <group position={[0, 0, 15]}>
      <Crop pos={[-2, 0, -2]} color={'#A5D6A7'} height={0.4} />
      <Crop pos={[2, 0, -2]} color={'#7CB342'} height={1} />
      <Crop pos={[0, 0, 2]} color={'#C8E6C9'} height={0.6} />
      <Tree position={[-3, 0, 3]} type="andean" />
      <Tree position={[3, 0, -3]} type="andean" />
    </group>
  )
}

// 🌳 Selva
function RegionSelva() {
  return (
    <group position={[20, 0, 0]}>
      <Crop pos={[-3, 0, 0]} color={'#4CAF50'} height={1} />
      <Crop pos={[3, 0, 0]} color={'#795548'} height={0.8} />
      <Crop pos={[0, 0, 3]} color={'#FFEB3B'} height={1.2} />
      <Tree position={[2, 0, -2]} type="tropical" />
      <Tree position={[-2, 0, 2]} type="tropical" />
    </group>
  )
}

// 🌍 Terreno principal con relieve visible
export const TerrenoAgricolaPeru: React.FC = () => {
  const geometry = useMemo(() => new THREE.PlaneGeometry(120, 120, 128, 128), [])
  const noise = useMemo(() => new ImprovedNoise(), [])

  // Crear alturas tipo cerro con centro plano
  useMemo(() => {
    const vertices = geometry.attributes.position as THREE.BufferAttribute
    const scale = 10 // menor = más detalle
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i)
      const z = vertices.getZ(i)
      const dist = Math.sqrt(x * x + z * z)

      let h = 0
      if (dist > 25) {
        const n = noise.noise(x / scale, z / scale, 0)
        const factor = Math.min((dist - 25) / 50, 1)
        h = Math.max(0, n * 12 * factor) // más pronunciado
      }
      vertices.setY(i, h)
    }
    geometry.computeVertexNormals()
  }, [geometry, noise])

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#2E7D32',
        roughness: 0.9,
        metalness: 0.05,
        flatShading: false,
      }),
    []
  )

  // Árboles distribuidos en colinas
  const trees: any[] = []
  for (let i = 0; i < 100; i++) {
    const x = (rand(i) - 0.5) * 120
    const z = (rand(i + 500) - 0.5) * 120
    const dist = Math.sqrt(x * x + z * z)
    if (dist > 35) {
      const h = Math.abs(noise.noise(x / 15, z / 15, 0) * 12)
      const type = i % 3 === 0 ? 'tropical' : i % 3 === 1 ? 'andean' : 'palm'
      trees.push(<Tree key={i} position={[x, h, z]} type={type} />)
    }
  }

  return (
    <group>
      {/* Terreno */}
      <mesh
        geometry={geometry}
        material={material}
        rotation-x={-Math.PI / 2}
        position={[0, -2, 0]} // lo bajamos un poco
        receiveShadow
        castShadow
      />

      {/* Árboles alrededor */}
      {trees}

      {/* Regiones agrícolas en el centro plano */}
      <RegionCosta />
      <RegionSierra />
      <RegionSelva />
    </group>
  )
}
