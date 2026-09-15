"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cloud, Wind, Thermometer, Droplets, Sun } from "lucide-react";
import { useAssistantStore } from "@/store/useAssistantStore";

export function AtmosphericTelemetry() {
  const { weatherData } = useAssistantStore();
  const [pressure, setPressure] = useState(1013);
  
  // Simulate fluctuating atmospheric pressure
  useEffect(() => {
    const interval = setInterval(() => {
      setPressure(prev => prev + (Math.random() * 2 - 1));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chamfer-card light-pipe-cyan glass-panel p-4 w-52 sm:w-56 text-left group hover:shadow-[0_0_25px_rgba(0,242,255,0.25)] transition-all duration-300">
      <div className="flex items-center justify-between mb-3 border-b border-cyan/20 pb-2">
        <div className="flex items-center gap-1.5">
          <Cloud size={12} className="text-cyan animate-pulse glow-cyan" />
          <span className="font-mono text-[9px] text-cyan font-extrabold tracking-widest uppercase">
            [MOD_METEO_08]
          </span>
        </div>
        <span className="font-mono text-[8px] text-[#00ff9d] uppercase tracking-wider font-bold animate-pulse">
          LIVE
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-cyan/70">
            <Thermometer size={10} />
            <span className="font-mono text-[8px] font-bold tracking-wider">TEMP_CORE</span>
          </div>
          <span className="font-mono text-xs text-amber-400 font-extrabold glow-cyan">{weatherData?.temp || "24"}°C</span>
        </div>
        
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-cyan/70">
            <Droplets size={10} />
            <span className="font-mono text-[8px] font-bold tracking-wider">HUMIDITY</span>
          </div>
          <span className="font-mono text-xs text-cyan font-extrabold">{weatherData ? "45" : "68"}%</span>
        </div>
        
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-cyan/70">
            <Wind size={10} />
            <span className="font-mono text-[8px] font-bold tracking-wider">WIND_VEL</span>
          </div>
          <span className="font-mono text-xs text-cyan font-extrabold">12 KM/H</span>
        </div>
        
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-cyan/70">
            <Sun size={10} />
            <span className="font-mono text-[8px] font-bold tracking-wider">UV_RAD</span>
          </div>
          <span className="font-mono text-xs text-[#00ff9d] font-extrabold">IDX 4.2</span>
        </div>
      </div>

      <div className="bg-surface-container-lowest/80 border border-cyan/20 p-2 rounded-sm relative overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <span className="font-mono text-[8px] text-cyan/60 tracking-wider">ATM_PRESSURE</span>
          <span className="font-mono text-[10px] text-cyan font-bold">{pressure.toFixed(1)} hPa</span>
        </div>
        {/* Animated Pressure Graph */}
        <div className="h-4 w-full flex items-end gap-[1px]">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ height: "20%" }}
              animate={{ height: `${20 + Math.random() * 80}%` }}
              transition={{ duration: 1 + Math.random(), repeat: Infinity, repeatType: "mirror" }}
              className="w-full bg-cyan/40"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
