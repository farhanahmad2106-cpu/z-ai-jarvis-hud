"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAssistantStore } from "@/store/useAssistantStore";

export function Visualizer() {
  const { status } = useAssistantStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const barsRef = useRef<number[]>(Array.from({ length: 64 }, () => Math.random() * 0.1));

  const isSpeaking = status === "SPEAKING";
  const isThinking = status === "THINKING";
  const isListening = status === "LISTENING";

  // Determine color palette by state following Aether HUD Spec (#00F2FF Cyan, #00FF9D Emerald, #FFAA00 Amber)
  const palette = isSpeaking
    ? { primary: "0, 242, 255", glow: "#00f2ff", text: "#00f2ff" }
    : isListening
    ? { primary: "0, 255, 157", glow: "#00ff9d", text: "#00ff9d" }
    : isThinking
    ? { primary: "255, 170, 0", glow: "#ffaa00", text: "#ffaa00" }
    : { primary: "86, 141, 255", glow: "#568dff", text: "#568dff" };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const SIZE = 320;
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

      // Animate bars
      bars.forEach((b, i) => {
        const target = isSpeaking
          ? 0.2 + Math.abs(Math.sin(t * 3.5 + i * 0.4)) * 0.8
          : isThinking
          ? 0.05 + Math.abs(Math.sin(t * 1.8 + i * 0.3)) * 0.3
          : isListening
          ? 0.05 + Math.abs(Math.sin(t * 2.2 + i * 0.5)) * 0.2
          : 0.03 + Math.abs(Math.sin(t * 0.6 + i * 0.2)) * 0.06;

        barsRef.current[i] += (target - b) * 0.18;
      });

      // ── Layer 1: Soft outer glow halo ──
      const outerGlow = ctx.createRadialGradient(cx, cy, 90, cx, cy, 155);
      outerGlow.addColorStop(0, `rgba(${palette.primary},0.15)`);
      outerGlow.addColorStop(1, `rgba(${palette.primary},0)`);
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 155, 0, Math.PI * 2);
      ctx.fill();

      // ── Layer 2: Circular frequency bars ──
      const INNER_R = 72;
      const BAR_MAX = 58;
      const angleStep = (Math.PI * 2) / numBars;

      for (let i = 0; i < numBars; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const barH = bars[i] * BAR_MAX;
        const x1 = cx + Math.cos(angle) * INNER_R;
        const y1 = cy + Math.sin(angle) * INNER_R;
        const x2 = cx + Math.cos(angle) * (INNER_R + barH);
        const y2 = cy + Math.sin(angle) * (INNER_R + barH);

        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `rgba(${palette.primary},0.15)`);
        grad.addColorStop(0.6, `rgba(${palette.primary},0.85)`);
        grad.addColorStop(1, `rgba(${palette.primary},1)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = isSpeaking ? 2.5 : 2;
        ctx.lineCap = "square";
        ctx.shadowColor = palette.glow;
        ctx.shadowBlur = isSpeaking ? 14 : 6;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      // ── Layer 3: Tactical chamfered inner reticle ring ──
      ctx.strokeStyle = `rgba(${palette.primary},0.35)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, INNER_R, 0, Math.PI * 2);
      ctx.stroke();

      // ── Layer 4: Rotating dashed outer orbit ring ──
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * (isThinking ? 2.2 : 0.5));
      ctx.strokeStyle = `rgba(${palette.primary},${isThinking ? 0.6 : 0.25})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 12]);
      ctx.beginPath();
      ctx.arc(0, 0, 138, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // ── Layer 5: Second counter-rotating ring with tactical ticks ──
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(-t * 0.7);
      ctx.strokeStyle = `rgba(${palette.primary},0.2)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 18]);
      ctx.beginPath();
      ctx.arc(0, 0, 120, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // ── Layer 6: Arc reactor core ──
      const coreGlow = ctx.createRadialGradient(cx, cy, 16, cx, cy, 54);
      coreGlow.addColorStop(0, `rgba(${palette.primary},${isSpeaking ? 0.6 : 0.25})`);
      coreGlow.addColorStop(1, `rgba(${palette.primary},0)`);
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, 54, 0, Math.PI * 2);
      ctx.fill();

      // Dark core face
      ctx.fillStyle = "rgba(10, 21, 27, 0.94)";
      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0, Math.PI * 2);
      ctx.fill();

      // Core border
      ctx.strokeStyle = `rgba(${palette.primary},0.7)`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0, Math.PI * 2);
      ctx.stroke();

      // Inner dot
      ctx.fillStyle = `rgba(${palette.primary},${isSpeaking ? 1 : isThinking ? 0.85 : 0.6})`;
      ctx.shadowColor = palette.glow;
      ctx.shadowBlur = isSpeaking ? 22 : isThinking ? 14 : 8;
      ctx.beginPath();
      ctx.arc(cx, cy, isSpeaking ? 9 : 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── Layer 7: Orbiting particles ──
      for (let p = 0; p < 3; p++) {
        const orbitR = 34 + p * 12;
        const orbitSpeed = (isThinking ? 4 : 1.5) * (p % 2 === 0 ? 1 : -1);
        const orbitX = cx + Math.cos(t * orbitSpeed + (p * Math.PI) / 1.5) * orbitR;
        const orbitY = cy + Math.sin(t * orbitSpeed + (p * Math.PI) / 1.5) * orbitR;
        ctx.fillStyle = palette.glow;
        ctx.shadowColor = palette.glow;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(orbitX, orbitY, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      t += 0.018;
      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [status, isSpeaking, isThinking, isListening, palette.primary, palette.glow]);

  return (
    <div className="relative flex items-center justify-center w-80 h-80">
      {/* State label ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: isSpeaking ? 0.8 : 2, repeat: Infinity, ease: "easeInOut" }}
        style={{
          boxShadow: isSpeaking
            ? "0 0 60px rgba(0,242,255,0.3), inset 0 0 40px rgba(0,242,255,0.08)"
            : isListening
            ? "0 0 60px rgba(0,255,157,0.25), inset 0 0 40px rgba(0,255,157,0.08)"
            : isThinking
            ? "0 0 45px rgba(255,170,0,0.25), inset 0 0 30px rgba(255,170,0,0.08)"
            : "0 0 35px rgba(86,141,255,0.12)",
        }}
      />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="relative z-10"
        style={{ width: "320px", height: "320px" }}
      />

      {/* ZAYD label */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 pointer-events-none">
        <span
          className="font-sans font-black text-xl tracking-[0.5em] uppercase"
          style={{
            color: palette.text,
            textShadow: `0 0 14px ${palette.glow}`,
          }}
        >
          ZAYD
        </span>
        <span className="font-mono text-[9px] tracking-[0.35em] text-cyan/70 uppercase">
          {isSpeaking ? "[TRANSMITTING]" : isListening ? "[LISTENING]" : isThinking ? "[PROCESSING]" : "[STANDBY]"}
        </span>
      </div>
    </div>
  );
}

