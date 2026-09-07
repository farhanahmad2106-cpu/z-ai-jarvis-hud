"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAssistantStore } from "@/store/useAssistantStore";
import { CloudRain, Sun, Cloud, CloudLightning, Snowflake } from "lucide-react";

export function WeatherWidget() {
  const { weatherData } = useAssistantStore();

  const getIcon = (condition: string) => {
    const c = (condition || "").toLowerCase();
    if (c.includes("rain") || c.includes("drizzle")) return <CloudRain size={40} className="text-cyan drop-shadow-[0_0_12px_#00f2ff]" />;
    if (c.includes("thunder") || c.includes("storm")) return <CloudLightning size={40} className="text-amber drop-shadow-[0_0_12px_#ffaa00]" />;
    if (c.includes("snow")) return <Snowflake size={40} className="text-white drop-shadow-[0_0_12px_#ffffff]" />;
    if (c.includes("cloud") || c.includes("overcast") || c.includes("fog")) return <Cloud size={40} className="text-outline drop-shadow-[0_0_10px_#568dff]" />;
    return <Sun size={40} className="text-amber drop-shadow-[0_0_15px_#ffaa00]" />;
  };

  return (
    <AnimatePresence>
      {weatherData && (
        <motion.div
          initial={{ opacity: 0, x: 80, scale: 0.8, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: 50, scale: 0.9, filter: 'blur(5px)' }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="absolute top-24 right-12 z-50 flex items-center gap-6 p-6 chamfer-card bg-surface-container-low/80 backdrop-blur-2xl light-pipe-cyan group hover:shadow-[0_0_30px_rgba(0,242,255,0.3)] transition-all duration-500"
        >
          <div className="flex flex-col items-end">
            <span className="font-mono text-[9px] text-cyan/70 tracking-[0.25em] uppercase mb-1">
              [MOD_METEO_082]
            </span>
            <span className="font-sans font-black text-5xl text-cyan tracking-tighter glow-cyan group-hover:drop-shadow-[0_0_25px_rgba(0,242,255,1)] transition-all">
              {weatherData.temp}°
            </span>
            <span className="font-mono text-[10px] text-cyan/90 tracking-widest uppercase mt-2">
              {weatherData.condition}
            </span>
            <span className="font-mono text-xs text-foreground font-bold mt-1 tracking-wide">
              {weatherData.location}
            </span>
          </div>
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-cyan/40 to-transparent mx-2" />
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center justify-center glow-cyan"
          >
            {getIcon(weatherData.condition)}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

