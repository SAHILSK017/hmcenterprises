"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, RoundedBox, MeshTransmissionMaterial } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

export type PhoneMode = "idle" | "repair" | "sell" | "shop";

interface PhoneModelProps {
  mode: PhoneMode;
  scrollProgress: number;
}

function PhoneModel({ mode, scrollProgress }: PhoneModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh>(null);
  const batteryRef = useRef<THREE.Mesh>(null);
  const boardRef = useRef<THREE.Mesh>(null);
  const frameRef = useRef<THREE.Mesh>(null);

  const targets = useRef({
    rotY: 0,
    rotX: 0.15,
    explode: 0,
    showBack: 0,
  });

  useFrame((_, delta) => {
    const t = targets.current;
    const scrollRot = scrollProgress * Math.PI * 0.4;

    if (mode === "repair") {
      t.explode = 0.35;
      t.rotY = scrollRot * 0.3;
      t.rotX = 0.2;
      t.showBack = 0;
    } else if (mode === "sell") {
      t.explode = 0;
      t.showBack = 1;
      t.rotY = Math.PI + scrollRot * 0.2;
      t.rotX = 0.05;
    } else if (mode === "shop") {
      t.explode = 0;
      t.showBack = 0;
      t.rotY = scrollRot * 0.5 + 0.3;
      t.rotX = 0.1;
    } else {
      t.explode = 0;
      t.showBack = 0;
      t.rotY = scrollRot * 0.25;
      t.rotX = 0.15;
    }

    const lerp = (a: number, b: number) => THREE.MathUtils.lerp(a, b, delta * 4);

    if (groupRef.current) {
      groupRef.current.rotation.y = lerp(groupRef.current.rotation.y, t.rotY);
      groupRef.current.rotation.x = lerp(groupRef.current.rotation.x, t.rotX);
    }

    if (screenRef.current) {
      screenRef.current.position.z = lerp(screenRef.current.position.z, 0.08 + t.explode * 0.25);
    }
    if (batteryRef.current) {
      batteryRef.current.position.z = lerp(batteryRef.current.position.z, -0.02 + t.explode * 0.15);
      batteryRef.current.visible = t.explode > 0.05;
    }
    if (boardRef.current) {
      boardRef.current.position.z = lerp(boardRef.current.position.z, -0.04 - t.explode * 0.12);
      boardRef.current.visible = t.explode > 0.05;
    }
    if (frameRef.current) {
      const scale = 1 + (mode === "shop" ? 0.03 : 0);
      frameRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), delta * 3);
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.4}>
      <group ref={groupRef}>
        {/* Titanium frame */}
        <RoundedBox ref={frameRef} args={[1.1, 2.2, 0.12]} radius={0.08} smoothness={8}>
          <meshStandardMaterial
            color="#3a3a3c"
            metalness={0.95}
            roughness={0.2}
            envMapIntensity={1.2}
          />
        </RoundedBox>

        {/* Internal battery */}
        <mesh ref={batteryRef} position={[0, -0.35, -0.02]} visible={false}>
          <boxGeometry args={[0.7, 0.5, 0.04]} />
          <meshStandardMaterial color="#1a3a2a" metalness={0.3} roughness={0.6} emissive="#10b981" emissiveIntensity={0.15} />
        </mesh>

        {/* Motherboard */}
        <mesh ref={boardRef} position={[0, 0.2, -0.04]} visible={false}>
          <boxGeometry args={[0.65, 0.9, 0.03]} />
          <meshStandardMaterial color="#1c1c1e" metalness={0.5} roughness={0.4} />
        </mesh>

        {/* Glass screen */}
        <mesh ref={screenRef} position={[0, 0, 0.08]}>
          <planeGeometry args={[0.95, 2.05]} />
          <MeshTransmissionMaterial
            backside
            samples={4}
            thickness={0.2}
            chromaticAberration={0.04}
            anisotropy={0.3}
            distortion={0.1}
            distortionScale={0.2}
            temporalDistortion={0.1}
            iridescence={0.4}
            iridescenceIOR={1}
            iridescenceThicknessRange={[0, 1200]}
            clearcoat={1}
            attenuationDistance={0.5}
            attenuationColor="#10b981"
            color="#0a0a0b"
          />
        </mesh>

        {/* Screen glow UI */}
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[0.88, 1.9]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.06} />
        </mesh>

        {/* Rear camera module (visible on sell flip) */}
        <group position={[0, 0.75, -0.07]} rotation={[0, Math.PI, 0]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.12, 0.04, 32]} />
            <meshStandardMaterial color="#1c1c1e" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <circleGeometry args={[0.08, 32]} />
            <meshStandardMaterial color="#0a0a0b" metalness={0.9} roughness={0.1} emissive="#34d399" emissiveIntensity={0.2} />
          </mesh>
        </group>
      </group>
    </Float>
  );
}

interface PhoneSceneProps {
  mode: PhoneMode;
  scrollProgress: number;
  className?: string;
}

export function PhoneScene({ mode, scrollProgress, className }: PhoneSceneProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.35} />
        <spotLight position={[4, 6, 4]} angle={0.35} penumbra={1} intensity={1.2} color="#ffffff" />
        <spotLight position={[-3, 2, 2]} angle={0.4} intensity={0.6} color="#34d399" />
        <pointLight position={[0, -2, 3]} intensity={0.4} color="#6ee7b7" />
        <PhoneModel mode={mode} scrollProgress={scrollProgress} />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
