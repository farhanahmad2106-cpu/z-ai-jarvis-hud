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
          initial={{ opacity: 0, x: 80, scale: 0.8, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: 50, scale: 0.9, filter: 'blur(5px)' }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="absolute top-24 right-12 z-50 flex items-center gap-6 p-6 rounded-3xl bg-background/40 backdrop-blur-2xl border-t border-l border-surface-tint/40 border-b-2 border-r-2 border-surface-tint/10 shadow-[0_15px_40px_rgba(0,219,231,0.2),inset_0_0_20px_rgba(0,219,231,0.1)] group hover:shadow-[0_15px_50px_rgba(0,219,231,0.3),inset_0_0_30px_rgba(0,219,231,0.2)] transition-shadow duration-500"
        >
          <div className="flex flex-col items-end">
            <span className="font-sans font-black text-5xl text-surface-tint tracking-tighter drop-shadow-[0_0_15px_rgba(0,219,231,0.8)] group-hover:drop-shadow-[0_0_25px_rgba(0,219,231,1)] transition-all">
              {weatherData.temp}°
            </span>
            <span className="font-mono text-[10px] text-surface-tint/80 tracking-widest uppercase mt-2 glow-sm">
              {weatherData.condition}
            </span>
            <span className="font-mono text-xs text-foreground font-bold mt-1 tracking-wide">
              {weatherData.location}
            </span>
          </div>
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-surface-tint/50 to-transparent mx-2" />
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center justify-center glow-sm drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
          >
            {getIcon(weatherData.condition)}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
