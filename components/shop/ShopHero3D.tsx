'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float, MeshDistortMaterial, Stars, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

function BronzeTorus() {
  const meshRef = useRef<THREE.Mesh>(null!)
  const { viewport, mouse } = useThree()

  const targetRotation = useRef({ x: 0, y: 0 })

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Base rotation
      meshRef.current.rotation.x += delta * 0.15
      meshRef.current.rotation.z += delta * 0.1
      
      // Interactive pointer rotation
      targetRotation.current.x = (mouse.y * Math.PI) / 4
      targetRotation.current.y = (mouse.x * Math.PI) / 4

      meshRef.current.rotation.x += (targetRotation.current.x - meshRef.current.rotation.x) * 0.05
      meshRef.current.rotation.y += (targetRotation.current.y - meshRef.current.rotation.y) * 0.05
    }
  })

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.8}>
      <mesh ref={meshRef} scale={viewport.width < 6 ? 1.1 : 1.4} castShadow>
        <torusKnotGeometry args={[1, 0.35, 256, 64, 2, 3]} />
        <MeshDistortMaterial
          color="#B8763C"
          metalness={0.9}
          roughness={0.15}
          envMapIntensity={2.5}
          distort={0.15}
          speed={1.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>
    </Float>
  )
}

function FloatingParticles() {
  const count = 100
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return pos
  }, [])

  const sizes = useMemo(() => {
    const s = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      s[i] = Math.random() * 0.03 + 0.01
    }
    return s
  }, [])

  const pointsRef = useRef<THREE.Points>(null!)

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03
      pointsRef.current.rotation.x = state.clock.elapsedTime * 0.015
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#B8763C"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" castShadow />
      <pointLight position={[-3, 3, 2]} intensity={1.2} color="#B8763C" distance={15} />
      <pointLight position={[3, -3, -2]} intensity={0.8} color="#e5a975" distance={12} />
      <spotLight
        position={[0, 8, 0]}
        angle={0.6}
        penumbra={1}
        intensity={2}
        color="#ffffff"
        castShadow
      />
    </>
  )
}

export function ShopHero3D() {
  return (
    <div className="w-full h-full absolute inset-0 mix-blend-plus-lighter">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        dpr={[1, 2]}
      >
        <SceneLighting />
        <Environment preset="city" />
        
        <BronzeTorus />
        <FloatingParticles />
        <Stars radius={50} depth={50} count={300} factor={4} saturation={0} fade speed={1} />
        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />
      </Canvas>
    </div>
  )
}
