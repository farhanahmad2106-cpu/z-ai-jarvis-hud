import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssistantStore } from '@/store/useAssistantStore';
import { useVoiceInterface } from '@/hooks/useVoiceInterface';
import { 
  Terminal as TerminalIcon, Shield, Cpu, Activity, Network, 
  Settings2, Menu, X, Check, RotateCcw, Volume2, 
  SlidersHorizontal, RefreshCw, Power, Radio, Layers, Wifi, Sparkles, Zap, Database, Thermometer, User, Maximize2, Minimize2
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
import { RadarScanner } from '@/components/hud/RadarScanner';

// Lazy-load the 3D Visualizer (Three.js ~1MB) — only parsed when the HUD actually renders
const Visualizer = dynamic(
  () => import('@/components/Visualizer').then(mod => ({ default: mod.Visualizer })),
  {
    ssr: false,
    loading: () => (
      <div className="relative flex items-center justify-center w-[260px] h-[260px] sm:w-[280px] sm:h-[280px]">
        <div className="absolute inset-0 rounded-full border border-cyan/20 animate-pulse" />
        <span className="font-mono text-[10px] text-cyan/40 tracking-widest">LOADING HOLOMATRIX...</span>
      </div>
    ),
  }
);
import { ChatInputBar } from '@/components/hud/ChatInputBar';
import { playChirp, playModeShift, isSoundMuted, toggleSoundMute } from '@/utils/cyberSound';
import { VolumeX, Palette, Clock } from 'lucide-react';
import { WeatherWidget } from '@/components/WeatherWidget';
// Lazy-load BrokenByDesign (32KB, Three.js) — only loaded when user opens the 3D hero modal
const BrokenByDesign = dynamic(() => import('@/components/ui/broken-by-design'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-[#030407]">
      <span className="font-mono text-sm text-white/40 tracking-widest animate-pulse">INITIALIZING 3D ENGINE...</span>
    </div>
  ),
});
import { HITLPrompt } from './HITLPrompt';
import { TodoListWidget } from './TodoListWidget';
import { AtmosphericTelemetry } from './AtmosphericTelemetry';
import { TacticalWorldClocks } from './TacticalWorldClocks';
import { NeuralTelemetry } from './NeuralTelemetry';
import { useSession, signOut } from "next-auth/react";

type HudTheme = 'theme-quantum' | 'theme-stealth' | 'theme-combat' | 'theme-crimson' | 'theme-void';

const THEMES: { id: HudTheme; label: string; color: string }[] = [
  { id: 'theme-quantum', label: 'QUANTUM', color: '#00f2ff' },
  { id: 'theme-stealth', label: 'STEALTH', color: '#00ff9d' },
  { id: 'theme-combat', label: 'COMBAT', color: '#ffaa00' },
  { id: 'theme-crimson', label: 'CRIMSON', color: '#ff3366' },
  { id: 'theme-void', label: 'VOID', color: '#bd00ff' },
];

export const JarvisHUD: React.FC = () => {
  const { data: session, status: sessionStatus } = useSession();
  
  const { 
    status, terminalLog, setStatus, appendLog, clearLog, isOnline, setIsOnline,
    pendingCommand, setPendingCommand, commandOutput, setCommandOutput,
    isAgenticMode, setIsAgenticMode,
    contextMemory, flushContextMemory
  } = useAssistantStore();
  const { toggleManualListen } = useVoiceInterface();
  const [ws, setWs] = useState<WebSocket | null>(null);
  
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

  // Connect to Desktop Daemon via WebSocket — only on localhost (not on Vercel production)
  useEffect(() => {
    const isLocal = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1'
    );

    if (!isLocal) {
      // On Vercel/production there's no local daemon — skip WebSocket entirely
      return;
    }

    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      appendLog("SYSTEM: Local desktop daemon connected via WS.");
      setWs(socket);
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'output') {
          setCommandOutput(data.output);
          appendLog(`DAEMON: ${data.output}`);
        } else if (data.type === 'error') {
          setCommandOutput(`ERROR: ${data.error}`);
          appendLog(`DAEMON_ERROR: ${data.error}`);
        } else if (data.type === 'complete') {
          appendLog("DAEMON: Process completed.");
        }
      } catch (err) {
        console.error("WS Message Error", err);
      }
    };

    socket.onclose = () => {
      appendLog("SYSTEM: Local desktop daemon disconnected.");
      setWs(null);
    };

    return () => {
      socket.close();
    };
  }, [appendLog, setCommandOutput]);

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
  const [isCommandCenterExpanded, setIsCommandCenterExpanded] = useState(true);
  
  // Configuration Settings State
  const [settings, setSettings] = useState({
    volume: 85,
    sensitivity: 70,
    voiceId: 'jsCq9DZjX4fWj9S7y9XN',
    fallbackEnabled: true,
  });

  // Dashboard Modules State (Toggled in left sidebar)
  
  // Tactical Theme State

  const [hudTheme, setHudTheme] = useState<HudTheme>('theme-quantum');
  const [soundMuted, setSoundMuted] = useState(false);
  const [utcTime, setUtcTime] = useState('');
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('zayd_hud_theme') as HudTheme;
      if (savedTheme && THEMES.some(t => t.id === savedTheme)) {
        setHudTheme(savedTheme);
      }
      setSoundMuted(isSoundMuted());
    }
  }, []);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);
    const uptimeInterval = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => {
      clearInterval(clockInterval);
      clearInterval(uptimeInterval);
    };
  }, []);

  const cycleTheme = () => {
    const currentIndex = THEMES.findIndex(t => t.id === hudTheme);
    const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];
    setHudTheme(nextTheme.id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zayd_hud_theme', nextTheme.id);
    }
    playModeShift(1.1);
    appendLog(`SYSTEM: Tactical HUD protocol shifted to [${nextTheme.label}].`);
  };

  const handleToggleSound = () => {
    const muted = toggleSoundMute();
    setSoundMuted(muted);
    if (!muted) playChirp(2000);
    appendLog(`SYSTEM: Synthetic audio feedback ${muted ? 'MUTED' : 'ENGAGED'}.`);
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const currentThemeObj = THEMES.find(t => t.id === hudTheme) || THEMES[0];

  // Terminal Command Input State ('CMND')
  const [isCmdInputOpen, setIsCmdInputOpen] = useState(false);
  const [terminalCmdInput, setTerminalCmdInput] = useState('');

  const handleExecuteTerminalCmd = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = terminalCmdInput.trim();
    if (!cmd) return;
    playChirp(1900);
    appendLog(`OPERATOR_CMD: ${cmd}`);
    setTerminalCmdInput('');

    // If it requires human authorization, trigger HITL
    if (/^(rm|del|systemctl|service|kill|pkill)\\b/i.test(cmd)) {
      setPendingCommand(cmd);
      appendLog("SYSTEM: Elevated authorization required for this action.");
      return;
    }

    // Dispatch to local desktop daemon if connected
    if (ws && ws.readyState === WebSocket.OPEN) {
      appendLog("SYSTEM: Dispatching command to desktop daemon...");
      ws.send(JSON.stringify({ type: 'execute', command: cmd }));
    } else {
      setTimeout(() => {
        appendLog(`DAEMON_MOCK: [${cmd}] executed via local environment.`);
      }, 300);
    }
  };


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
    <main className={`relative h-screen w-full flex items-center justify-center p-8 overflow-hidden transform-gpu select-none ${!isOnline ? 'offline-mode' : ''} ${hudTheme}`}>
      {!isOnline && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] border border-[#ffaa00]/40 bg-[#ffaa00]/10 px-8 py-2 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(255,170,0,0.3)] pointer-events-none">
          <span className="font-mono text-xs font-extrabold text-[#ffaa00] tracking-[0.4em] animate-pulse">NETWORK OFFLINE - RUNNING LOCAL</span>
        </div>
      )}
      <WeatherWidget />
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-2.5 border-b border-cyan/30 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          <Menu 
            className="text-cyan hover:glow-cyan cursor-pointer transition-all active:scale-95 hover:text-white" 
            size={20} 
            onClick={() => {
              setIsSidebarOpen(true);
              appendLog("SYSTEM: Dashboard interface loaded.");
            }}
          />
          <div className="font-sans font-black text-2xl tracking-[0.35em] text-cyan glow-cyan cursor-default">ZAYD</div>
          <span className="font-mono text-[9px] text-cyan/60 px-2.5 py-0.5 border border-cyan/30 chamfer-card-sm bg-cyan/5">
            [SYS_ACTIVE]
          </span>
          {/* Mission Clock & Uptime Ticker */}
          <div className="hidden md:flex items-center gap-3 border-l border-cyan/30 pl-4">
            <div className="flex flex-col text-left">
              <span className="font-mono text-[8px] text-cyan/40 tracking-wider">MISSION_CLOCK</span>
              <span className="font-mono text-[10px] text-cyan font-bold tracking-widest glow-cyan">
                {utcTime || "00:00:00 UTC"}
              </span>
            </div>
            <div className="flex flex-col text-left border-l border-cyan/20 pl-3">
              <span className="font-mono text-[8px] text-cyan/40 tracking-wider">UPTIME</span>
              <span className="font-mono text-[10px] text-[#00ff9d] font-bold tracking-widest">
                {formatUptime(uptime)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          
          {/* Tactical Protocol Mode Selector */}
          <button
            onClick={cycleTheme}
            className="font-mono text-[10px] text-cyan light-pipe-cyan bg-cyan/10 hover:bg-cyan/25 px-3 py-1.5 chamfer-btn flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,242,255,0.25)] cursor-pointer active:scale-95"
            title="Cycle Tactical HUD Theme Protocol"
          >
            <span 
              className="w-2 h-2 rounded-full animate-pulse shadow-[0_0_8px_currentColor]"
              style={{ backgroundColor: currentThemeObj.color, color: currentThemeObj.color }}
            />
            <span className="tracking-widest font-bold">[{currentThemeObj.label}]</span>
          </button>

          {/* Synthetic Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            className={`font-mono text-[10px] px-2.5 py-1.5 chamfer-btn border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
              !soundMuted 
                ? 'border-cyan/40 text-cyan bg-cyan/10 hover:bg-cyan/25 shadow-[0_0_12px_rgba(0,242,255,0.2)]' 
                : 'border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20'
            }`}
            title={soundMuted ? "Unmute Synthetic Sound FX" : "Mute Synthetic Sound FX"}
          >
            {!soundMuted ? <Volume2 size={13} className="text-cyan animate-pulse" /> : <VolumeX size={13} className="text-red-400" />}
          </button>

          <button
            onClick={() => {
              setIsGlassHeroOpen(true);
              appendLog("SYSTEM: 3D BrokenByDesign glass visualizer initialized.");
            }}
            className="font-mono text-[10px] text-cyan light-pipe-cyan bg-cyan/10 hover:bg-cyan/25 px-4 py-1.5 chamfer-btn flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,242,255,0.25)] cursor-pointer"
          >
            <Sparkles size={12} className="animate-pulse" /> 3D_HERO
          </button>
          <span className="font-mono text-[9px] text-cyan/50 px-2 py-0.5 border border-cyan/20 chamfer-card-sm">V1.1.0</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-sm border border-cyan/40 bg-cyan/10 shadow-[0_0_12px_rgba(0,242,255,0.2)]">
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              status === 'LISTENING' ? 'bg-[#00ff9d] shadow-[0_0_8px_#00ff9d]' :
              status === 'THINKING' ? 'bg-[#ffaa00] shadow-[0_0_8px_#ffaa00]' :
              status === 'SPEAKING' ? 'bg-[#00f2ff] shadow-[0_0_8px_#00f2ff]' :
              'bg-cyan/80 shadow-[0_0_8px_#00f2ff]'
            }`} />
            <span className="font-mono text-[10px] text-cyan font-extrabold tracking-widest uppercase glow-cyan">
              STATUS: [{status}]
            </span>
          </div>
          
          {session?.user ? (
            <div className="flex items-center gap-2 border-l border-cyan/30 pl-4 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
              <div className="flex flex-col text-left">
                <span className="font-mono text-[8px] text-cyan/40 tracking-wider">OPERATOR</span>
                <span className="font-mono text-[10px] text-emerald-400 tracking-widest uppercase font-bold max-w-[120px] truncate">
                  {session.user.name || "OPERATOR"}
                </span>
              </div>
              <button 
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-[9px] font-mono text-cyan/60 hover:text-red-400 px-2 py-1 border border-cyan/20 hover:border-red-400/50 chamfer-btn transition-all hover:bg-red-500/10 cursor-pointer ml-1"
                title="Disconnect Session"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-cyan/30 pl-4 ml-2">
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-mono text-[8px] text-cyan/40 tracking-wider">PROFILE</span>
                <span className="font-mono text-[10px] text-cyan/60 tracking-widest uppercase">
                  GUEST
                </span>
              </div>
              <Link
                href="/auth"
                className="font-mono text-[10px] text-cyan light-pipe-cyan bg-cyan/10 hover:bg-cyan/25 px-3 py-1.5 chamfer-btn flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(0,242,255,0.25)] hover:text-white cursor-pointer group"
                title="Sign in or create account"
              >
                <User size={12} className="text-cyan group-hover:drop-shadow-[0_0_8px_rgba(0,242,255,1)]" />
                <span className="tracking-widest">LOGIN / SIGNUP</span>
              </Link>
            </div>
          )}

          <Settings2 
            className="text-cyan hover:glow-cyan cursor-pointer transition-all active:scale-95 hover:text-white" 
            size={20} 
            onClick={() => {
              setIsSettingsOpen(true);
              appendLog("SYSTEM: Config core authorized.");
            }}
          />
        </div>
      </header>

      {/* Left Wing: Altimeter & Telemetry */}
      <aside 
        className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-40 max-h-[calc(100vh-140px)] overflow-y-auto pb-4 pl-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-cyan/50 [&::-webkit-scrollbar-track]:bg-cyan/10 hover:[&::-webkit-scrollbar-thumb]:bg-cyan/80"
        style={{ direction: 'rtl' }}
      >
        <div className="relative" style={{ direction: 'ltr' }}>
          <div className={`flex flex-col gap-6 transition-all duration-500 ${modules.telemetry ? '' : 'opacity-20 blur-sm pointer-events-none'}`}>
            <TodoListWidget />

            <div 
              onClick={() => appendLog("SYSTEM: Calibrating altimeter core... Zero grid offset calibrated at 1123.4 FT.")}
              className="chamfer-card light-pipe-cyan glass-panel p-5 w-36 cursor-pointer hover:bg-surface-container/90 hover:shadow-[0_0_25px_rgba(0,242,255,0.3)] transition-all duration-300 active:scale-95 group"
            >
              <div className="font-mono text-[9px] text-cyan/70 mb-1 tracking-[0.2em] uppercase">
                [MOD_014]
              </div>
              <div className="font-mono text-[10px] text-cyan mb-3 tracking-wider group-hover:glow-cyan transition-all font-bold">
                ALT_METER
              </div>
              <div className="flex flex-col gap-1.5">
                {ALTIMETER_MATRIX.map((w, i) => (
                  <motion.div 
                    key={i}
                    initial={{ width: 0 }}
                    animate={{ width: isThinking ? `${Math.random() * 100}%` : `${w}%` }}
                    className={`h-1 transform-gpu will-change-transform ${i === 0 ? 'bg-cyan shadow-[0_0_10px_#00f2ff]' : 'bg-cyan/50'}`}
                  />
                ))}
              </div>
              <div className="mt-3 font-mono text-xs text-cyan font-bold glow-cyan">1123.4 FT</div>
            </div>

            <div 
              onClick={() => appendLog("SYSTEM: Recalibrating pitch gyroscopes... Gyro horizon stabilization nominal.")}
              className="chamfer-card light-pipe-cyan glass-panel p-5 w-36 cursor-pointer hover:bg-surface-container/90 hover:shadow-[0_0_25px_rgba(0,242,255,0.3)] transition-all duration-300 active:scale-95 group"
            >
              <div className="font-mono text-[9px] text-cyan/70 mb-1 tracking-[0.2em] uppercase">
                [MOD_082]
              </div>
              <div className="font-mono text-[10px] text-cyan mb-2 tracking-wider group-hover:glow-cyan transition-all font-bold">
                PITCH_GYRO
              </div>
              <div className="relative h-16 w-full flex items-center justify-center overflow-hidden border border-cyan/20 bg-surface-container-lowest/50">
                 <div className="absolute w-full h-[1px] bg-cyan/30 rotate-12 transform-gpu" />
                 <motion.div 
                  animate={{ rotate: isThinking ? [0, 360] : [12, -12, 12] }}
                  transition={{ duration: isThinking ? 1 : 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-3/4 h-[1px] bg-cyan shadow-[0_0_8px_#00f2ff] transform-gpu will-change-transform" 
                 />
              </div>
            </div>

            <AtmosphericTelemetry />
            <TacticalWorldClocks />
          </div>
          {!modules.telemetry && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center chamfer-card light-pipe-amber">
              <span className="font-mono text-[9px] text-amber font-extrabold tracking-widest uppercase animate-pulse">[STANDBY]</span>
            </div>
          )}
        </div>
      </aside>

      {/* Center: Holographic Core & Tactical Command Bar */}
      <section className="relative flex flex-col items-center justify-center z-30 transform-gpu gap-1 my-auto max-h-[calc(100vh-125px)] max-w-2xl px-2">
        <div 
          className="relative flex items-center justify-center cursor-pointer group"
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
        </div>

        {/* Zayd Conversational Chat Interface */}
        <ChatInputBar />
      </section>

      {/* Right Wing: Status & Sensors */}
      <aside className="absolute right-6 top-16 bottom-20 flex flex-col gap-2.5 text-right z-40 overflow-y-auto max-h-[calc(100vh-140px)] pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-cyan/50 [&::-webkit-scrollbar-track]:bg-cyan/10 hover:[&::-webkit-scrollbar-thumb]:bg-cyan/80">
        <div className="relative">
          <div className={`flex flex-col gap-4 transition-all duration-500 ${modules.telemetry ? '' : 'opacity-20 blur-sm pointer-events-none'}`}>
            <RadarScanner />
            <div className="chamfer-card light-pipe-cyan glass-panel p-3.5 w-52 text-left hover:shadow-[0_0_25px_rgba(0,242,255,0.25)] transition-all duration-300">
              <div className="flex items-center justify-between mb-1.5 border-b border-cyan/15 pb-1">
                <span className="font-mono text-[9px] text-cyan/70 tracking-[0.2em] uppercase font-bold">
                  [MOD_SYS_004]
                </span>
                <span className="font-mono text-[8px] text-[#00ff9d] uppercase tracking-wider font-bold">
                  SYS_LINK
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-foreground/70 tracking-wider">STATUS:</span>
                <span className={`font-mono text-[10px] glow-cyan font-bold ${isOnline ? 'text-[#00ff9d] animate-pulse' : 'text-amber'}`}>
                  {isOnline ? '[ONLINE]' : '[OFFLINE]'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-foreground/70 tracking-wider">MIC_CAPT:</span>
                <div className="flex items-center gap-1.5">
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
            </div>

            {/* Waveform Sensor */}
            <div 
              onClick={() => {
                if (modules.acoustic) {
                  toggleManualListen();
                  appendLog("SYSTEM: Voice capture manual override triggered.");
                }
              }}
              className="chamfer-card light-pipe-cyan bg-surface-container-low/80 backdrop-blur-xl p-3 cursor-pointer hover:bg-surface-container/90 hover:shadow-[0_0_25px_rgba(0,242,255,0.3)] transition-all duration-300 active:scale-95 group text-left"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="font-mono text-[10px] text-cyan tracking-wider font-bold group-hover:glow-cyan transition-all">V_INPUT_FREQ</div>
                <div className="font-mono text-[9px] text-cyan/60">[MOD_ACOU_01]</div>
              </div>
              <svg className="w-full h-9 stroke-cyan fill-none stroke-1" viewBox="0 0 100 30">
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
                  className="opacity-70 transform-gpu will-change-transform drop-shadow-[0_0_8px_#00f2ff]" 
                />
              </svg>
            </div>

            <NeuralTelemetry />

            <div className="grid grid-cols-2 gap-3 transform-gpu text-left">
              <div 
                onClick={() => {
                  setActiveTab('cpu');
                  appendLog("SYSTEM: Navigating to CPU workloads page.");
                }}
                className="chamfer-card-sm border border-cyan/30 bg-surface-container-lowest/80 p-2.5 transition-all duration-300 hover:bg-cyan/15 hover:border-cyan hover:shadow-[0_0_18px_rgba(0,242,255,0.25)] cursor-pointer active:scale-95 group"
              >
                <div className="font-mono text-[9px] text-cyan/70 font-bold group-hover:text-cyan transition-colors">CPU_LOAD</div>
                <div className="font-mono text-xs text-cyan mt-1 group-hover:glow-cyan font-extrabold">{isThinking ? CPU_THINKING_LOAD : CPU_NOMINAL_LOAD}</div>
              </div>
              <div 
                onClick={() => {
                  setActiveTab('cpu');
                  appendLog("SYSTEM: Navigating to CPU core telemetry page.");
                }}
                className="chamfer-card-sm border border-cyan/30 bg-surface-container-lowest/80 p-3 transition-all duration-300 hover:bg-cyan/15 hover:border-cyan hover:shadow-[0_0_18px_rgba(0,242,255,0.25)] cursor-pointer active:scale-95 group"
              >
                <div className="font-mono text-[9px] text-cyan/70 font-bold group-hover:text-cyan transition-colors">TEMP_CORE</div>
                <div className="font-mono text-xs text-cyan mt-1 group-hover:glow-cyan font-extrabold">{isThinking ? TEMP_THINKING_CELSIUS : TEMP_NOMINAL_CELSIUS}</div>
              </div>
              <div 
                onClick={() => {
                  setActiveTab('cpu');
                  appendLog("SYSTEM: Navigating to System Performance Metrics.");
                }}
                className="chamfer-card-sm border border-cyan/30 bg-surface-container-lowest/80 p-2 transition-all duration-300 hover:bg-cyan/15 hover:border-cyan hover:shadow-[0_0_18px_rgba(0,242,255,0.25)] cursor-pointer active:scale-95 group col-span-2 text-center"
              >
                <div className="font-mono text-[9px] text-cyan/70 font-bold group-hover:text-cyan transition-colors">SYS_PERFORMANCE</div>
                <div className="font-mono text-[8px] text-cyan/50 mt-0.5 uppercase tracking-widest">CPU / RAM / NET</div>
              </div>
            </div>

            {/* Orbital Radar Scanner Widget */}
            <RadarScanner />
          </div>
          {!modules.telemetry && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-md flex items-center justify-center rounded-xl border border-red-500/20 shadow-[inset_0_0_12px_rgba(239,68,68,0.1)]">
              <span className="font-mono text-[9px] text-red-400 font-extrabold tracking-widest uppercase animate-pulse">STANDBY</span>
            </div>
          )}
        </div>
      </aside>

      {/* Bottom: Multi-Tab Command Center Panel */}
      <section className={`absolute bottom-24 left-8 w-[28rem] chamfer-card light-pipe-cyan bg-surface-container-low/90 backdrop-blur-2xl p-6 shadow-2xl overflow-hidden z-[100] transform-gpu text-left transition-all duration-300 ${isCommandCenterExpanded ? 'min-h-64 max-h-72' : 'min-h-0 h-auto pb-4'}`}>
        
        {/* Tab 1: Terminal Logs */}
        {activeTab === 'terminal' && (
          <div className="flex flex-col h-full">
            <div className={`flex justify-between items-center ${isCommandCenterExpanded ? 'mb-3' : 'mb-0'} border-b border-cyan/20 pb-2`}>
              <div className="font-mono text-[10px] text-cyan tracking-widest font-extrabold flex items-center gap-1.5 glow-cyan">
                <TerminalIcon size={12} className="animate-pulse text-cyan" />
                SYSTEM_LOG [MOD_082]
              </div>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => {
                    playChirp(1900);
                    setIsCmdInputOpen(!isCmdInputOpen);
                  }}
                  className={`text-[9px] font-mono border px-2.5 py-1 chamfer-btn transition-all cursor-pointer active:scale-95 font-bold uppercase tracking-wider ${
                    isCmdInputOpen 
                      ? 'border-[#00ff9d] text-[#00ff9d] bg-[#00ff9d]/20 shadow-[0_0_10px_#00ff9d]' 
                      : 'border-cyan/40 text-cyan hover:bg-cyan/20'
                  }`}
                  title="Toggle Direct Shell Command Execution"
                >
                  CMND
                </button>
                <button 
                  onClick={() => {
                    appendLog("SYSTEM: Diagnostic sweep initialized...");
                    DIAGNOSTICS_RESPONSE.forEach((msg, idx) => {
                      setTimeout(() => appendLog(msg), idx * 150);
                    });
                  }}
                  className="text-[9px] font-mono text-cyan border border-cyan/40 px-2 py-1 chamfer-btn hover:bg-cyan/20 transition-all cursor-pointer active:scale-95 font-bold uppercase tracking-wider"
                >
                  DIAG
                </button>
                <button
                  onClick={() => setPendingCommand("rm -rf /tmp/cache_modules && systemctl restart z-ai-daemon")}
                  className="text-[9px] font-mono text-red-500 border border-red-500/40 px-2 py-1 chamfer-btn hover:bg-red-500/20 transition-all cursor-pointer active:scale-95 font-bold uppercase tracking-wider"
                >
                  HITL
                </button>
                <button 
                  onClick={() => setIsCommandCenterExpanded(!isCommandCenterExpanded)}
                  className="text-cyan/70 hover:text-cyan transition-colors p-1 ml-1"
                  title="Toggle Panel Size"
                >
                  {isCommandCenterExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              </div>
            </div>
            
            <AnimatePresence>
              {isCommandCenterExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col overflow-hidden"
                >
                  {isCmdInputOpen && (
                    <form onSubmit={handleExecuteTerminalCmd} className="flex items-center gap-2 mb-2 p-1.5 bg-black/70 border border-cyan/40 rounded-sm shadow-[inset_0_0_10px_rgba(0,242,255,0.1)] mt-3">
                      <span className="text-cyan font-mono text-xs font-bold pl-1 animate-pulse">&gt;</span>
                      <input 
                        type="text"
                        value={terminalCmdInput}
                        onChange={(e) => setTerminalCmdInput(e.target.value)}
                        placeholder="Enter system command (e.g. systemctl restart, ping, rm, dir)..."
                        className="w-full bg-transparent font-mono text-[10px] text-[#00ff9d] placeholder-cyan/40 focus:outline-none selection:bg-cyan/30"
                        autoFocus
                      />
                      <button type="submit" className="text-[8px] font-mono px-2 py-0.5 bg-cyan text-background font-black uppercase chamfer-btn active:scale-95 cursor-pointer shadow-[0_0_8px_#00f2ff]">
                        EXEC
                      </button>
                    </form>
                  )}
                  <div className={`font-mono text-[10px] text-foreground/80 space-y-1 ${isCmdInputOpen ? 'h-[7rem]' : 'h-[9.5rem] mt-3'} overflow-y-auto scrollbar-hide flex flex-col-reverse`}>
                    {terminalLog.slice().reverse().map((log, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-cyan shrink-0 font-bold">&gt;</span> 
                        <span className="break-all text-left">{log}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Tab 2: Deflector Shield */}
        {activeTab === 'shield' && (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-3 border-b border-cyan/20 pb-2">
              <div className="font-mono text-[10px] text-cyan tracking-widest font-extrabold flex items-center gap-1.5 glow-cyan">
                <Shield size={12} className="text-cyan" />
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
                className={`text-[9px] font-mono border px-2.5 py-1 chamfer-btn transition-all cursor-pointer active:scale-95 uppercase tracking-wider font-bold ${isCharging ? 'text-[#00ff9d] border-[#00ff9d]/50 bg-[#00ff9d]/15 animate-pulse' : 'text-cyan border-cyan/40 hover:bg-cyan/20'}`}
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
                SYS_PERFORMANCE [MOD_504]
              </div>
              <span className="text-[9px] font-mono text-[#00ff9d] bg-[#00ff9d]/5 px-2 py-0.5 border border-[#00ff9d]/20 rounded animate-pulse font-bold">
                {isThinking ? 'THINKING_BOOST' : 'BALANCED_STATE'}
              </span>
            </div>
            
              <div className="flex flex-col gap-2.5 h-[9.5rem] justify-center text-left">
                <div className="grid grid-cols-2 gap-4 h-full">
                  {/* Left col: CPU */}
                  <div className="flex flex-col justify-center gap-3">
                    {[0, 1].map((core) => {
                      const loadVal = isThinking 
                        ? Math.floor(75 + Math.random() * 20) 
                        : Math.floor(15 + Math.random() * 15);
                      return (
                        <div key={core} className="flex flex-col gap-1 font-mono text-[9px]">
                          <div className="flex justify-between">
                            <span className="text-foreground/50">CORE_{core}</span>
                            <span className="text-surface-tint font-bold">{loadVal}%</span>
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
                  {/* Right col: RAM & NET */}
                  <div className="flex flex-col justify-center gap-4 border-l border-outline/10 pl-4">
                    {/* RAM */}
                    <div className="flex flex-col gap-1 font-mono text-[9px]">
                      <div className="flex justify-between">
                         <span className="text-foreground/50">RAM_ALLOC</span>
                         <span className="text-amber-400 font-bold">{isThinking ? '8.4GB' : '2.1GB'}</span>
                      </div>
                      <div className="h-1 bg-surface-tint/10 rounded-full overflow-hidden">
                        <motion.div 
                          animate={{ width: isThinking ? '75%' : '35%' }} 
                          className="h-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" 
                        />
                      </div>
                    </div>
                    {/* Network Graph */}
                    <div className="flex flex-col gap-1 font-mono text-[9px]">
                      <div className="flex justify-between">
                         <span className="text-foreground/50">NET_LATENCY</span>
                         <span className="text-[#00ff9d] font-bold">14ms</span>
                      </div>
                      <svg className="w-full h-5 stroke-[#00ff9d] fill-none stroke-[1.5] mt-1 drop-shadow-[0_0_5px_#00ff9d]" viewBox="0 0 100 20">
                         <motion.path 
                           d="M 0 10 L 20 10 L 30 5 L 40 15 L 50 10 L 80 10 L 90 2 L 100 10" 
                           animate={{ d: isThinking ? "M 0 10 L 10 2 L 20 18 L 30 5 L 40 15 L 50 2 L 60 18 L 70 5 L 80 15 L 90 2 L 100 10" : "M 0 10 L 20 10 L 30 5 L 40 15 L 50 10 L 80 10 L 90 2 L 100 10" }}
                           transition={{ repeat: Infinity, duration: isThinking ? 0.5 : 2, ease: 'linear' }}
                           className="transform-gpu will-change-transform"
                         />
                      </svg>
                    </div>
                  </div>
                </div>
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
              className="fixed inset-y-0 left-0 w-80 bg-background/70 border-r border-surface-tint/20 z-[999] p-8 flex flex-col gap-6 backdrop-blur-3xl shadow-2xl transform-gpu overflow-y-auto scrollbar-hide"
            >
              <div className="flex justify-between items-center border-b border-surface-tint/20 pb-4">
                <div className="flex items-center gap-2">
                  <Layers className="text-cyan glow-cyan" size={18} />
                  <span className="font-mono text-xs text-cyan tracking-widest font-extrabold glow-cyan">[ZAYD_DASHBOARD_SYS]</span>
                </div>
                <X 
                  className="text-cyan hover:text-white cursor-pointer transition-colors active:scale-90" 
                  size={18} 
                  onClick={() => setIsSidebarOpen(false)}
                />
              </div>

              {/* Network Status Modules */}
              <div className="flex flex-col gap-3">
                <div className="font-mono text-[9px] text-cyan/70 uppercase tracking-widest font-bold">[NETWORK_METRICS_01]</div>
                <div className="flex flex-col gap-2 bg-surface-container-lowest/80 p-4 chamfer-card-sm border border-cyan/30 font-mono text-[10px] space-y-1 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80">WEATHER_INDEX:</span>
                    <span className="text-[#00ff9d] font-bold">[NOMINAL]</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80">TAVILY_SEARCH:</span>
                    <span className="text-[#00ff9d] font-bold">[ACTIVE]</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80">ELEVENLABS_TTS:</span>
                    <span className="text-[#00ff9d] font-bold">[SECURED]</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80">SPEECH_API_LOCAL:</span>
                    <span className="text-[#00ff9d] font-bold">[READY]</span>
                  </div>
                </div>
              </div>

              {/* Active Modules Switches */}
              <div className="flex flex-col gap-3 text-left">
                <div className="font-mono text-[9px] text-cyan/70 uppercase tracking-widest font-bold">[CORE_MODULES_TOGGLE]</div>
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center p-3 bg-surface-container-lowest/80 border border-cyan/20 chamfer-card-sm">
                    <div className="flex items-center gap-3">
                      <Radio size={16} className={modules.acoustic ? "text-cyan glow-cyan" : "text-foreground/30"} />
                      <div className="text-left">
                        <div className="font-mono text-[10px] font-bold text-cyan">ACOUSTIC_SENSORS</div>
                        <div className="font-mono text-[8px] text-foreground/50">Real-time voice capture</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleModule('acoustic')}
                      className={`relative w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${modules.acoustic ? 'bg-cyan' : 'bg-foreground/30'}`}
                    >
                      <motion.div 
                        layout 
                        className="w-3 h-3 bg-background rounded-full shadow" 
                        animate={{ x: modules.acoustic ? 16 : 0 }} 
                      />
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-surface-container-lowest/80 border border-cyan/20 chamfer-card-sm">
                    <div className="flex items-center gap-3">
                      <Activity size={16} className={modules.telemetry ? "text-cyan glow-cyan" : "text-foreground/30"} />
                      <div className="text-left">
                        <div className="font-mono text-[10px] font-bold text-cyan">TELEMETRY_OVERRIDE</div>
                        <div className="font-mono text-[8px] text-foreground/50">CPU/Thermal sensors active</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleModule('telemetry')}
                      className={`relative w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${modules.telemetry ? 'bg-cyan' : 'bg-foreground/30'}`}
                    >
                      <motion.div 
                        layout 
                        className="w-3 h-3 bg-background rounded-full shadow" 
                        animate={{ x: modules.telemetry ? 16 : 0 }} 
                      />
                    </button>
                  </div>

                  {/* Agentic Mode (Phase 2) */}
                  <div className="flex justify-between items-center p-3 bg-surface-container-lowest/80 border border-cyan/20 chamfer-card-sm">
                    <div className="flex items-center gap-3">
                      <Zap size={16} className={isAgenticMode ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "text-foreground/30"} />
                      <div className="text-left">
                        <div className={`font-mono text-[10px] font-bold ${isAgenticMode ? 'text-amber-400' : 'text-cyan'}`}>AGENTIC_OVERRIDE</div>
                        <div className="font-mono text-[8px] text-foreground/50">Autonomous action execution</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        const nextState = !isAgenticMode;
                        setIsAgenticMode(nextState);
                        appendLog(`SYSTEM: AGENTIC_OVERRIDE ${nextState ? 'ENGAGED. AI autonomy active.' : 'DISABLED. Manual control restored.'}`);
                      }}
                      className={`relative w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${isAgenticMode ? 'bg-amber-400' : 'bg-foreground/30'}`}
                    >
                      <motion.div 
                        layout 
                        className="w-3 h-3 bg-background rounded-full shadow" 
                        animate={{ x: isAgenticMode ? 16 : 0 }} 
                      />
                    </button>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-surface-container-lowest/80 border border-cyan/20 chamfer-card-sm">
                    <div className="flex items-center gap-3">
                      <Wifi size={16} className={modules.hologram ? "text-cyan glow-cyan" : "text-foreground/30"} />
                      <div className="text-left">
                        <div className="font-mono text-[10px] font-bold text-cyan">HOLOGRAPHIC_MATRIX</div>
                        <div className="font-mono text-[8px] text-foreground/50">3D HUD visual rendering</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleModule('hologram')}
                      className={`relative w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${modules.hologram ? 'bg-cyan' : 'bg-foreground/30'}`}
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
                  className="w-full py-2.5 bg-red-500/10 border border-red-500/40 hover:bg-red-500/25 text-red-400 chamfer-btn flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer font-bold uppercase tracking-wider"
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
                  className="w-full py-2.5 bg-cyan/10 border border-cyan/40 hover:bg-cyan/25 text-cyan chamfer-btn flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,242,255,0.2)]"
                >
                  <RefreshCw size={12} className="animate-spin-slow" />
                  RECALIBRATE_SYSTEM
                </button>
              </div>

              {/* Context & Memory Manager (Phase 3) */}
              <div className="flex flex-col gap-3 mt-4">
                <div className="font-mono text-[9px] text-cyan/70 uppercase tracking-widest font-bold">[MEMORY_CONTEXT]</div>
                <div className="flex flex-col gap-3 p-4 bg-surface-container-lowest/80 border border-cyan/30 chamfer-card-sm text-left">
                  <div className="flex flex-col gap-1 border-b border-cyan/20 pb-3">
                    <span className="font-mono text-[8px] text-foreground/50 tracking-widest uppercase">ACTIVE_TURNS</span>
                    <span className="font-mono text-[10px] text-cyan font-bold tracking-wider">{contextMemory.length} NODES</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="font-mono text-[8px] text-foreground/50 tracking-widest uppercase">MEMORY_STATE</span>
                    <span className={`font-mono text-[9px] font-bold ${contextMemory.length > 0 ? 'text-[#00ff9d] animate-pulse' : 'text-amber-400'}`}>
                      {contextMemory.length > 0 ? 'STORING' : 'CLEARED'}
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      appendLog("MEMORY: Initiating complete context wipe...");
                      setTimeout(() => {
                        flushContextMemory();
                        appendLog("MEMORY: Context arrays successfully flushed.");
                      }, 500);
                    }}
                    className="w-full py-2 bg-amber-500/10 border border-amber-500/50 hover:bg-amber-500/30 text-amber-400 chamfer-btn flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer font-bold uppercase tracking-widest text-[9px] mt-1"
                  >
                    <Database size={12} />
                    FLUSH_MEMORY_BANKS
                  </button>
                </div>
              </div>

              {/* Environmental Sensors (Phase 5) */}
              <div className="flex flex-col gap-3 mt-4">
                <div className="font-mono text-[9px] text-cyan/70 uppercase tracking-widest font-bold">[ENV_SENSORS_04]</div>
                <div className="flex flex-col gap-2 bg-surface-container-lowest/80 p-4 chamfer-card-sm border border-cyan/30 font-mono text-[10px] space-y-1 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80 flex items-center gap-1.5"><Thermometer size={10} className="text-amber-400" /> AMBIENT_TEMP:</span>
                    <span className="text-amber-400 font-bold">22.4°C</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground/80 flex items-center gap-1.5 pl-4">HUMIDITY:</span>
                    <span className="text-cyan font-bold">45%</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-cyan/20">
                    <span className="text-foreground/80">LOCATION:</span>
                    <span className="text-[#00ff9d] font-bold">37.7749° N, 122.4194° W</span>
                  </div>
                </div>
              </div>

              {/* Security & Access Control (Phase 1) */}
              <div className="flex flex-col gap-3 mt-4">
                <div className="font-mono text-[9px] text-cyan/70 uppercase tracking-widest font-bold">[SECURITY_ACCESS]</div>
                <div className="flex flex-col gap-3 p-4 bg-surface-container-lowest/80 border border-cyan/30 chamfer-card-sm text-left">
                  <div className="flex flex-col gap-1 border-b border-cyan/20 pb-3">
                    <span className="font-mono text-[8px] text-foreground/50 tracking-widest uppercase">OPERATOR_ID</span>
                    <span className="font-mono text-[10px] text-cyan font-bold tracking-wider break-all">
                      {session?.user?.email || session?.user?.name || "SYS_ADMIN"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="font-mono text-[8px] text-foreground/50 tracking-widest uppercase">AUTH_STATE</span>
                    <span className="font-mono text-[9px] text-[#00ff9d] font-bold animate-pulse">VERIFIED</span>
                  </div>
                  <button 
                    onClick={() => {
                      appendLog("SECURITY: Force lock initiated. Terminating session...");
                      setTimeout(() => signOut(), 800);
                    }}
                    className="w-full py-2 bg-red-500/10 border border-red-500/50 hover:bg-red-500/30 text-red-400 chamfer-btn flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer font-bold uppercase tracking-widest text-[9px] mt-1"
                  >
                    <Shield size={12} />
                    FORCE_LOCK
                  </button>
                </div>
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
              className="relative w-full max-w-md chamfer-card light-pipe-cyan bg-surface-container-low/95 p-8 shadow-2xl backdrop-blur-2xl flex flex-col gap-6 z-10 transform-gpu text-left"
            >
              <div className="flex justify-between items-center border-b border-cyan/20 pb-4">
                <div className="flex items-center gap-2">
                  <Settings2 className="text-cyan glow-cyan" size={18} />
                  <span className="font-mono text-xs text-cyan tracking-widest font-extrabold glow-cyan">[CORE_CONFIG_SYS]</span>
                </div>
                <X 
                  className="text-cyan hover:text-white cursor-pointer transition-colors active:scale-90" 
                  size={18} 
                  onClick={() => setIsSettingsOpen(false)}
                />
              </div>

              {/* Sliders */}
              <div className="flex flex-col gap-4 font-mono text-[10px]">
                {/* Volume Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-foreground/80">
                    <span>AUDIO_OUTPUT_VOLUME:</span>
                    <span className="text-cyan font-extrabold glow-cyan">{settings.volume}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Volume2 size={14} className="text-cyan" />
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
                      className="w-full h-1 bg-cyan/20 rounded-lg appearance-none cursor-pointer accent-cyan outline-none"
                    />
                  </div>
                </div>

                {/* Sensitivity Slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-foreground/80">
                    <span>MIC_SENSITIVITY_THRESHOLD:</span>
                    <span className="text-[#00ff9d] font-extrabold">{settings.sensitivity}%</span>
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
                  <span className="text-foreground/80 font-bold">ELEVENLABS_VOICE_PRESET:</span>
                  <select 
                    value={settings.voiceId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSettings(prev => ({ ...prev, voiceId: id }));
                      appendLog(`SYSTEM: Voice telemetry set to custom model index [${id.substring(0, 5)}...].`);
                    }}
                    className="w-full bg-surface-container-lowest/90 border border-cyan/30 chamfer-card-sm px-4 py-3 text-cyan font-bold focus:outline-none focus:border-cyan cursor-pointer"
                  >
                    <option value="jsCq9DZjX4fWj9S7y9XN">ZAYD Standard (Low-Latency Male)</option>
                    <option value="jsCq9DZjX4fWj9S7y9XN_rachel">Rachel Preset (Edge Optimized Female)</option>
                    <option value="21m00Tcm4TlvDq8ikWAM">Antigravity Premium (Cybernetic Deep Voice)</option>
                  </select>
                </div>

                {/* Local Fallback Toggle */}
                <div className="flex justify-between items-center p-4 bg-surface-container-lowest/80 border border-cyan/20 chamfer-card-sm">
                  <div className="text-left">
                    <span className="block font-bold text-cyan">LOCAL_WEBSPEECH_FALLBACK</span>
                    <span className="block text-[8px] text-foreground/50 mt-0.5">Use browser synthesis if ElevenLabs goes offline</span>
                  </div>
                  <button 
                    onClick={() => {
                      const nextVal = !settings.fallbackEnabled;
                      setSettings(prev => ({ ...prev, fallbackEnabled: nextVal }));
                      appendLog(`SYSTEM: Local WebSpeech fallback set to ${nextVal ? 'ENABLED' : 'DISABLED'}.`);
                    }}
                    className={`relative w-8 h-4 rounded-full p-0.5 transition-colors duration-300 ${settings.fallbackEnabled ? 'bg-cyan' : 'bg-foreground/30'}`}
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
                className="w-full py-3 bg-cyan text-background font-mono text-[10px] font-extrabold chamfer-btn active:scale-95 transition-all hover:bg-cyan/90 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,255,0.4)] cursor-pointer uppercase tracking-wider"
              >
                <Check size={14} />
                APPLY_CONFIG_CHANGES
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

      {/* HITL: Human-in-the-Loop Consent Modal */}
      <HITLPrompt
        command={pendingCommand}
        onAuthorize={() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            setCommandOutput("Executing...");
            appendLog(`SYSTEM: Executing command: ${pendingCommand}`);
            ws.send(JSON.stringify({ type: 'execute', command: pendingCommand }));
            setPendingCommand(null);
          } else {
            setCommandOutput("ERROR: Daemon not connected.");
            appendLog("SYSTEM: Execution failed. Daemon offline.");
            setPendingCommand(null);
          }
        }}
        onDeny={() => {
          setPendingCommand(null);
          setCommandOutput(null);
          appendLog("SYSTEM: Command execution aborted by operator or timed out.");
        }}
      />

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
    onClick={() => {
      playChirp(1800);
      onClick?.();
    }}
    className={`flex flex-col items-center justify-center p-4 cursor-pointer transition-all active:scale-90 transform-gpu ${active ? 'text-surface-tint border-t-2 border-surface-tint shadow-[0_-4px_12px_rgba(0,219,231,0.3)] scale-110' : 'text-foreground/40 hover:text-surface-tint hover:opacity-100'}`}
  >
    {icon}
  </div>
);
