"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface HologramRingProps {
  radius?: number;
  color?: string;
  dataLabel?: string;
  dataValue?: string;
}

export function HologramRing({ 
  radius = 3.5, 
  color = "#00f2ff",
  dataLabel = "SYS_MEM",
  dataValue = "OPTIMAL"
}: HologramRingProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.4 * delta;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <group ref={groupRef as any}>
      <mesh ref={ringRef as any} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius, radius + 0.02, 64]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Floating Data Node 1 */}
      <Html position={[radius, 0, 0]} center transform sprite>
        <div className="font-mono text-[6px] sm:text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 bg-black/40 border border-cyan-500/30 text-cyan-400 backdrop-blur-sm rounded whitespace-nowrap select-none">
          {dataLabel}: {dataValue}
        </div>
      </Html>
      
      {/* Floating Data Node 2 (Opposite side) */}
      <Html position={[-radius, 0, 0]} center transform sprite>
        <div className="font-mono text-[6px] sm:text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 bg-black/40 border border-cyan-500/30 text-cyan-400 backdrop-blur-sm rounded whitespace-nowrap select-none">
          NET: SECURE
        </div>
      </Html>
    </group>
  );
}
