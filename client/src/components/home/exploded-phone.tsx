"use client";

import { useRef, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  RoundedBox,
  ContactShadows,
} from "@react-three/drei";
import * as THREE from "three";
import type { PhoneComponentId } from "@/lib/phone-components";
import { GlbPhoneModel } from "./phone-glb-model";

/** Modern flagship proportions */
const PHONE = {
  w: 0.72,
  h: 1.52,
  d: 0.078,
  radius: 0.062,
};

function smoothstep(t: number) {
  const c = THREE.MathUtils.clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

function partT(globalExplode: number, stagger = 0) {
  return smoothstep((globalExplode - stagger) / Math.max(0.001, 1 - stagger * 0.85));
}

function useExplodePos(
  base: [number, number, number],
  offset: [number, number, number],
  explode: number,
  stagger: number
): [number, number, number] {
  const t = partT(explode, stagger);
  return [base[0] + offset[0] * t, base[1] + offset[1] * t, base[2] + offset[2] * t];
}

interface ModelProps {
  explode: number;
  selectedId: PhoneComponentId | null;
  onSelect: (id: PhoneComponentId | null) => void;
  onActivatePhone?: () => void;
  autoRotate: boolean;
  reducedMotion: boolean;
  variant?: "default" | "hero";
}

/** Premium procedural phone — realistic materials + full explode layout */
function RealisticPhoneModel({
  explode,
  selectedId,
  onSelect,
  onActivatePhone,
  autoRotate,
  reducedMotion,
  variant = "default",
}: ModelProps) {
  const rootRef = useRef<THREE.Group>(null);
  const isHero = variant === "hero";
  const isOpen = explode > 0.2;
  const showInternals = explode > 0.04;

  useFrame((_, delta) => {
    if (rootRef.current && autoRotate && !reducedMotion && !isOpen) {
      rootRef.current.rotation.y += delta * 0.18;
    }
  });

  const activate = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onActivatePhone?.();
    },
    [onActivatePhone]
  );

  const pick = useCallback(
    (id: PhoneComponentId) => (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (!isOpen) {
        onActivatePhone?.();
        return;
      }
      onSelect(selectedId === id ? null : id);
    },
    [isOpen, onActivatePhone, onSelect, selectedId]
  );

  const cursor = {
    onPointerOver: () => {
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      document.body.style.cursor = "auto";
    },
  };

  // Exploded positions — spread so every part is clearly visible
  const framePos = useExplodePos([0, 0, 0], [0, 0, 0], explode, 0);
  const displayPos = useExplodePos([0, 0, PHONE.d / 2 + 0.01], [0, 0.05, 0.42], explode, 0.05);
  const backPos = useExplodePos([0, 0, -PHONE.d / 2 - 0.006], [0, -0.04, -0.4], explode, 0.08);
  const batteryPos = useExplodePos([0, -0.18, -0.005], [-0.42, -0.35, 0.08], explode, 0.18);
  const boardPos = useExplodePos([0, 0.18, -0.002], [0.4, 0.28, 0.12], explode, 0.22);
  const cameraPos = useExplodePos([-0.16, 0.52, -PHONE.d / 2 - 0.02], [-0.15, 0.55, -0.28], explode, 0.12);
  const coilPos = useExplodePos([0, -0.02, -0.012], [0.35, -0.05, 0.22], explode, 0.28);
  const speakerPos = useExplodePos([0, -0.62, 0.01], [0.08, -0.55, 0.1], explode, 0.32);
  const chargePos = useExplodePos([0, -0.72, 0.0], [0, -0.62, 0.14], explode, 0.36);
  const simPos = useExplodePos([PHONE.w / 2 + 0.01, 0.35, 0], [0.38, 0.2, 0.05], explode, 0.3);
  const btnPos = useExplodePos([PHONE.w / 2 + 0.016, 0.05, 0], [0.32, 0, 0.08], explode, 0.26);

  const sel = (id: PhoneComponentId) => selectedId === id;

  return (
    <group ref={rootRef} scale={isHero ? 1.45 : 1.12} position={[0, -0.05, 0]} rotation={[0.12, -0.35, 0]}>
      {/* ─── FRAME ─── */}
      <group position={framePos} onClick={isOpen ? pick("frame") : activate} {...cursor}>
        <RoundedBox args={[PHONE.w, PHONE.h, PHONE.d]} radius={PHONE.radius} smoothness={8}>
          <meshPhysicalMaterial
            color={sel("frame") ? "#5a9fd4" : "#a8a8ae"}
            metalness={0.95}
            roughness={0.18}
            clearcoat={0.4}
            clearcoatRoughness={0.2}
            envMapIntensity={1.6}
          />
        </RoundedBox>
        {/* Inner chassis recess */}
        <RoundedBox args={[PHONE.w - 0.04, PHONE.h - 0.04, PHONE.d - 0.01]} radius={PHONE.radius - 0.02} smoothness={6}>
          <meshStandardMaterial color="#1c1c1e" metalness={0.4} roughness={0.6} />
        </RoundedBox>
      </group>

      {/* ─── SIDE BUTTONS ─── */}
      <group position={btnPos} onClick={pick("buttons")} {...cursor}>
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[0.018, 0.1, 0.038]} />
          <meshStandardMaterial
            color={sel("buttons") ? "#0071e3" : "#6e6e73"}
            metalness={0.9}
            roughness={0.25}
            emissive={sel("buttons") ? "#0071e3" : "#000"}
            emissiveIntensity={sel("buttons") ? 0.3 : 0}
          />
        </mesh>
        <mesh position={[0, -0.02, 0]}>
          <boxGeometry args={[0.018, 0.18, 0.038]} />
          <meshStandardMaterial
            color={sel("buttons") ? "#0071e3" : "#6e6e73"}
            metalness={0.9}
            roughness={0.25}
            emissive={sel("buttons") ? "#0071e3" : "#000"}
            emissiveIntensity={sel("buttons") ? 0.3 : 0}
          />
        </mesh>
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[0.018, 0.06, 0.038]} />
          <meshStandardMaterial color="#6e6e73" metalness={0.9} roughness={0.25} />
        </mesh>
      </group>

      {/* ─── SIM TRAY ─── */}
      <group position={simPos} onClick={pick("simTray")} {...cursor}>
        <mesh>
          <boxGeometry args={[0.02, 0.16, 0.05]} />
          <meshStandardMaterial
            color={sel("simTray") ? "#0071e3" : "#c7c7cc"}
            metalness={0.85}
            roughness={0.3}
            emissive={sel("simTray") ? "#0071e3" : "#000"}
            emissiveIntensity={sel("simTray") ? 0.3 : 0}
          />
        </mesh>
        <mesh position={[0.008, 0.03, 0]}>
          <boxGeometry args={[0.006, 0.05, 0.035]} />
          <meshStandardMaterial color="#ffd60a" metalness={0.7} roughness={0.4} />
        </mesh>
      </group>

      {/* ─── DISPLAY ─── */}
      <group position={displayPos} onClick={pick("display")} {...cursor}>
        <RoundedBox args={[PHONE.w - 0.03, PHONE.h - 0.03, 0.014]} radius={0.05} smoothness={6}>
          <meshPhysicalMaterial
            color="#0a0a0c"
            metalness={0.05}
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.05}
            emissive={sel("display") ? "#0071e3" : "#0b1a33"}
            emissiveIntensity={sel("display") ? 0.4 : 0.25}
          />
        </RoundedBox>
        {/* Active OLED content */}
        <mesh position={[0, 0, 0.008]}>
          <planeGeometry args={[PHONE.w - 0.1, PHONE.h - 0.14]} />
          <meshBasicMaterial color="#071018" />
        </mesh>
        <mesh position={[0, 0.15, 0.009]}>
          <planeGeometry args={[PHONE.w - 0.22, 0.35]} />
          <meshBasicMaterial color="#0071e3" transparent opacity={0.35} />
        </mesh>
        <mesh position={[0, -0.2, 0.009]}>
          <planeGeometry args={[PHONE.w - 0.28, 0.08]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
        </mesh>
        {/* Punch-hole */}
        <mesh position={[0, PHONE.h / 2 - 0.12, 0.01]}>
          <circleGeometry args={[0.016, 32]} />
          <meshStandardMaterial color="#050505" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Glass sheet */}
        <RoundedBox args={[PHONE.w - 0.02, PHONE.h - 0.02, 0.004]} radius={0.052} smoothness={6} position={[0, 0, 0.012]}>
          <meshPhysicalMaterial
            color="#ffffff"
            metalness={0}
            roughness={0.02}
            transmission={0.88}
            thickness={0.02}
            transparent
            opacity={0.4}
            envMapIntensity={1.4}
          />
        </RoundedBox>
      </group>

      {/* ─── BACK GLASS ─── */}
      <group position={backPos} onClick={pick("backGlass")} {...cursor}>
        <RoundedBox args={[PHONE.w - 0.025, PHONE.h - 0.025, 0.012]} radius={0.05} smoothness={6}>
          <meshPhysicalMaterial
            color={sel("backGlass") ? "#3d6fa8" : "#2c2c30"}
            metalness={0.75}
            roughness={0.22}
            clearcoat={0.9}
            clearcoatRoughness={0.1}
            envMapIntensity={1.3}
            emissive={sel("backGlass") ? "#0071e3" : "#000"}
            emissiveIntensity={sel("backGlass") ? 0.25 : 0}
          />
        </RoundedBox>
        {/* Soft highlight */}
        <mesh position={[0.12, 0.35, 0.007]} rotation={[0, 0, -0.4]}>
          <planeGeometry args={[0.2, 0.55]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.06} />
        </mesh>
      </group>

      {/* ─── CAMERA MODULE ─── */}
      <group position={cameraPos} onClick={pick("camera")} {...cursor} rotation={[Math.PI / 2, 0, 0]}>
        <RoundedBox args={[0.26, 0.02, 0.52]} radius={0.045} smoothness={4}>
          <meshPhysicalMaterial
            color={sel("camera") ? "#0071e3" : "#111114"}
            metalness={0.9}
            roughness={0.15}
            emissive={sel("camera") ? "#0071e3" : "#000"}
            emissiveIntensity={sel("camera") ? 0.35 : 0}
          />
        </RoundedBox>
        {[0.14, 0, -0.14].map((z, i) => (
          <group key={i} position={[0, -0.012, z]}>
            <mesh>
              <cylinderGeometry args={[0.042, 0.042, 0.02, 48]} />
              <meshStandardMaterial color="#0a0a0a" metalness={0.95} roughness={0.08} />
            </mesh>
            <mesh position={[0, -0.012, 0]}>
              <cylinderGeometry args={[0.028, 0.028, 0.008, 48]} />
              <meshPhysicalMaterial
                color="#0d1b2a"
                metalness={1}
                roughness={0.05}
                emissive="#1a4a7a"
                emissiveIntensity={0.2}
              />
            </mesh>
          </group>
        ))}
        <mesh position={[0.07, -0.01, 0.18]}>
          <cylinderGeometry args={[0.018, 0.018, 0.012, 24]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* ─── BATTERY ─── */}
      {showInternals && (
      <group position={batteryPos} onClick={pick("battery")} {...cursor}>
        <RoundedBox args={[0.5, 0.42, 0.032]} radius={0.02} smoothness={4}>
          <meshStandardMaterial
            color={sel("battery") ? "#1a6b4a" : "#14352a"}
            metalness={0.15}
            roughness={0.65}
            emissive={sel("battery") ? "#0071e3" : "#0a2018"}
            emissiveIntensity={sel("battery") ? 0.3 : 0.05}
          />
        </RoundedBox>
        {/* Cell stripes */}
        {[-0.12, 0, 0.12].map((x) => (
          <mesh key={x} position={[x, 0, 0.017]}>
            <planeGeometry args={[0.12, 0.36]} />
            <meshStandardMaterial color="#0f2a20" metalness={0.2} roughness={0.7} />
          </mesh>
        ))}
        {/* Label */}
        <mesh position={[0, 0.08, 0.018]}>
          <planeGeometry args={[0.28, 0.06]} />
          <meshBasicMaterial color="#c8f5d8" transparent opacity={0.35} />
        </mesh>
        <mesh position={[0, -0.12, 0.018]}>
          <planeGeometry args={[0.2, 0.04]} />
          <meshBasicMaterial color="#e8b84a" transparent opacity={0.5} />
        </mesh>
      </group>
      )}

      {/* ─── MOTHERBOARD ─── */}
      {showInternals && (
      <group position={boardPos} onClick={pick("motherboard")} {...cursor}>
        <RoundedBox args={[0.46, 0.7, 0.016]} radius={0.012} smoothness={3}>
          <meshStandardMaterial
            color={sel("motherboard") ? "#1e4a8a" : "#152238"}
            metalness={0.35}
            roughness={0.55}
            emissive={sel("motherboard") ? "#0071e3" : "#0a1528"}
            emissiveIntensity={sel("motherboard") ? 0.35 : 0.08}
          />
        </RoundedBox>
        {/* SoC */}
        <mesh position={[0, 0.12, 0.012]}>
          <boxGeometry args={[0.16, 0.16, 0.01]} />
          <meshStandardMaterial color="#0d0d0f" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* RAM / NAND chips */}
        {[
          [-0.14, -0.08],
          [0.14, -0.08],
          [-0.14, -0.22],
          [0.14, -0.22],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.011]}>
            <boxGeometry args={[0.1, 0.08, 0.008]} />
            <meshStandardMaterial color="#1a1a1c" metalness={0.4} roughness={0.5} />
          </mesh>
        ))}
        {/* Gold pads */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[-0.18 + (i % 4) * 0.12, -0.32 + Math.floor(i / 4) * 0.06, 0.01]}>
            <boxGeometry args={[0.04, 0.02, 0.003]} />
            <meshStandardMaterial color="#d4a017" metalness={0.9} roughness={0.25} />
          </mesh>
        ))}
        {/* Trace glow */}
        <mesh position={[0, 0.28, 0.01]}>
          <planeGeometry args={[0.35, 0.02]} />
          <meshBasicMaterial color="#0071e3" transparent opacity={0.4} />
        </mesh>
      </group>
      )}

      {/* ─── WIRELESS COIL ─── */}
      {showInternals && (
      <group position={coilPos} onClick={pick("wirelessCoil")} {...cursor} rotation={[Math.PI / 2, 0, 0]}>
        {[0.2, 0.155, 0.11, 0.065].map((r, i) => (
          <mesh key={i}>
            <torusGeometry args={[r, 0.012, 12, 48]} />
            <meshStandardMaterial
              color={sel("wirelessCoil") ? "#0071e3" : "#c9a227"}
              metalness={0.85}
              roughness={0.3}
              emissive={sel("wirelessCoil") ? "#0071e3" : "#7a6010"}
              emissiveIntensity={sel("wirelessCoil") ? 0.35 : 0.08}
            />
          </mesh>
        ))}
      </group>
      )}

      {/* ─── SPEAKER ─── */}
      {showInternals && (
      <group position={speakerPos} onClick={pick("speaker")} {...cursor}>
        <RoundedBox args={[0.32, 0.07, 0.028]} radius={0.01} smoothness={3}>
          <meshStandardMaterial
            color={sel("speaker") ? "#0071e3" : "#2c2c2e"}
            metalness={0.5}
            roughness={0.45}
            emissive={sel("speaker") ? "#0071e3" : "#000"}
            emissiveIntensity={sel("speaker") ? 0.3 : 0}
          />
        </RoundedBox>
        {[-0.08, -0.04, 0, 0.04, 0.08].map((x) => (
          <mesh key={x} position={[x, 0, 0.015]}>
            <boxGeometry args={[0.012, 0.045, 0.004]} />
            <meshStandardMaterial color="#111" metalness={0.3} roughness={0.8} />
          </mesh>
        ))}
      </group>
      )}

      {/* ─── CHARGING PORT ─── */}
      {showInternals && (
      <group position={chargePos} onClick={pick("chargingPort")} {...cursor}>
        <RoundedBox args={[0.16, 0.045, 0.032]} radius={0.008} smoothness={3}>
          <meshStandardMaterial
            color={sel("chargingPort") ? "#0071e3" : "#3a3a3c"}
            metalness={0.85}
            roughness={0.25}
            emissive={sel("chargingPort") ? "#0071e3" : "#000"}
            emissiveIntensity={sel("chargingPort") ? 0.3 : 0}
          />
        </RoundedBox>
        <mesh position={[0, -0.005, 0.01]}>
          <boxGeometry args={[0.1, 0.02, 0.016]} />
          <meshStandardMaterial color="#0a0a0a" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Pins */}
        {[-0.03, -0.01, 0.01, 0.03].map((x) => (
          <mesh key={x} position={[x, -0.005, 0.018]}>
            <boxGeometry args={[0.008, 0.01, 0.004]} />
            <meshStandardMaterial color="#d4a017" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
      </group>
      )}
    </group>
  );
}

function CameraRig({ explode, isHero, enabled }: { explode: number; isHero: boolean; enabled: boolean }) {
  const { camera } = useThree();
  useFrame((_, delta) => {
    if (!enabled) return;
    const cam = camera as THREE.PerspectiveCamera;
    const baseZ = isHero ? 4.5 : 4.4;
    const targetZ = baseZ - explode * 0.35;
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, isHero ? 0.15 : 0, delta * 2);
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, targetZ, delta * 2);
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, explode * 0.1, delta * 2);
    cam.lookAt(0, 0, 0);
  });
  return null;
}

export interface ExplodedPhoneCanvasProps {
  explode: number;
  selectedId: PhoneComponentId | null;
  onSelect: (id: PhoneComponentId | null) => void;
  onActivatePhone?: () => void;
  autoRotate?: boolean;
  reducedMotion?: boolean;
  className?: string;
  glbUrl?: string | null;
  variant?: "default" | "hero";
  mouseOffset?: { x: number; y: number };
  /** Free 360° orbit (workshop). Default true for non-hero. */
  freeOrbit?: boolean;
}

export function ExplodedPhoneCanvas({
  explode,
  selectedId,
  onSelect,
  onActivatePhone,
  autoRotate = true,
  reducedMotion = false,
  className,
  glbUrl = null,
  variant = "default",
  freeOrbit,
}: ExplodedPhoneCanvasProps) {
  const isHero = variant === "hero";
  const isOpen = explode > 0.2;
  const orbitEnabled = freeOrbit ?? !isHero;

  return (
    <div className={className}>
      <Canvas
        camera={{ position: [1.2, 0.6, 3.8], fov: isHero ? 38 : 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={reducedMotion ? 1 : [1, 1.5]}
        style={{ background: "transparent", touchAction: "pan-y" }}
        onPointerMissed={() => {
          if (isOpen) onSelect(null);
        }}
      >
        <color attach="background" args={["#00000000"]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 4]} intensity={1.8} color="#ffffff" castShadow />
        <directionalLight position={[-4, 3, -2]} intensity={0.55} color="#b8d4ff" />
        <spotLight position={[0, 5, 5]} angle={0.5} penumbra={0.7} intensity={1} color="#ffffff" />
        <pointLight position={[0, -1, 2]} intensity={0.35} color="#0071e3" />

        <Suspense fallback={null}>
          {glbUrl ? (
            <GlbPhoneModel
              url={glbUrl}
              explode={explode}
              selectedId={selectedId}
              onSelect={onSelect}
              onActivatePhone={onActivatePhone}
              reducedMotion={reducedMotion}
            />
          ) : (
            <RealisticPhoneModel
              explode={explode}
              selectedId={selectedId}
              onSelect={onSelect}
              onActivatePhone={onActivatePhone}
              autoRotate={autoRotate && !orbitEnabled}
              reducedMotion={reducedMotion}
              variant={variant}
            />
          )}
          <Environment preset="city" environmentIntensity={0.75} />
          <ContactShadows
            position={[0, -1.15, 0]}
            opacity={0.35}
            scale={8}
            blur={2.5}
            far={4}
          />
        </Suspense>

        <CameraRig explode={explode} isHero={isHero} enabled={!orbitEnabled} />

        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom={false}
          enableRotate={orbitEnabled || isOpen}
          minDistance={isHero ? 3 : 2.2}
          maxDistance={orbitEnabled ? 7 : 6}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI - 0.15}
          autoRotate={autoRotate && !reducedMotion && !isOpen && !orbitEnabled}
          autoRotateSpeed={0.4}
          target={[0, 0, 0]}
          rotateSpeed={0.65}
          dampingFactor={0.08}
          enableDamping
        />
      </Canvas>
    </div>
  );
}

/** Static fallback when WebGL unavailable or reduced motion */
export function PhoneFallbackVisual({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "hero";
}) {
  const isHero = variant === "hero";
  return (
    <div className={`flex items-center justify-center ${className ?? ""}`} aria-hidden>
      <div
        className={
          isHero
            ? "relative h-[min(540px,62vh)] w-[min(260px,34vw)] rounded-[2.4rem] border-[3px] border-zinc-400/70 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-500 shadow-[0_24px_48px_rgba(0,0,0,0.12)]"
            : "relative h-[min(60vh,480px)] w-[min(45vw,240px)] rounded-[2.5rem] border border-black/10 bg-gradient-to-b from-zinc-200 to-zinc-300 shadow-elevation-lg dark:border-white/10 dark:from-zinc-700 dark:to-zinc-900"
        }
      >
        <div className="absolute inset-[7px] overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#0d1117] to-[#1a2744]">
          <div className="absolute left-1/2 top-3 h-2 w-2 -translate-x-1/2 rounded-full bg-zinc-900" />
        </div>
      </div>
    </div>
  );
}
