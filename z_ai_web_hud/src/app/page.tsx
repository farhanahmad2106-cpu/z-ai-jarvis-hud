"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Fingerprint, Unlock } from "lucide-react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

// Dynamically import the heavy HUD component with no SSR to reduce initial bundle size and avoid hydration issues
const JarvisHUD = dynamic(() => import('@/components/hud/JarvisHUD').then(mod => mod.JarvisHUD), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-background">
      <div className="text-surface-tint font-mono text-sm tracking-widest animate-pulse border border-surface-tint/30 p-4 rounded-lg bg-surface-tint/5">
        INITIALIZING CORE SYSTEMS...
      </div>
    </div>
  )
});

export default function Home() {
  const { data: session, status } = useSession();
  const [isLocked, setIsLocked] = useState(true);
  const [authMethod, setAuthMethod] = useState<'face' | 'password'>('face');
  const [scanStatus, setScanStatus] = useState<'scanning' | 'granted'>('scanning');
  const [passcodeError, setPasscodeError] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockdown, setIsLockdown] = useState(false);
  const [lockdownTimer, setLockdownTimer] = useState(0);
  const [lockdownLevel, setLockdownLevel] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  const LOCKDOWN_PENALTIES = [
    15, // 15s
    60, // 1m
    360, // 6m
    2160, // 36m
    3600, // 1h
    21600, // 6h
    64800, // 18h
    129600, // 36h
    518400, // 6d
    1555200, // 18d
    3110400, // 36d
    7776000, // 3mo (90d)
    15552000 // 6mo (180d)
  ];

  const formatLockdownTime = (totalSeconds: number) => {
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    const parts = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 && d === 0) parts.push(`${s}s`);
    
    return parts.join(' ');
  };

  // Preload the heavy HUD component chunk in the background as soon as the page mounts
  useEffect(() => {
    const preloadHUD = () => import('@/components/hud/JarvisHUD');
    preloadHUD();
  }, []);

  // Bypass lock screen if user is already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      setIsLocked(false);
    }
  }, [status]);

  // Handle Webcam feed and simulated biometric scan
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Audio Context utility for synthetic sounds
  const playSound = (type: 'scan' | 'granted') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      if (type === 'scan') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.05);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'granted') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.2);
        
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      }
    } catch (e) {
      console.log('Audio not supported or blocked');
    }
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    let scanInterval: NodeJS.Timeout;
    let grantTimeout: NodeJS.Timeout;
    let unlockTimeout: NodeJS.Timeout;

    if (isLocked && authMethod === 'face') {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream) => {
          stream = mediaStream;
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          
          setScanStatus('scanning');
          
          // Play scanning sound periodically
          scanInterval = setInterval(() => playSound('scan'), 400);

          // Simulate the ML facial recognition processing delay
          grantTimeout = setTimeout(() => {
            clearInterval(scanInterval);
            setScanStatus('granted');
            playSound('granted');
            
            // Wait for granted animation before unlocking
            unlockTimeout = setTimeout(() => {
              setIsLocked(false);
            }, 800);
          }, 2000);
        })
        .catch((err) => {
          console.error("Camera access denied", err);
          setAuthMethod('password'); // Fallback immediately if denied
        });
    }

    // Cleanup: Turn off the camera when unlocked!
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      clearInterval(scanInterval);
      clearTimeout(grantTimeout);
      clearTimeout(unlockTimeout);
    };
  }, [isLocked, authMethod]);

  useEffect(() => {
    if (isLocked) {
      const logs = [
        "> INITIALIZING CORE SYSTEMS...",
        "> CONNECTING TO MAINFRAME...",
        "> ESTABLISHING SECURE CONNECTION...",
        "> LOADING NEURAL NET MODULES...",
        "> VERIFYING ENCRYPTION KEYS...",
        "> CALIBRATING BIOMETRIC SENSORS...",
        "> SYSTEM READY. AWAITING AUTHORIZATION."
      ];
      let i = 0;
      setBootLogs([]);
      const logInterval = setInterval(() => {
        if (i < logs.length) {
          setBootLogs(prev => [...prev, logs[i]]);
          i++;
        } else {
          clearInterval(logInterval);
        }
      }, 500);
      return () => clearInterval(logInterval);
    }
  }, [isLocked]);

  // Lockdown Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLockdown && lockdownTimer > 0) {
      timer = setInterval(() => {
        setLockdownTimer((prev) => prev - 1);
      }, 1000);
    } else if (isLockdown && lockdownTimer <= 0) {
      setIsLockdown(false);
      setFailedAttempts(0);
      setPasscodeError(false);
    }
    return () => clearInterval(timer);
  }, [isLockdown, lockdownTimer]);

  const typingAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      }
    }
  };

  const letterAnimation = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative h-screen w-full bg-background">
      <AnimatePresence mode="wait">
        {isLocked ? (
          <motion.div 
            key="lock-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className={`absolute inset-0 z-[200] flex flex-col items-center justify-center transition-colors duration-1000 ${isLockdown ? 'bg-error/10' : 'bg-background'}`}
          >
            {/* Authenticated User Badge if already logged in */}
            {session?.user?.name && (
              <div className="absolute top-6 left-6 z-30">
                <p className="font-mono text-[10px] text-cyan/50 tracking-widest">
                  OPERATOR: <span className="text-cyan/80">{session.user.name.toUpperCase()}</span>
                </p>
              </div>
            )}

            {/* Terminal Logs Overlay */}
            <div className="absolute top-8 left-8 w-80 font-mono text-[10px] text-cyan/50 tracking-widest leading-relaxed pointer-events-none text-left z-10 flex flex-col gap-1">
              <AnimatePresence>
                {bootLogs.map((log, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -10 }} 
                    animate={{ opacity: 1, x: 0 }}
                    className={log?.includes("READY") ? "text-green-400/80 font-bold" : ""}
                  >
                    {log}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            <div className={`relative flex items-center justify-center mb-8 transform-gpu w-72 h-72 rounded-full overflow-hidden border-[3px] ${isLockdown ? 'border-error shadow-[0_0_50px_rgba(255,0,0,0.4)]' : 'border-surface-tint shadow-[0_0_50px_rgba(0,219,231,0.4)]'} backdrop-blur-md bg-background/20 transition-all duration-500`}>
               
               {/* Live Webcam Feed */}
               {authMethod === 'face' ? (
                 <>
                   <video 
                     ref={videoRef} 
                     autoPlay 
                     playsInline 
                     muted 
                     className="absolute w-full h-full object-cover filter grayscale-[0.8] sepia-[0.3] hue-rotate-[160deg] saturate-200 contrast-125 opacity-70"
                   />
                   <motion.div 
                     animate={{ y: ["-100%", "100%"] }}
                     transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                     className="absolute w-full h-3 bg-surface-tint shadow-[0_0_20px_#00dbe7] opacity-60 z-10 mix-blend-screen"
                   />
                   <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                     {scanStatus === 'scanning' ? (
                       <motion.div
                         animate={{ 
                           scale: [1, 1.1, 1],
                           opacity: [0.7, 1, 0.7]
                         }}
                         transition={{ 
                           duration: 2, 
                           repeat: Infinity, 
                           ease: "easeInOut" 
                         }}
                         className="bg-background/40 p-4 rounded-full backdrop-blur-sm border border-cyan/30"
                       >
                         <Lock size={48} className="text-cyan drop-shadow-[0_0_10px_rgba(0,219,231,1)]" />
                       </motion.div>
                     ) : (
                       <motion.div
                         initial={{ scale: 0.8, opacity: 0 }}
                         animate={{ scale: 1.2, opacity: 1 }}
                         className="bg-green-500/20 p-4 rounded-full backdrop-blur-sm border border-green-400 shadow-[0_0_30px_rgba(74,222,128,0.6)]"
                       >
                         <Unlock size={56} className="text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,1)]" />
                       </motion.div>
                     )}
                   </div>
                 </>
               ) : (
                 <Fingerprint size={80} className="text-surface-tint glow-sm transform-gpu drop-shadow-[0_0_15px_rgba(0,219,231,0.8)]" />
               )}
               
               <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute w-[110%] h-[110%] border-[3px] border-dashed border-surface-tint/70 rounded-full transform-gpu will-change-transform z-20 pointer-events-none opacity-80"
               />
               <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute w-[118%] h-[118%] border-2 border-dotted border-surface-tint/40 rounded-full transform-gpu will-change-transform z-20 pointer-events-none"
               />
            </div>
            
            <h1 className={`font-sans font-black text-4xl mb-3 tracking-[0.2em] ${isLockdown ? 'text-error glow-error animate-pulse' : (scanStatus === 'granted' && authMethod === 'face' ? 'text-green-400 glow-green' : 'text-cyan glow-cyan')}`}>
              {isLockdown ? `LOCKDOWN: ${formatLockdownTime(lockdownTimer)}` : (authMethod === 'face' ? (scanStatus === 'granted' ? 'IDENTITY CONFIRMED' : 'BIOMETRIC_SCAN_ACTIVE') : 'MANUAL_OVERRIDE')}
            </h1>
            
            <motion.div 
              key={authMethod + scanStatus + isLockdown}
              variants={typingAnimation}
              initial="hidden"
              animate="show"
              className={`font-mono text-sm mb-12 flex h-6 tracking-wider ${isLockdown ? 'text-error font-bold' : (scanStatus === 'granted' && authMethod === 'face' ? 'text-green-400 font-bold' : 'text-cyan/70')}`}
            >
              {(isLockdown ? '[MAXIMUM ATTEMPTS REACHED. SECURITY PROTOCOL INITIATED.]' : (authMethod === 'face' ? (scanStatus === 'granted' ? '[MATCH FOUND: FARHAN AHMAD - ACCESS GRANTED]' : '[ANALYZING OPERATOR FACIAL TOPOLOGY...]') : '[ENTER AUTHORIZATION PASSCODE]')).split('').map((char, index) => (
                <motion.span key={index} variants={letterAnimation}>
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.div>

            <button 
              onClick={() => setAuthMethod('password')}
              className="px-8 py-3 chamfer-btn light-pipe-cyan bg-surface-container-low/80 font-mono text-[11px] text-cyan hover:bg-cyan/20 hover:text-white transition-all flex items-center gap-2 backdrop-blur-md shadow-[0_0_20px_rgba(0,242,255,0.25)] uppercase tracking-widest cursor-pointer"
            >
              <Lock size={14} className="opacity-90" /> USE_PASSCODE_FALLBACK
            </button>

            {authMethod === 'password' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-10 flex flex-col items-center"
              >
                <div className="relative group">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${isLockdown ? 'from-error/40 to-red-500/40' : 'from-cyan/40 to-electric-blue/40'} blur opacity-75 group-hover:opacity-100 transition duration-500`}></div>
                  <input 
                    type="password" 
                    placeholder={isLockdown ? "LOCKED_OUT" : "ENTER_KEY"}
                    disabled={isLockdown}
                    className={`relative bg-surface-container-lowest/80 backdrop-blur-xl border ${isLockdown ? 'border-error text-error placeholder:text-error cursor-not-allowed' : (passcodeError ? 'border-error focus:border-error focus:ring-error/50 text-error shadow-[inset_0_0_20px_rgba(255,0,0,0.2)]' : 'border-cyan/60 focus:border-cyan focus:ring-cyan/50 text-cyan shadow-[inset_0_0_20px_rgba(0,242,255,0.15)]')} chamfer-card-sm px-6 py-3 font-mono text-sm focus:outline-none focus:ring-1 w-72 text-center transition-all placeholder:text-current opacity-70`}
                    onChange={() => setPasscodeError(false)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isLockdown) {
                        if (e.currentTarget.value === '003666') {
                          setIsLocked(false);
                          setFailedAttempts(0);
                          setLockdownLevel(0);
                        } else {
                          const newAttempts = failedAttempts + 1;
                          setFailedAttempts(newAttempts);
                          if (newAttempts >= 3) {
                            setIsLockdown(true);
                            const penalty = LOCKDOWN_PENALTIES[Math.min(lockdownLevel, LOCKDOWN_PENALTIES.length - 1)];
                            setLockdownTimer(penalty);
                            setLockdownLevel(prev => prev + 1);
                          } else {
                            setPasscodeError(true);
                          }
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  key={passcodeError ? "error" : "normal"}
                  className={`mt-5 text-[10px] font-mono tracking-[0.2em] uppercase flex items-center gap-2 font-bold ${isLockdown || passcodeError ? 'text-error' : 'text-cyan/50'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isLockdown || passcodeError ? 'bg-error animate-pulse' : 'bg-cyan/50'}`}></span>
                  {isLockdown ? `SYSTEM_LOCKED - REBOOTING IN ${formatLockdownTime(lockdownTimer)}` : (passcodeError ? `ACCESS DENIED - ${3 - failedAttempts} ATTEMPTS REMAINING` : 'MANUAL_OVERRIDE_REQUIRED')}
                </motion.p>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="hud-interface"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <JarvisHUD />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
