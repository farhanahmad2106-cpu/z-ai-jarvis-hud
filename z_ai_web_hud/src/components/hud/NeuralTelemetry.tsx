"use client";

import React from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Activity, Database, Cpu } from "lucide-react";
import { useAssistantStore } from "@/store/useAssistantStore";

export function NeuralTelemetry() {
  const { status } = useAssistantStore();
  const isThinking = status === "THINKING";
  const isSpeaking = status === "SPEAKING";

  return (
    <div className="chamfer-card light-pipe-cyan glass-panel p-3 w-52 sm:w-56 text-left group hover:shadow-[0_0_25px_rgba(0,242,255,0.25)] transition-all duration-300">
      <div className="flex items-center justify-between mb-3 border-b border-cyan/20 pb-1.5">
        <div className="flex items-center gap-1.5">
          <BrainCircuit size={11} className={`text-cyan ${isThinking ? 'animate-pulse text-[#ffaa00]' : ''}`} />
          <span className="font-mono text-[9px] text-cyan font-extrabold tracking-widest uppercase">
            [MOD_NEURAL_IX]
          </span>
        </div>
        <span className={`font-mono text-[8px] uppercase tracking-wider font-bold ${isThinking ? 'text-[#ffaa00] animate-pulse' : 'text-[#00ff9d]'}`}>
          {isThinking ? 'PROCESSING' : 'COHERENT'}
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {/* Token Velocity */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[8px] text-cyan/70 tracking-widest flex items-center gap-1"><Activity size={8}/> TOKEN_VELOCITY</span>
            <span className="font-mono text-[9px] text-cyan font-bold">{isSpeaking ? '142 T/s' : '0 T/s'}</span>
          </div>
          <div className="w-full h-1 bg-surface-container-low overflow-hidden rounded-full">
            <motion.div 
              className="h-full bg-cyan"
              animate={{ width: isSpeaking ? '85%' : '0%' }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
        </div>

        {/* Memory Bandwidth */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[8px] text-cyan/70 tracking-widest flex items-center gap-1"><Database size={8}/> MEM_BANDWIDTH</span>
            <span className="font-mono text-[9px] text-cyan font-bold">{isThinking ? '8.4 TB/s' : '1.2 TB/s'}</span>
          </div>
          <div className="w-full h-1 bg-surface-container-low overflow-hidden rounded-full">
            <motion.div 
              className="h-full bg-[#ffaa00]"
              animate={{ width: isThinking ? '95%' : '20%' }}
              transition={{ type: "spring", stiffness: 50 }}
            />
          </div>
        </div>

        {/* Compute Allocation */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[8px] text-cyan/70 tracking-widest flex items-center gap-1"><Cpu size={8}/> AI_COMPUTE_NODE</span>
            <span className="font-mono text-[9px] text-[#00ff9d] font-bold">NOMINAL</span>
          </div>
          
          <div className="h-6 w-full flex items-end justify-between gap-[1px] mt-1 opacity-80">
            {Array.from({ length: 45 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ height: "10%" }}
                animate={{ height: isThinking ? `${10 + Math.random() * 90}%` : `${10 + Math.random() * 20}%` }}
                transition={{ duration: 0.2 + Math.random() * 0.5, repeat: Infinity, repeatType: "mirror" }}
                className="w-full bg-[#00ff9d]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
