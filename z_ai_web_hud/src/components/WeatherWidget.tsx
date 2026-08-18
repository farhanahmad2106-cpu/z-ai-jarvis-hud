"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAssistantStore } from "@/store/useAssistantStore";
import { CloudRain, Sun, Cloud, CloudLightning, Snowflake } from "lucide-react";

export function WeatherWidget() {
  const { weatherData } = useAssistantStore();

  const getIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("rain") || c.includes("drizzle")) return <CloudRain size={40} className="text-blue-400" />;
    if (c.includes("thunder") || c.includes("storm")) return <CloudLightning size={40} className="text-yellow-400" />;
    if (c.includes("snow")) return <Snowflake size={40} className="text-white" />;
    if (c.includes("cloud") || c.includes("overcast") || c.includes("fog")) return <Cloud size={40} className="text-gray-300" />;
    return <Sun size={40} className="text-yellow-500" />;
  };

  return (
    <AnimatePresence>
      {weatherData && (
        <motion.div
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 50, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute top-12 right-12 z-50 flex items-center gap-6 p-6 rounded-2xl bg-surface-container/60 backdrop-blur-xl border border-surface-tint/30 shadow-[0_0_30px_rgba(6,182,212,0.15)]"
        >
          <div className="flex flex-col items-end">
            <span className="font-sans font-black text-5xl text-surface-tint tracking-tighter glow-sm">
              {weatherData.temp}°
            </span>
            <span className="font-mono text-[10px] text-surface-tint/70 tracking-widest uppercase mt-1">
              {weatherData.condition}
            </span>
            <span className="font-mono text-xs text-foreground font-bold mt-2">
              {weatherData.location}
            </span>
          </div>
          <div className="w-px h-16 bg-surface-tint/20 mx-2" />
          <div className="flex items-center justify-center glow-sm drop-shadow-md">
            {getIcon(weatherData.condition)}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
