"use client";

import { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import type { PhoneComponentId } from "@/lib/phone-components";
import { GLB_MESH_TO_COMPONENT } from "@/lib/phone-glb";

interface GlbPhoneModelProps {
  url: string;
  explode: number;
  selectedId: PhoneComponentId | null;
  onSelect: (id: PhoneComponentId | null) => void;
  onActivatePhone?: () => void;
  reducedMotion?: boolean;
}

function meshToComponentId(name: string): PhoneComponentId | null {
  const key = name.replace(/\s+/g, "").toLowerCase();
  const mapped = GLB_MESH_TO_COMPONENT[key];
  return (mapped as PhoneComponentId) ?? null;
}

export function GlbPhoneModel({
  url,
  explode,
  selectedId,
  onSelect,
  onActivatePhone,
}: GlbPhoneModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const isOpen = explode > 0.22;

  const parts = useMemo(() => {
    const list: {
      mesh: THREE.Mesh;
      id: PhoneComponentId | null;
      basePos: THREE.Vector3;
      explodeDir: THREE.Vector3;
    }[] = [];

    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const id = meshToComponentId(child.name);
      const basePos = child.position.clone();
      const explodeDir =
        basePos.length() > 0.01
          ? basePos.clone().normalize()
          : new THREE.Vector3(0, child.position.y >= 0 ? 1 : -1, 0.3);
      list.push({ mesh: child, id, basePos, explodeDir });
    });

    return list;
  }, [cloned]);

  useEffect(() => {
    for (const part of parts) {
      const offset = part.explodeDir.clone().multiplyScalar(explode * 0.35);
      part.mesh.position.copy(part.basePos).add(offset);

      if (part.id && selectedId === part.id) {
        part.mesh.scale.setScalar(1.03);
        if (part.mesh.material && "emissive" in part.mesh.material) {
          (part.mesh.material as THREE.MeshStandardMaterial).emissive.set("#0071e3");
          (part.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.25;
        }
      } else {
        part.mesh.scale.setScalar(1);
        if (part.mesh.material && "emissive" in part.mesh.material) {
          (part.mesh.material as THREE.MeshStandardMaterial).emissive.set("#000000");
          (part.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
        }
      }
    }
  }, [parts, explode, selectedId]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (!isOpen) {
        onActivatePhone?.();
        return;
      }
      const mesh = e.object as THREE.Mesh;
      const id = meshToComponentId(mesh.name);
      if (id) onSelect(selectedId === id ? null : id);
    },
    [isOpen, onActivatePhone, onSelect, selectedId]
  );

  return (
    <group ref={groupRef} rotation={[0.15, 0, 0]}>
      {!isOpen && onActivatePhone && (
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onActivatePhone();
          }}
          onPointerOver={() => {
            document.body.style.cursor = "pointer";
          }}
          onPointerOut={() => {
            document.body.style.cursor = "auto";
          }}
        >
          <boxGeometry args={[1.2, 2.4, 0.6]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
      <primitive object={cloned} onClick={handleClick} />
    </group>
  );
}

/** Returns true if GLB exists at url */
export function useGlbAvailable(url: string) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(url, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setAvailable(res.ok);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return available;
}
