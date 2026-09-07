"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Crosshair, ShieldCheck, Zap } from "lucide-react";
import { playPing, playChirp } from "@/utils/cyberSound";
import { useAssistantStore } from "@/store/useAssistantStore";

interface RadarNode {
  id: string;
  label: string;
  x: number; // percentage from center (-50 to 50)
  y: number; // percentage from center (-50 to 50)
  dist: string;
  type: "friendly" | "satellite" | "beacon";
}

const INITIAL_NODES: RadarNode[] = [
  { id: "node-1", label: "SAT_COMM_04", x: 22, y: -28, dist: "142 KM", type: "satellite" },
  { id: "node-2", label: "NODE_ALPHA", x: -32, y: 15, dist: "86 KM", type: "friendly" },
  { id: "node-3", label: "RELAY_BEACON_Z", x: 18, y: 34, dist: "189 KM", type: "beacon" },
  { id: "node-4", label: "LOCAL_GATEWAY", x: -14, y: -36, dist: "48 KM", type: "friendly" },
];

export const RadarScanner: React.FC = () => {
  const { appendLog } = useAssistantStore();
  const [isPinging, setIsPinging] = useState(false);
  const [azimuth, setAzimuth] = useState(142);
  const [activeNode, setActiveNode] = useState<RadarNode | null>(null);

  // Live rotating azimuth simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAzimuth((prev) => (prev + 3) % 360);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  const triggerRadarSweep = () => {
    setIsPinging(true);
    playPing(960);
    appendLog("RADAR: Active pulse sweep initiated. Scanning orbital sectors 0-360°...");
    setTimeout(() => {
      setIsPinging(false);
      appendLog("RADAR: Sweep complete. 4 orbital nodes verified, sector 100% secure.");
    }, 1600);
  };

  return (
    <div className="chamfer-card light-pipe-cyan bg-surface-container-low/85 backdrop-blur-xl p-4 w-56 flex flex-col gap-3 transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,242,255,0.25)] text-left group">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cyan/20 pb-2">
        <div className="flex items-center gap-1.5">
          <Radio size={12} className="text-cyan animate-pulse glow-cyan" />
          <span className="font-mono text-[9px] text-cyan font-extrabold tracking-widest uppercase">
            [MOD_RADAR_09]
          </span>
        </div>
        <button
          onClick={triggerRadarSweep}
          className="font-mono text-[8px] text-cyan border border-cyan/30 hover:border-cyan hover:bg-cyan/15 px-2 py-0.5 chamfer-btn transition-all active:scale-95 cursor-pointer uppercase font-bold"
          title="Trigger Sonar Pulse"
        >
          PING
        </button>
      </div>

      {/* Radar Circular Screen */}
      <div
        onClick={triggerRadarSweep}
        className="relative w-full aspect-square rounded-full border border-cyan/30 bg-surface-container-lowest/80 overflow-hidden cursor-pointer flex items-center justify-center shadow-[inset_0_0_20px_rgba(0,242,255,0.15)] group-hover:border-cyan/60 transition-colors"
      >
        {/* Concentric Range Rings */}
        <div className="absolute w-3/4 h-3/4 rounded-full border border-cyan/20 pointer-events-none" />
        <div className="absolute w-1/2 h-1/2 rounded-full border border-cyan/25 pointer-events-none" />
        <div className="absolute w-1/4 h-1/4 rounded-full border border-cyan/30 pointer-events-none" />

        {/* Crosshair Grids */}
        <div className="absolute w-full h-[1px] bg-cyan/15 pointer-events-none" />
        <div className="absolute h-full w-[1px] bg-cyan/15 pointer-events-none" />

        {/* Range Labels */}
        <span className="absolute top-1 font-mono text-[7px] text-cyan/40">200KM</span>
        <span className="absolute right-1 font-mono text-[7px] text-cyan/40">090°</span>
        <span className="absolute bottom-1 font-mono text-[7px] text-cyan/40">180°</span>
        <span className="absolute left-1 font-mono text-[7px] text-cyan/40">270°</span>

        {/* 360-degree Sweeping Laser Line */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none origin-center transform-gpu will-change-transform"
        >
          {/* Laser beam */}
          <div
            className="w-1/2 h-full absolute right-0 top-0"
            style={{
              background:
                "conic-gradient(from 180deg at 0% 50%, rgba(0,242,255,0.35) 0deg, rgba(0,242,255,0.08) 35deg, transparent 60deg)",
              transformOrigin: "0% 50%",
            }}
          />
          <div className="absolute w-1/2 h-[1.5px] right-0 bg-cyan shadow-[0_0_8px_#00f2ff]" />
        </motion.div>

        {/* Radar Ping Ripple Wave */}
        <AnimatePresence>
          {isPinging && (
            <motion.div
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              className="absolute w-full h-full rounded-full border-2 border-cyan shadow-[0_0_15px_#00f2ff] pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Target Blips */}
        {INITIAL_NODES.map((node) => (
          <div
            key={node.id}
            onClick={(e) => {
              e.stopPropagation();
              setActiveNode(node);
              playChirp(2200);
              appendLog(`RADAR: Target locked [${node.label}] at ${node.dist}.`);
            }}
            className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 group/blip"
            style={{
              left: `${50 + node.x}%`,
              top: `${50 + node.y}%`,
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: Math.random() }}
              className={`w-2 h-2 rounded-full ${
                node.type === "satellite"
                  ? "bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]"
                  : node.type === "beacon"
                  ? "bg-[#ffaa00] shadow-[0_0_8px_#ffaa00]"
                  : "bg-[#00ff9d] shadow-[0_0_8px_#00ff9d]"
              }`}
            />
          </div>
        ))}

        {/* Center Origin Dot */}
        <div className="w-1.5 h-1.5 rounded-full bg-cyan shadow-[0_0_6px_#00f2ff] z-10" />
      </div>

      {/* Target Readout / Telemetry */}
      <div className="font-mono text-[8px] flex flex-col gap-1 border-t border-cyan/20 pt-2 text-foreground/70">
        <div className="flex justify-between items-center">
          <span>AZIMUTH_TRACK:</span>
          <span className="text-cyan font-bold glow-cyan">{String(azimuth).padStart(3, "0")}° AZ</span>
        </div>
        <div className="flex justify-between items-center">
          <span>TARGET_LOCKED:</span>
          <span className="text-[#00ff9d] font-bold truncate max-w-[100px]">
            {activeNode ? activeNode.label : "ORBIT_GRID"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>THREAT_INDEX:</span>
          <span className="text-[#00ff9d] font-extrabold flex items-center gap-1">
            <ShieldCheck size={10} /> 0.00% [CLEAR]
          </span>
        </div>
      </div>
    </div>
  );
};
