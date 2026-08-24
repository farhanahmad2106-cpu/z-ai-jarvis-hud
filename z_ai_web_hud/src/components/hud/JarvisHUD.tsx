import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssistantStore } from '@/store/useAssistantStore';
import { useVoiceInterface } from '@/hooks/useVoiceInterface';
import { 
  Terminal as TerminalIcon, Shield, Cpu, Activity, Network, 
  Settings2, Menu, X, Check, RotateCcw, Volume2, 
  SlidersHorizontal, RefreshCw, Power, Radio, Layers, Wifi, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { 
  ALTIMETER_MATRIX, 
  CPU_NOMINAL_LOAD, 
  CPU_THINKING_LOAD, 
  TEMP_NOMINAL_CELSIUS, 
  TEMP_THINKING_CELSIUS, 
  WAVEFORM_PATHS, 
  DIAGNOSTICS_RESPONSE 
} from '@/utils/hudConfig';
import { Visualizer } from '@/components/Visualizer';
import { WeatherWidget } from '@/components/WeatherWidget';
import BrokenByDesign from '@/components/ui/broken-by-design';

export const JarvisHUD: React.FC = () => {
  const { status, terminalLog, setStatus, appendLog, clearLog, isOnline, setIsOnline } = useAssistantStore();
  const { toggleManualListen } = useVoiceInterface();
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setIsOnline]);

  // Active HUD Command Center Tab
  const [activeTab, setActiveTab] = useState<'terminal' | 'shield' | 'cpu' | 'activity' | 'network'>('terminal');
  
  // Dynamic Telemetry States
  const [shieldCharge, setShieldCharge] = useState(94.2);
  const [isCharging, setIsCharging] = useState(false);
  const [pingLatencies, setPingLatencies] = useState({
    gemini: 32,
    elevenlabs: 114,
    tavily: 84,
    edge: 14,
  });
  const [isPingActive, setIsPingActive] = useState(false);

  // Interactive UI panel states
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGlassHeroOpen, setIsGlassHeroOpen] = useState(false);
  
  // Configuration Settings State
  const [settings, setSettings] = useState({
    volume: 85,
    sensitivity: 70,
    voiceId: 'jsCq9DZjX4fWj9S7y9XN',
    fallbackEnabled: true,
  });

  // Dashboard Modules State (Toggled in left sidebar)
  const [modules, setModules] = useState({
    acoustic: true,
    telemetry: true,
    hologram: true,
  });

  const isListening = status === 'LISTENING';
  const isSpeaking = status === 'SPEAKING';
  const isThinking = status === 'THINKING';

  // Toggle active telemetry modules
  const toggleModule = (moduleName: 'acoustic' | 'telemetry' | 'hologram') => {
    const updated = !modules[moduleName];
    setModules(prev => ({ ...prev, [moduleName]: updated }));
    
    const label = moduleName.toUpperCase();
    const stateLabel = updated ? "ONLINE" : "STANDBY";
    appendLog(`SYSTEM: ${label} module set to ${stateLabel}.`);
  };

  return (
    <main className={`relative h-screen w-full flex items-center justify-center p-8 overflow-hidden transform-gpu select-none ${!isOnline ? 'offline-mode' : ''}`}>
      {!isOnline && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] border border-[#ffaa00]/40 bg-[#ffaa00]/10 px-8 py-2 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(255,170,0,0.3)] pointer-events-none">
          <span className="font-mono text-xs font-extrabold text-[#ffaa00] tracking-[0.4em] animate-pulse">NETWORK OFFLINE - RUNNING LOCAL</span>
        </div>
      )}
      <WeatherWidget />
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-8 py-4 border-b border-outline/20 bg-background/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Menu 
            className="text-surface-tint hover:glow-sm cursor-pointer transition-all active:scale-95 hover:text-surface-tint/80" 
            size={20} 
            onClick={() => {
              setIsSidebarOpen(true);
              appendLog("SYSTEM: Dashboard interface loaded.");
            }}
          />
          <div className="font-sans font-extrabold text-2xl tracking-[0.3em] text-surface-tint glow-sm cursor-default">ZAYD</div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setIsGlassHeroOpen(true);
              appendLog("SYSTEM: 3D BrokenByDesign glass visualizer initialized.");
            }}
            className="font-mono text-[10px] text-surface-tint border border-surface-tint/30 bg-surface-tint/10 hover:bg-surface-tint/20 px-3 py-1 rounded-full flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,219,231,0.2)]"
          >
            <Sparkles size={12} className="animate-pulse" /> 3D_HERO
          </button>
          <span className="font-mono text-[9px] text-surface-tint opacity-40 px-2 py-0.5 border border-surface-tint/20 rounded-md">V1.0.8</span>
          <span className="font-mono text-[10px] text-surface-tint opacity-70 tracking-widest uppercase">{status}</span>
          <Settings2 
            className="text-surface-tint hover:glow-sm cursor-pointer transition-all active:scale-95 hover:text-surface-tint/80" 
            size={20} 
            onClick={() => {
              setIsSettingsOpen(true);
              appendLog("SYSTEM: Config core authorized.");
            }}
          />
        </div>
      </header>

      {/* Left Wing: Altimeter & Telemetry */}
      <aside className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-40">
        <div className="relative">
          <div className={`flex flex-col gap-6 transition-all duration-500 ${modules.telemetry ? '' : 'opacity-20 blur-sm pointer-events-none'}`}>
            <div 
              onClick={() => appendLog("SYSTEM: Calibrating altimeter core... Zero grid offset calibrated at 1123.4 FT.")}
              className="border-glow bg-surface-container/40 backdrop-blur-xl border border-surface-tint/20 p-6 rounded-2xl w-32 cursor-pointer hover:bg-surface-container/70 hover:shadow-[0_0_20px_rgba(0,219,231,0.25)] hover:border-surface-tint/60 transform-gpu transition-all duration-300 active:scale-95 group"
            >
              <div className="font-mono text-[10px] text-surface-tint mb-4 tracking-tighter group-hover:glow-sm transition-all">ALT_METER</div>
              <div className="flex flex-col gap-2">
                {ALTIMETER_MATRIX.map((w, i) => (
                  <motion.div 
                    key={i}
                    initial={{ width: 0 }}
                    animate={{ width: isThinking ? `${Math.random() * 100}%` : `${w}%` }}
                    className={`h-1 transform-gpu will-change-transform ${i === 0 ? 'bg-surface-tint shadow-[0_0_10px_#00dbe7]' : 'bg-surface-tint/60'}`}
                  />
                ))}
              </div>
              <div className="mt-4 font-mono text-xs text-surface-tint">1123.4 FT</div>
            </div>

            <div 
              onClick={() => appendLog("SYSTEM: Recalibrating pitch gyroscopes... Gyro horizon stabilization nominal.")}
              className="border-glow bg-surface-container/40 backdrop-blur-xl border border-surface-tint/20 p-6 rounded-2xl w-32 cursor-pointer hover:bg-surface-container/70 hover:shadow-[0_0_20px_rgba(0,219,231,0.25)] hover:border-surface-tint/60 transform-gpu transition-all duration-300 active:scale-95 group mt-4"
            >
              <div className="font-mono text-[10px] text-surface-tint mb-2 tracking-tighter group-hover:glow-sm transition-all">PITCH</div>
              <div className="relative h-20 w-full flex items-center justify-center overflow-hidden">
                 <div className="absolute w-full h-[1px] bg-surface-tint/30 rotate-12 transform-gpu" />
                 <motion.div 
                  animate={{ rotate: isThinking ? [0, 360] : [12, -12, 12] }}
                  transition={{ duration: isThinking ? 1 : 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-1/2 h-[1px] bg-surface-tint shadow-[0_0_5px_#00dbe7] transform-gpu will-change-transform" 
                 />
              </div>
            </div>
          </div>
          {!modules.telemetry && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-md flex items-center justify-center rounded-xl border border-red-500/20 shadow-[inset_0_0_12px_rgba(239,68,68,0.1)]">
              <span className="font-mono text-[9px] text-red-400 font-extrabold tracking-widest uppercase animate-pulse">STANDBY</span>
            </div>
          )}
        </div>
      </aside>

      {/* Center: Holographic Core */}
      <section 
        className="relative flex items-center justify-center cursor-pointer group z-30 transform-gpu"
        onClick={() => {
          if (modules.acoustic) {
            toggleManualListen();
          } else {
            appendLog("SYSTEM: Acoustic microphone is MUTED. Please enable it in the dashboard sidebar.");
          }
        }}
      >
        <div className={`transition-opacity duration-500 ${modules.hologram ? 'opacity-100' : 'opacity-20'}`}>
          <Visualizer />
        </div>

        {/* Reactive Particles */}
        <AnimatePresence>
          {(isListening || isSpeaking || isThinking) && modules.hologram && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none transform-gpu"
            >
               <motion.div 
                animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: isThinking ? 0.5 : 2, repeat: Infinity }}
                className={`w-full h-full border rounded-full transform-gpu will-change-transform ${isListening ? 'border-[#00ff9d]/30' : 'border-surface-tint/30'}`}
               />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Right Wing: Status & Sensors */}
      <aside className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 text-right z-40">
        <div className="relative">
          <div className={`flex flex-col gap-4 transition-all duration-500 ${modules.telemetry ? '' : 'opacity-20 blur-sm pointer-events-none'}`}>
            <div className="border-glow bg-surface-container/40 backdrop-blur-xl border border-surface-tint/20 p-6 rounded-2xl w-48 transform-gpu hover:shadow-[0_0_20px_rgba(0,219,231,0.15)] transition-all duration-300">
              <div className="flex items-center justify-end gap-2 mb-2">
                <span className="font-mono text-[10px] text-foreground/60 tracking-tighter">STATUS:</span>
                <span className={`font-mono text-[10px] glow-sm font-bold ${isOnline ? 'text-[#00ff9d] animate-pulse' : 'text-[#ffaa00]'}`}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
              <div className="flex items-center justify-end gap-2">
                <span className="font-mono text-[10px] text-foreground/60 tracking-tighter">MIC:</span>
                <motion.span 
                  animate={{ opacity: (isListening && modules.acoustic) ? [1, 0.4, 1] : 1, scale: (isListening && modules.acoustic) ? 1.2 : 1 }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className={`flex h-2 w-2 rounded-full transform-gpu will-change-transform ${(isListening && modules.acoustic) ? 'bg-[#00ff9d] shadow-[0_0_12px_#00ff9d]' : 'bg-[#00ff9d]/50'} ${(!modules.acoustic || !isOnline || status === 'OFFLINE') ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : ''}`}
                />
                <span className={`font-mono text-[10px] font-bold ${(isListening && modules.acoustic) ? 'text-[#00ff9d]' : 'text-[#00ff9d]/60'} ${(!modules.acoustic || !isOnline || status === 'OFFLINE') ? 'text-red-400' : ''}`}>
                  {!modules.acoustic ? 'MUTED' : (!isOnline || status === 'OFFLINE') ? 'OFFLINE' : isListening ? 'LISTENING' : 'ACTIVE'}
                </span>
              </div>
            </div>

            {/* Waveform Sensor */}
            <div 
              onClick={() => {
                if (modules.acoustic) {
                  toggleManualListen();
                  appendLog("SYSTEM: Voice capture manual override triggered.");
                }
              }}
              className="border-glow bg-surface-container/40 backdrop-blur-xl border border-surface-tint/20 p-4 rounded-2xl cursor-pointer hover:bg-surface-container/70 hover:shadow-[0_0_20px_rgba(0,219,231,0.25)] hover:border-surface-tint/60 transform-gpu transition-all duration-300 active:scale-95 group"
            >
              <div className="font-mono text-[10px] text-surface-tint text-left mb-2 tracking-tighter group-hover:glow-sm transition-all">V_INPUT</div>
              <svg className="w-full h-12 stroke-surface-tint fill-none stroke-1" viewBox="0 0 100 30">
                <motion.path 
                  d={WAVEFORM_PATHS.IDLE}
                  animate={{ 
                    d: !modules.acoustic
                      ? WAVEFORM_PATHS.IDLE
                      : isListening 
                      ? WAVEFORM_PATHS.LISTENING 
                      : isSpeaking 
                      ? WAVEFORM_PATHS.SPEAKING 
                      : WAVEFORM_PATHS.IDLE 
                  }}
                  transition={{ duration: 0.3 }}
                  className="opacity-50 transform-gpu will-change-transform" 
                />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-3 transform-gpu">
              <div 
                onClick={() => {
                  setActiveTab('cpu');
                  appendLog("SYSTEM: Navigating to CPU workloads page.");
                }}
                className="border-glow bg-surface-container/30 backdrop-blur-lg border border-surface-tint/10 p-3 rounded-xl transition-all duration-300 hover:bg-surface-container/60 hover:border-surface-tint/50 hover:shadow-[0_0_15px_rgba(0,219,231,0.2)] cursor-pointer active:scale-95 group"
              >
                <div className="font-mono text-[9px] text-foreground/60 group-hover:text-surface-tint/80 transition-colors">CPU_LOAD</div>
                <div className="font-mono text-xs text-surface-tint mt-1 group-hover:glow-sm">{isThinking ? CPU_THINKING_LOAD : CPU_NOMINAL_LOAD}</div>
              </div>
              <div 
                onClick={() => {
                  setActiveTab('cpu');
                  appendLog("SYSTEM: Navigating to CPU core telemetry page.");
                }}
                className="border-glow bg-surface-container/30 backdrop-blur-lg border border-surface-tint/10 p-3 rounded-xl transition-all duration-300 hover:bg-surface-container/60 hover:border-surface-tint/50 hover:shadow-[0_0_15px_rgba(0,219,231,0.2)] cursor-pointer active:scale-95 group"
              >
                <div className="font-mono text-[9px] text-foreground/60 group-hover:text-surface-tint/80 transition-colors">TEMP_CR</div>
                <div className="font-mono text-xs text-surface-tint mt-1 group-hover:glow-sm">{isThinking ? TEMP_THINKING_CELSIUS : TEMP_NOMINAL_CELSIUS}</div>
              </div>
            </div>
          </div>
          {!modules.telemetry && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-md flex items-center justify-center rounded-xl border border-red-500/20 shadow-[inset_0_0_12px_rgba(239,68,68,0.1)]">
              <span className="font-mono text-[9px] text-red-400 font-extrabold tracking-widest uppercase animate-pulse">STANDBY</span>
            </div>
          )}
        </div>
      </aside>

      {/* Bottom: Multi-Tab Command Center Panel */}
      <section className="absolute bottom-24 left-8 w-[28rem] border-t-2 border-surface-tint/50 bg-background/85 backdrop-blur-2xl p-6 shadow-2xl rounded-tr-3xl min-h-64 max-h-72 overflow-hidden z-[100] transform-gpu border border-surface-tint/10 text-left">
        
        {/* Tab 1: Terminal Logs */}
        {activeTab === 'terminal' && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-3 border-b border-outline/10 pb-2">
              <div className="font-mono text-[10px] text-surface-tint tracking-widest font-extrabold flex items-center gap-1.5">
                <TerminalIcon size={12} className="animate-pulse text-surface-tint" />
                SYSTEM_LOG [MOD_082]
              </div>
              <button 
                onClick={() => {
                  appendLog("SYSTEM: Diagnostic sweep initialized...");
                  DIAGNOSTICS_RESPONSE.forEach((msg, idx) => {
                    setTimeout(() => appendLog(msg), idx * 150);
                  });
                }}
                className="text-[9px] font-mono text-surface-tint border border-surface-tint/30 px-2 py-0.5 rounded hover:bg-surface-tint/10 transition-colors cursor-pointer active:scale-95"
              >
                RUN_DIAGNOSTICS
              </button>
            </div>
            <div className="font-mono text-[10px] text-foreground/70 space-y-1 h-[9.5rem] overflow-y-auto scrollbar-hide flex flex-col-reverse">
              {terminalLog.slice().reverse().map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-surface-tint shrink-0">&gt;</span> 
                  <span className="break-all text-left">{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Deflector Shield */}
        {activeTab === 'shield' && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-3 border-b border-outline/10 pb-2">
              <div className="font-mono text-[10px] text-surface-tint tracking-widest font-extrabold flex items-center gap-1.5">
                <Shield size={12} className="text-surface-tint" />
                DEFLECTOR_SHIELD [MOD_301]
              </div>
              <button 
                disabled={isCharging}
                onClick={() => {
                  setIsCharging(true);
                  appendLog("SHIELD: Charging deflector matrices...");
                  let progress = shieldCharge;
                  const interval = setInterval(() => {
                    progress = Math.min(100, progress + 1.2);
                    setShieldCharge(parseFloat(progress.toFixed(1)));
                    if (progress >= 100) {
                      clearInterval(interval);
                      setIsCharging(false);
                      appendLog("SHIELD: Calibration complete. Integrity stabilized at 100.0%.");
                    }
                  }, 50);
                }}
                className={`text-[9px] font-mono border px-2 py-0.5 rounded transition-all cursor-pointer active:scale-95 ${isCharging ? 'text-[#00ff9d] border-[#00ff9d]/30 bg-[#00ff9d]/5 animate-pulse' : 'text-surface-tint border-surface-tint/30 hover:bg-surface-tint/10'}`}
              >
                {isCharging ? 'CHARGING...' : 'RECHARGE_SHIELD'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 h-[9.5rem] items-center">
              {/* Circular Gauge */}
              <div className="flex flex-col items-center justify-center border-r border-surface-tint/10 pr-2">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="absolute w-full h-full -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="rgba(0, 219, 231, 0.1)" strokeWidth="4" fill="transparent" />
                    <motion.circle 
                      cx="48" cy="48" r="40" 
                      stroke={shieldCharge > 90 ? "#00dbe7" : shieldCharge > 50 ? "#ffaa00" : "#ff3333"} 
                      strokeWidth="4" 
                      fill="transparent" 
                      strokeDasharray="251.2"
                      animate={{ strokeDashoffset: 251.2 - (251.2 * shieldCharge) / 100 }}
                      transition={{ duration: 0.5 }}
                    />
                  </svg>
                  <div className="flex flex-col items-center z-10">
                    <span className="font-mono font-extrabold text-lg text-surface-tint">{shieldCharge}%</span>
                    <span className="font-mono text-[8px] text-foreground/50">INTEGRITY</span>
                  </div>
                </div>
              </div>
              
              {/* Matrix Status */}
              <div className="flex flex-col justify-center gap-2 font-mono text-[10px] text-left">
                <div className="flex justify-between">
                  <span className="text-foreground/50">GRID_SECTOR:</span>
                  <span className="text-surface-tint font-bold">QUADRANT_ALPHA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/50">EM_DAMPENING:</span>
                  <span className="text-[#00ff9d] font-bold">NOMINAL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/50">RESONANCE:</span>
                  <span className="text-surface-tint">432.8 GHZ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/50">GRID_SHIELDS:</span>
                  <span className="text-[#00ff9d] font-bold animate-pulse">STABLE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: CPU Metrics */}
        {activeTab === 'cpu' && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-3 border-b border-outline/10 pb-2">
              <div className="font-mono text-[10px] text-surface-tint tracking-widest font-extrabold flex items-center gap-1.5">
                <Cpu size={12} className="text-surface-tint" />
                CPU_WORKLOAD [MOD_504]
              </div>
              <span className="text-[9px] font-mono text-[#00ff9d] bg-[#00ff9d]/5 px-2 py-0.5 border border-[#00ff9d]/20 rounded animate-pulse font-bold">
                {isThinking ? 'THINKING_BOOST' : 'BALANCED_STATE'}
              </span>
            </div>
            
            <div className="flex flex-col gap-2.5 h-[9.5rem] justify-center text-left">
              {[0, 1, 2, 3].map((core) => {
                const loadVal = isThinking 
                  ? Math.floor(75 + Math.random() * 20) 
                  : Math.floor(15 + Math.random() * 15);
                return (
                  <div key={core} className="flex flex-col gap-1 font-mono text-[9px]">
                    <div className="flex justify-between">
                      <span className="text-foreground/50">CORE_{core} TELEMETRY</span>
                      <span className="text-surface-tint font-bold">{loadVal}% LOAD</span>
                    </div>
                    <div className="h-1 bg-surface-tint/10 rounded-full overflow-hidden">
                      <motion.div 
                        animate={{ width: `${loadVal}%` }} 
                        className="h-full bg-surface-tint shadow-[0_0_8px_#00dbe7]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Vital Signs / Activity */}
        {activeTab === 'activity' && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-3 border-b border-outline/10 pb-2">
              <div className="font-mono text-[10px] text-surface-tint tracking-widest font-extrabold flex items-center gap-1.5">
                <Activity size={12} className="text-surface-tint animate-pulse" />
                BIOMETRIC_STATUS [MOD_812]
              </div>
              <button 
                onClick={() => {
                  appendLog("BIOMETRICS: Calibrating vital sensors... Neural sync recalibrated.");
                }}
                className="text-[9px] font-mono text-surface-tint border border-surface-tint/30 px-2 py-0.5 rounded hover:bg-surface-tint/10 transition-colors cursor-pointer active:scale-95"
              >
                SYNC_VITALS
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 h-[9.5rem] items-center text-left font-mono text-[10px]">
              {/* Pulse & Stats */}
              <div className="flex flex-col justify-center gap-2 border-r border-surface-tint/10 pr-2">
                <div className="flex justify-between">
                  <span className="text-foreground/50">HEART_RATE:</span>
                  <span className="text-red-400 font-bold animate-pulse">{isThinking ? '94' : '72'} BPM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/50">OXYGEN_INDEX:</span>
                  <span className="text-[#00ff9d] font-bold">99.4%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/50">NEURAL_SYNC:</span>
                  <span className="text-surface-tint font-bold">96.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/50">TEMP_INDEX:</span>
                  <span className="text-surface-tint">36.6 °C</span>
                </div>
              </div>

              {/* Dynamic Pulse line */}
              <div className="flex flex-col items-center justify-center">
                <svg className="w-full h-12 stroke-red-400 fill-none stroke-[1.5]" viewBox="0 0 100 30">
                  <motion.path 
                    d="M 0 15 L 20 15 L 25 15 L 30 5 L 35 25 L 40 15 L 60 15 L 65 15 L 70 5 L 75 25 L 80 15 L 100 15"
                    animate={{ 
                      d: isThinking 
                        ? "M 0 15 L 10 15 L 15 15 L 20 5 L 25 25 L 30 15 L 45 15 L 50 2 L 55 28 L 60 15 L 75 15 L 80 5 L 85 25 L 90 15 L 100 15" 
                        : "M 0 15 L 20 15 L 25 15 L 30 5 L 35 25 L 40 15 L 60 15 L 65 15 L 70 5 L 75 25 L 80 15 L 100 15" 
                    }}
                    transition={{ repeat: Infinity, duration: isThinking ? 0.8 : 1.5, ease: "linear" }}
                    className="transform-gpu will-change-transform text-red-500 glow-sm"
                  />
                </svg>
                <span className="text-[8px] text-foreground/40 mt-2 uppercase tracking-widest">ECG_LINK_ONLINE</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Neural Sync / Network */}
        {activeTab === 'network' && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-3 border-b border-outline/10 pb-2">
              <div className="font-mono text-[10px] text-surface-tint tracking-widest font-extrabold flex items-center gap-1.5">
                <Network size={12} className="text-surface-tint" />
                NEURAL_ROUTING [MOD_902]
              </div>
              <button 
                disabled={isPingActive || !isOnline}
                onClick={() => {
                  if (!isOnline) {
                    appendLog("NETWORK_ERROR: Nodes unreachable (Offline).");
                    return;
                  }
                  setIsPingActive(true);
                  appendLog("NETWORK: Pinging active telemetry nodes...");
                  setTimeout(() => {
                    setPingLatencies({
                      gemini: Math.floor(22 + Math.random() * 15),
                      elevenlabs: Math.floor(100 + Math.random() * 25),
                      tavily: Math.floor(75 + Math.random() * 20),
                      edge: Math.floor(10 + Math.random() * 5),
                    });
                    setIsPingActive(false);
                    appendLog("NETWORK: Neural routing optimization sync established.");
                  }, 800);
                }}
                className={`text-[9px] font-mono border px-2 py-0.5 rounded transition-all cursor-pointer active:scale-95 ${isPingActive ? 'text-[#00ff9d] border-[#00ff9d]/30 bg-[#00ff9d]/5 animate-pulse' : 'text-surface-tint border-surface-tint/30 hover:bg-surface-tint/10'}`}
              >
                {isPingActive ? 'PINGING...' : 'PING_NODES'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 h-[9.5rem] items-center text-left font-mono text-[10px]">
              <div className="flex justify-between bg-surface-container/30 border border-surface-tint/5 p-2 rounded-lg">
                <span className="text-foreground/50">GEMINI_API:</span>
                <span className="text-[#00ff9d] font-bold">{pingLatencies.gemini}ms</span>
              </div>
              <div className="flex justify-between bg-surface-container/30 border border-surface-tint/5 p-2 rounded-lg">
                <span className="text-foreground/50">ELEVEN_LABS:</span>
                <span className="text-surface-tint font-bold">{pingLatencies.elevenlabs}ms</span>
              </div>
              <div className="flex justify-between bg-surface-container/30 border border-surface-tint/5 p-2 rounded-lg">
                <span className="text-foreground/50">TAVILY_SEARCH:</span>
                <span className="text-surface-tint font-bold">{pingLatencies.tavily}ms</span>
              </div>
              <div className="flex justify-between bg-surface-container/30 border border-surface-tint/5 p-2 rounded-lg">
                <span className="text-foreground/50">VERCEL_EDGE:</span>
                <span className="text-[#00ff9d] font-bold">{pingLatencies.edge}ms</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Side Dashboard Drawer (Left Sidebar) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-[998] backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-80 bg-background/70 border-r border-surface-tint/20 z-[999] p-8 flex flex-col gap-6 backdrop-blur-3xl shadow-2xl transform-gpu"
            >
              <div className="flex justify-between items-center border-b border-surface-tint/20 pb-4">
                <div className="flex items-center gap-2">
                  <Layers className="text-surface-tint shadow-[0_0_10px_#00dbe7]" size={18} />
                  <span className="font-mono text-xs text-surface-tint tracking-widest font-extrabold">ZAYD_DASHBOARD</span>
                </div>
                <X 
                  className="text-surface-tint hover:text-white cursor-pointer transition-colors active:scale-90" 
                  size={18} 
                  onClick={() => setIsSidebarOpen(false)}
                />
              </div>

              {/* Network Status Modules */}
              <div className="flex flex-col gap-3">
                <div className="font-mono text-[9px] text-foreground/40 uppercase tracking-widest">NETWORK_METRICS</div>
                <div className="flex flex-col gap-2 bg-surface-container/40 p-4 rounded-xl border border-surface-tint/10 font-mono text-[10px] space-y-1 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/70">WEATHER_INDEX:</span>
                    <span className="text-[#00ff9d] font-bold">NOMINAL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/70">TAVILY_SEARCH:</span>
                    <span className="text-[#00ff9d] font-bold">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/70">ELEVENLABS_TTS:</span>
                    <span className="text-[#00ff9d] font-bold">SECURED</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/70">SPEECH_API_LOCAL:</span>
                    <span className="text-[#00ff9d] font-bold">READY</span>
                  </div>
                </div>
              </div>

              {/* Active Modules Switches */}
              <div className="flex flex-col gap-3 text-left">
                <div className="font-mono text-[9px] text-foreground/40 uppercase tracking-widest">CORE_MODULES</div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center p-3 bg-surface-container/30 border border-surface-tint/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Radio size={16} className={modules.acoustic ? "text-surface-tint" : "text-foreground/30"} />
                      <div className="text-left">
                        <div className="font-mono text-[10px] font-bold text-foreground">ACOUSTIC_SENSORS</div>
                        <div className="font-mono text-[8px] text-foreground/40">Real-time voice capture</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleModule('acoustic')}
                      className={`relative w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${modules.acoustic ? 'bg-surface-tint' : 'bg-foreground/20'}`}
                    >
                      <motion.div 
                        layout 
                        className="w-3 h-3 bg-background rounded-full shadow" 
                        animate={{ x: modules.acoustic ? 16 : 0 }} 
                      />
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-surface-container/30 border border-surface-tint/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Activity size={16} className={modules.telemetry ? "text-surface-tint" : "text-foreground/30"} />
                      <div className="text-left">
                        <div className="font-mono text-[10px] font-bold text-foreground">TELEMETRY_OVERRIDE</div>
                        <div className="font-mono text-[8px] text-foreground/40">CPU/Thermal sensors active</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleModule('telemetry')}
                      className={`relative w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${modules.telemetry ? 'bg-surface-tint' : 'bg-foreground/20'}`}
                    >
                      <motion.div 
                        layout 
                        className="w-3 h-3 bg-background rounded-full shadow" 
                        animate={{ x: modules.telemetry ? 16 : 0 }} 
                      />
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-surface-container/30 border border-surface-tint/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Wifi size={16} className={modules.hologram ? "text-surface-tint" : "text-foreground/30"} />
                      <div className="text-left">
                        <div className="font-mono text-[10px] font-bold text-foreground">HOLOGRAPHIC_MATRIX</div>
                        <div className="font-mono text-[8px] text-foreground/40">3D HUD visual rendering</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleModule('hologram')}
                      className={`relative w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${modules.hologram ? 'bg-surface-tint' : 'bg-foreground/20'}`}
                    >
                      <motion.div 
                        layout 
                        className="w-3 h-3 bg-background rounded-full shadow" 
                        animate={{ x: modules.hologram ? 16 : 0 }} 
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-auto flex flex-col gap-2 font-mono text-[10px]">
                <button 
                  onClick={() => {
                    clearLog();
                    appendLog("SYSTEM: Log cleared. Telemetry flushed.");
                  }}
                  className="w-full py-2 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
                >
                  <RotateCcw size={12} />
                  PURGE_LOG_CACHE
                </button>
                <button 
                  onClick={() => {
                    setIsSidebarOpen(false);
                    appendLog("SYSTEM: Core synchronization sequence initialized.");
                    DIAGNOSTICS_RESPONSE.forEach((msg, idx) => {
                      setTimeout(() => appendLog(msg), idx * 150);
                    });
                  }}
                  className="w-full py-2 bg-surface-tint/10 border border-surface-tint/30 hover:bg-surface-tint/20 text-surface-tint rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform cursor-pointer"
                >
                  <RefreshCw size={12} className="animate-spin-slow" />
                  RECALIBRATE_SYSTEM
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Core Configuration Dialog (Settings Modal) */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            {/* Modal */}
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-md bg-surface-container/90 border border-surface-tint/30 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl flex flex-col gap-6 z-10 transform-gpu"
            >
              <div className="flex justify-between items-center border-b border-surface-tint/20 pb-4">
                <div className="flex items-center gap-2">
                  <Settings2 className="text-surface-tint shadow-[0_0_10px_#00dbe7]" size={18} />
                  <span className="font-mono text-xs text-surface-tint tracking-widest font-extrabold">CORE_CONFIG</span>
                </div>
                <X 
                  className="text-surface-tint hover:text-white cursor-pointer transition-colors active:scale-90" 
                  size={18} 
                  onClick={() => setIsSettingsOpen(false)}
                />
              </div>

              {/* Sliders */}
              <div className="flex flex-col gap-4 font-mono text-[10px]">
                {/* Volume Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-foreground/70">
                    <span>AUDIO_OUTPUT_VOLUME:</span>
                    <span className="text-surface-tint font-bold">{settings.volume}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Volume2 size={14} className="text-surface-tint" />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={settings.volume} 
                      onChange={(e) => {
                        const vol = Number(e.target.value);
                        setSettings(prev => ({ ...prev, volume: vol }));
                      }}
                      onMouseUp={() => appendLog(`SYSTEM: Output volume adjusted to ${settings.volume}%.`)}
                      className="w-full h-1 bg-surface-tint/20 rounded-lg appearance-none cursor-pointer accent-surface-tint outline-none"
                    />
                  </div>
                </div>

                {/* Sensitivity Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-foreground/70">
                    <span>MIC_SENSITIVITY_THRESHOLD:</span>
                    <span className="text-[#00ff9d] font-bold">{settings.sensitivity}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <SlidersHorizontal size={14} className="text-[#00ff9d]" />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={settings.sensitivity} 
                      onChange={(e) => {
                        const sens = Number(e.target.value);
                        setSettings(prev => ({ ...prev, sensitivity: sens }));
                      }}
                      onMouseUp={() => appendLog(`SYSTEM: Mic threshold calibrated at ${settings.sensitivity}%.`)}
                      className="w-full h-1 bg-[#00ff9d]/20 rounded-lg appearance-none cursor-pointer accent-[#00ff9d] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Text Select Dropdowns */}
              <div className="flex flex-col gap-4 font-mono text-[10px] text-left">
                {/* Voice Presets */}
                <div className="flex flex-col gap-2 text-left">
                  <span className="text-foreground/70">ELEVENLABS_VOICE_PRESET:</span>
                  <select 
                    value={settings.voiceId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSettings(prev => ({ ...prev, voiceId: id }));
                      appendLog(`SYSTEM: Voice telemetry set to custom model index [${id.substring(0, 5)}...].`);
                    }}
                    className="w-full bg-background/50 border border-surface-tint/20 rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-surface-tint cursor-pointer"
                  >
                    <option value="jsCq9DZjX4fWj9S7y9XN">ZAYD Standard (Low-Latency Male)</option>
                    <option value="jsCq9DZjX4fWj9S7y9XN_rachel">Rachel Preset (Edge Optimized Female)</option>
                    <option value="21m00Tcm4TlvDq8ikWAM">Antigravity Premium (Cybernetic Deep Voice)</option>
                  </select>
                </div>

                {/* Local Fallback Toggle */}
                <div className="flex justify-between items-center p-4 bg-surface-container/30 border border-surface-tint/10 rounded-2xl">
                  <div className="text-left">
                    <span className="block font-bold text-foreground">LOCAL_WEBSPEECH_FALLBACK</span>
                    <span className="block text-[8px] text-foreground/40 mt-0.5">Use browser synthesis if ElevenLabs goes offline</span>
                  </div>
                  <button 
                    onClick={() => {
                      const nextVal = !settings.fallbackEnabled;
                      setSettings(prev => ({ ...prev, fallbackEnabled: nextVal }));
                      appendLog(`SYSTEM: Local WebSpeech fallback set to ${nextVal ? 'ENABLED' : 'DISABLED'}.`);
                    }}
                    className={`relative w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${settings.fallbackEnabled ? 'bg-surface-tint' : 'bg-foreground/20'}`}
                  >
                    <motion.div 
                      layout 
                      className="w-3 h-3 bg-background rounded-full shadow" 
                      animate={{ x: settings.fallbackEnabled ? 16 : 0 }} 
                    />
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={() => {
                  setIsSettingsOpen(false);
                  appendLog("SYSTEM: Configuration settings saved.");
                }}
                className="w-full py-3 bg-surface-tint text-background font-mono text-[10px] font-bold rounded-xl active:scale-95 transition-all hover:bg-surface-tint/90 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,219,231,0.3)] cursor-pointer"
              >
                <Check size={14} />
                APPLY_CHANGES
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BrokenByDesign 3D Glass Hero Modal */}
      <AnimatePresence>
        {isGlassHeroOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[300] bg-[#030407]"
          >
            <button 
              onClick={() => setIsGlassHeroOpen(false)}
              className="absolute top-6 right-6 z-[350] p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur-md transition-all shadow-xl cursor-pointer"
            >
              <X size={20} />
            </button>
            <BrokenByDesign title="broken by design." height="100vh" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 border-t border-outline/20 bg-surface-container/80 backdrop-blur-xl">
        <NavIcon icon={<TerminalIcon size={20} />} active={activeTab === 'terminal'} onClick={() => { setActiveTab('terminal'); appendLog("SYSTEM: Terminal telemetry active."); }} />
        <NavIcon icon={<Shield size={20} />} active={activeTab === 'shield'} onClick={() => { setActiveTab('shield'); appendLog("SYSTEM: Deflector shields status check complete."); }} />
        <NavIcon icon={<Cpu size={20} />} active={activeTab === 'cpu'} onClick={() => { setActiveTab('cpu'); appendLog("SYSTEM: CPU core workload balanced."); }} />
        <NavIcon icon={<Activity size={20} />} active={activeTab === 'activity'} onClick={() => { setActiveTab('activity'); appendLog("SYSTEM: Vital sign telemetry nominal."); }} />
        <NavIcon icon={<Network size={20} />} active={activeTab === 'network'} onClick={() => { setActiveTab('network'); appendLog("SYSTEM: Multi-agent neural link sync established."); }} />
      </nav>
    </main>
  );
};

const NavIcon: React.FC<{ icon: React.ReactNode; active?: boolean; onClick?: () => void }> = ({ icon, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 cursor-pointer transition-all active:scale-90 transform-gpu ${active ? 'text-surface-tint border-t-2 border-surface-tint shadow-[0_-4px_12px_rgba(0,219,231,0.3)] scale-110' : 'text-foreground/40 hover:text-surface-tint hover:opacity-100'}`}
  >
    {icon}
  </div>
);
