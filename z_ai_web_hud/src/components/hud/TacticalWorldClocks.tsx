"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Clock } from "lucide-react";

export function TacticalWorldClocks() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date, timeZone: string) => {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  };

  const clocks = [
    { label: "UTC_CORE", tz: "UTC", coords: "0.0000° N, 0.0000° E" },
    { label: "TOKYO_SEC", tz: "Asia/Tokyo", coords: "35.6762° N, 139.6503° E" },
    { label: "NYC_GRID", tz: "America/New_York", coords: "40.7128° N, 74.0060° W" },
    { label: "LON_LINK", tz: "Europe/London", coords: "51.5074° N, 0.1278° W" },
  ];

  return (
    <div className="chamfer-card light-pipe-cyan glass-panel p-3 w-52 text-left group hover:shadow-[0_0_25px_rgba(0,242,255,0.25)] transition-all duration-300">
      <div className="flex items-center justify-between mb-3 border-b border-cyan/20 pb-1.5">
        <div className="flex items-center gap-1.5">
          <Globe size={11} className="text-cyan animate-spin-slow glow-cyan" />
          <span className="font-mono text-[9px] text-cyan font-extrabold tracking-widest uppercase">
            [MOD_GEO_SYNC]
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {clocks.map((clock, i) => (
          <div key={i} className="flex justify-between items-center bg-surface-container-lowest/50 border border-cyan/10 p-1.5 rounded-sm hover:border-cyan/40 transition-colors">
            <div className="flex flex-col">
              <span className="font-mono text-[8px] text-cyan/70 font-bold tracking-wider">{clock.label}</span>
              <span className="font-mono text-[6px] text-foreground/40">{clock.coords}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={8} className="text-cyan/50" />
              <span className="font-mono text-[10px] text-cyan font-extrabold tracking-wider glow-cyan">
                {formatTime(time, clock.tz)}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-2 border-t border-cyan/20 pt-2 flex items-center justify-between">
        <span className="font-mono text-[7px] text-foreground/50 tracking-widest">NEXT_SAT_PASS:</span>
        <span className="font-mono text-[9px] text-amber-400 font-bold tracking-widest">T-MINUS 12:44</span>
      </div>
    </div>
  );
}
