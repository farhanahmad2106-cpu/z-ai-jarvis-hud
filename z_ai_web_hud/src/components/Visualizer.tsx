"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Icosahedron, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useAssistantStore } from "@/store/useAssistantStore";
import { motion } from "framer-motion";

function HolographicCore({ status }: { status: string }) {
  const coreRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const isSpeaking = status === "SPEAKING";
  const isThinking = status === "THINKING";
  const isListening = status === "LISTENING";

  // Determine colors based on status
  const color = isSpeaking
    ? "#00f2ff" // Cyan
    : isListening
    ? "#00ff9d" // Green
    : isThinking
    ? "#ffaa00" // Orange
    : "#00f2ff"; // Standby Cyan

  const targetScale = isSpeaking ? 1.2 : isListening ? 1.1 : isThinking ? 0.9 : 1.0;
  
  useFrame((state, delta) => {
    if (coreRef.current) {
      // Rotate core
      coreRef.current.rotation.y += (isThinking ? 2.5 : 0.5) * delta;
      coreRef.current.rotation.x += 0.2 * delta;
      
      // Scale core smoothly
      coreRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
      
      // Pulse effect when speaking
      if (isSpeaking) {
        const pulse = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.1;
        coreRef.current.scale.set(targetScale * pulse, targetScale * pulse, targetScale * pulse);
      }
    }
    
    if (ringRef.current) {
      ringRef.current.rotation.z -= (isThinking ? 1.5 : 0.3) * delta;
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      ringRef.current.rotation.y = Math.cos(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group>
      {/* Inner Core */}
      <Icosahedron args={[1.5, 2]} ref={coreRef as any}>
        <meshStandardMaterial 
          color={color} 
          wireframe={true} 
          emissive={color}
          emissiveIntensity={isSpeaking ? 1.5 : 0.5}
          transparent
          opacity={0.8}
        />
      </Icosahedron>
      
      {/* Outer Ring */}
      <mesh ref={ringRef as any}>
        <torusGeometry args={[2.5, 0.05, 16, 100]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      {/* Ambient particles */}
      <Stars 
        radius={5} 
        depth={10} 
        count={isThinking ? 2000 : 1000} 
        factor={isThinking ? 6 : 4} 
        saturation={0} 
        fade 
        speed={isThinking ? 3 : 1}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 0]} color={color} intensity={isSpeaking ? 5 : 2} distance={10} />
    </group>
  );
}

export function Visualizer() {
  const { status } = useAssistantStore();

  const isSpeaking = status === "SPEAKING";
  const isThinking = status === "THINKING";
  const isListening = status === "LISTENING";

  const palette = isSpeaking
    ? { glow: "#00f2ff", badge: "TRANSMITTING" }
    : isListening
    ? { glow: "#00ff9d", badge: "LISTENING" }
    : isThinking
    ? { glow: "#ffaa00", badge: "PROCESSING" }
    : { glow: "#00f2ff", badge: "STANDBY" };

  return (
    <div className="relative flex items-center justify-center w-[260px] h-[260px] sm:w-[280px] sm:h-[280px] pointer-events-auto shrink-0">
      {/* Outer ambient pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{ opacity: [0.2, 0.5, 0.2], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: isSpeaking ? 0.9 : 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          boxShadow: `0 0 50px ${palette.glow}40, inset 0 0 30px ${palette.glow}20`,
        }}
      />

      <div 
        className="absolute inset-0 z-10"
        style={{
          maskImage: 'radial-gradient(circle at center, black 45%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 45%, transparent 70%)'
        }}
      >
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            autoRotate={!isThinking}
            autoRotateSpeed={1.5}
          />
          <HolographicCore status={status} />
        </Canvas>
      </div>

      {/* Modern Sleek HUD Center Badge */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-0.5 pointer-events-none">
        <span
          className="font-sans font-black text-lg tracking-[0.5em] uppercase"
          style={{
            color: palette.glow,
            textShadow: `0 0 16px ${palette.glow}`,
          }}
        >
          ZAYD
        </span>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 chamfer-card-sm border border-cyan/40 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_0_12px_rgba(0,242,255,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: palette.glow }} />
          <span className="font-mono text-[8.5px] tracking-[0.25em] font-extrabold uppercase" style={{ color: palette.glow }}>
            [{palette.badge}]
          </span>
        </div>
      </div>
    </div>
  );
}
