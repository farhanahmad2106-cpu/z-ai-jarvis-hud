"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAssistantStore } from "@/store/useAssistantStore";

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  z: number;
  zSpeed: number;
  colorOffset: number;
}

export function Visualizer() {
  const { status } = useAssistantStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const barsRef = useRef<number[]>(Array.from({ length: 72 }, () => Math.random() * 0.1));
  const particlesRef = useRef<Particle[]>([]);

  const isSpeaking = status === "SPEAKING";
  const isThinking = status === "THINKING";
  const isListening = status === "LISTENING";

  // Professional Modern Color System
  const palette = isSpeaking
    ? { primary: "0, 242, 255", secondary: "86, 141, 255", glow: "#00f2ff", badge: "TRANSMITTING" }
    : isListening
    ? { primary: "0, 255, 157", secondary: "0, 242, 255", glow: "#00ff9d", badge: "LISTENING" }
    : isThinking
    ? { primary: "255, 170, 0", secondary: "255, 90, 0", glow: "#ffaa00", badge: "PROCESSING" }
    : { primary: "0, 242, 255", secondary: "86, 141, 255", glow: "#00f2ff", badge: "STANDBY" };

  // Initialize 3D particles once
  useEffect(() => {
    if (particlesRef.current.length === 0) {
      const p: Particle[] = [];
      for (let i = 0; i < 42; i++) {
        p.push({
          angle: Math.random() * Math.PI * 2,
          radius: 40 + Math.random() * 85,
          speed: (0.005 + Math.random() * 0.015) * (i % 2 === 0 ? 1 : -1),
          size: 1.5 + Math.random() * 2.5,
          z: Math.random() * 2 - 1,
          zSpeed: 0.01 + Math.random() * 0.02,
          colorOffset: Math.random()
        });
      }
      particlesRef.current = p;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 340;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    ctx.scale(dpr, dpr);
    const cx = SIZE / 2;
    const cy = SIZE / 2;

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      const bars = barsRef.current;
      const numBars = bars.length;

      // Interpolate equalizer bars
      bars.forEach((b, i) => {
        const target = isSpeaking
          ? 0.25 + Math.abs(Math.sin(t * 4 + i * 0.3)) * 0.75
          : isThinking
          ? 0.08 + Math.abs(Math.sin(t * 2 + i * 0.2)) * 0.35
          : isListening
          ? 0.06 + Math.abs(Math.sin(t * 2.5 + i * 0.4)) * 0.25
          : 0.03 + Math.abs(Math.sin(t * 0.8 + i * 0.15)) * 0.07;

        barsRef.current[i] += (target - b) * 0.15;
      });

      // ── Layer 1: Ambient Backdrop Aura Glow ──
      const auraGlow = ctx.createRadialGradient(cx, cy, 50, cx, cy, 160);
      auraGlow.addColorStop(0, `rgba(${palette.primary},${isSpeaking ? 0.2 : isThinking ? 0.18 : 0.1})`);
      auraGlow.addColorStop(0.5, `rgba(${palette.secondary},0.04)`);
      auraGlow.addColorStop(1, "rgba(10, 21, 27, 0)");
      ctx.fillStyle = auraGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 160, 0, Math.PI * 2);
      ctx.fill();

      // ── Layer 2: Precision Tactical Reticle Ring & Ticks ──
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.2);
      
      // Outer 36-Tick Ring
      const TICK_R = 145;
      ctx.strokeStyle = `rgba(${palette.primary},0.2)`;
      ctx.lineWidth = 1;
      for (let k = 0; k < 36; k++) {
        const tickAngle = (k * Math.PI * 2) / 36;
        const len = k % 9 === 0 ? 8 : 4;
        const tx1 = Math.cos(tickAngle) * (TICK_R - len);
        const ty1 = Math.sin(tickAngle) * (TICK_R - len);
        const tx2 = Math.cos(tickAngle) * TICK_R;
        const ty2 = Math.sin(tickAngle) * TICK_R;
        
        ctx.beginPath();
        ctx.moveTo(tx1, ty1);
        ctx.lineTo(tx2, ty2);
        ctx.stroke();
      }

      // Outer baseline circle
      ctx.strokeStyle = `rgba(${palette.primary},0.15)`;
      ctx.beginPath();
      ctx.arc(0, 0, TICK_R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // ── Layer 3: Audio Frequency Equalizer Ring ──
      const INNER_R = 76;
      const BAR_MAX = 54;
      const angleStep = (Math.PI * 2) / numBars;

      for (let i = 0; i < numBars; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const barH = bars[i] * BAR_MAX;
        const x1 = cx + Math.cos(angle) * INNER_R;
        const y1 = cy + Math.sin(angle) * INNER_R;
        const x2 = cx + Math.cos(angle) * (INNER_R + barH);
        const y2 = cy + Math.sin(angle) * (INNER_R + barH);

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `rgba(${palette.primary},0.1)`);
        grad.addColorStop(0.5, `rgba(${palette.primary},0.75)`);
        grad.addColorStop(1, `rgba(${palette.primary},1)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = isSpeaking ? 2.2 : 1.8;
        ctx.lineCap = "square";
        ctx.shadowColor = palette.glow;
        ctx.shadowBlur = isSpeaking ? 12 : 5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // ── Layer 4: Counter-Rotating Dashed Orbit ──
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * (isThinking ? 1.5 : 0.4));
      ctx.strokeStyle = `rgba(${palette.primary},0.25)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([12, 16]);
      ctx.beginPath();
      ctx.arc(0, 0, 126, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // ── Layer 5: 3D Particle Cloud Orbiting Orb Core ──
      const particles = particlesRef.current;
      particles.forEach((p) => {
        p.angle += p.speed * (isThinking ? 2.5 : 1);
        p.z += p.zSpeed;
        if (p.z > 1) p.z = -1;

        const pScale = 0.6 + (p.z + 1) * 0.4;
        const px = cx + Math.cos(p.angle) * (p.radius * pScale);
        const py = cy + Math.sin(p.angle) * (p.radius * pScale * 0.65);
        const pAlpha = Math.max(0.1, (p.z + 1) / 2);

        ctx.fillStyle = `rgba(${palette.primary},${pAlpha * 0.85})`;
        ctx.shadowColor = palette.glow;
        ctx.shadowBlur = pScale * 8;
        ctx.beginPath();
        ctx.arc(px, py, p.size * pScale, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // ── Layer 6: Modern Specular Glass Orb Core ──
      const CORE_R = 48;

      // Outer Core Halo Glow
      const coreHalo = ctx.createRadialGradient(cx, cy, CORE_R * 0.4, cx, cy, CORE_R * 1.4);
      coreHalo.addColorStop(0, `rgba(${palette.primary},${isSpeaking ? 0.6 : 0.3})`);
      coreHalo.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = coreHalo;
      ctx.beginPath();
      ctx.arc(cx, cy, CORE_R * 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Glass Sphere Body
      const orbGrad = ctx.createRadialGradient(
        cx - CORE_R * 0.3, 
        cy - CORE_R * 0.3, 
        CORE_R * 0.1, 
        cx, 
        cy, 
        CORE_R
      );
      orbGrad.addColorStop(0, `rgba(${palette.primary},0.8)`);
      orbGrad.addColorStop(0.5, "rgba(10, 21, 27, 0.95)");
      orbGrad.addColorStop(1, "rgba(6, 15, 22, 0.98)");

      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, CORE_R, 0, Math.PI * 2);
      ctx.fill();

      // Glass Edge Ring
      ctx.strokeStyle = `rgba(${palette.primary},0.65)`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = isSpeaking ? 16 : 8;
      ctx.beginPath();
      ctx.arc(cx, cy, CORE_R, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Specular Reflection Curved Arc (Top Left Glass Reflection)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx - 2, cy - 2, CORE_R - 6, Math.PI * 1.15, Math.PI * 1.65);
      ctx.stroke();

      // ── Layer 7: Pulsating Center AI Core Reactor ──
      const pulseSize = 8 + Math.abs(Math.sin(t * 3)) * (isSpeaking ? 7 : 3);
      ctx.fillStyle = `rgba(${palette.primary},1)`;
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      t += 0.02;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [status, isSpeaking, isThinking, isListening, palette.primary, palette.secondary, palette.glow]);

  return (
    <div className="relative flex items-center justify-center w-84 h-84">
      {/* Outer ambient pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: isSpeaking ? 0.9 : 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          boxShadow: isSpeaking
            ? "0 0 70px rgba(0,242,255,0.35), inset 0 0 45px rgba(0,242,255,0.1)"
            : isListening
            ? "0 0 70px rgba(0,255,157,0.3), inset 0 0 45px rgba(0,255,157,0.1)"
            : isThinking
            ? "0 0 50px rgba(255,170,0,0.3), inset 0 0 35px rgba(255,170,0,0.1)"
            : "0 0 40px rgba(0,242,255,0.15), inset 0 0 25px rgba(0,242,255,0.05)",
        }}
      />

      {/* High Precision Canvas */}
      <canvas
        ref={canvasRef}
        className="relative z-10 cursor-pointer"
        style={{ width: "340px", height: "340px" }}
      />

      {/* Modern Sleek HUD Center Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-0.5 pointer-events-none">
        <span
          className="font-sans font-black text-xl tracking-[0.5em] uppercase"
          style={{
            color: palette.glow,
            textShadow: `0 0 16px ${palette.glow}`,
          }}
        >
          ZAYD
        </span>
        <div className="flex items-center gap-1.5 px-3 py-0.5 chamfer-card-sm border border-cyan/40 bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_0_12px_rgba(0,242,255,0.2)]">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: palette.glow }} />
          <span className="font-mono text-[9px] tracking-[0.25em] text-cyan font-extrabold uppercase">
            [{palette.badge}]
          </span>
        </div>
      </div>
    </div>
  );
}


