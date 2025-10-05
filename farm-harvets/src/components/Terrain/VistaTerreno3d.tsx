import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sky, Clouds, Cloud } from '@react-three/drei'
import { useState } from 'react'
import * as THREE from 'three'
import { TerrenoAgricolaPeru } from './TerrenoAgricolaPeru'

function AnimatedCamera() {
  const { camera } = useThree()
  const [t, setT] = useState(0)

  useFrame((_, delta) => {
    if (t < 1) {
      const newT = Math.min(t + delta * 0.25, 1)
      setT(newT)
      const start = new THREE.Vector3(0, 130, 130)
      const end = new THREE.Vector3(0, 40, 0)
      camera.position.lerpVectors(start, end, newT)
      camera.lookAt(0, 0, 0)
    }
  })
  return null
}

function StaticClouds() {
  return (
    <group position={[0, 80, 0]}>
      <Clouds>
        <Cloud opacity={0.8} seed={1} scale={[80, 15, 80]} speed={0.1} />
        <Cloud opacity={0.7} seed={8} position={[30, -5, -10]} scale={[90, 20, 90]} speed={0.2} />
      </Clouds>
    </group>
  )
}

export default function VistaTerreno3d() {
  return (
    <div className="w-full h-full">
      <Canvas shadows camera={{ position: [0, 100, 100], fov: 55 }}>
        <ambientLight intensity={0.6} />
        <directionalLight
          castShadow
          position={[50, 60, 30]}
          intensity={1.3}
          shadow-mapSize-width={4096}
          shadow-mapSize-height={4096}
        />
        <Sky sunPosition={[100, 20, 100]} />
        <AnimatedCamera />
        <TerrenoAgricolaPeru />
        <StaticClouds />
        <OrbitControls maxPolarAngle={Math.PI / 2.3} minDistance={8} maxDistance={180} />
      </Canvas>
    </div>
  )
}
