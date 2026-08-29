"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Fingerprint } from "lucide-react";
import dynamic from "next/dynamic";

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
  const [isLocked, setIsLocked] = useState(true);
  const [authMethod, setAuthMethod] = useState<'face' | 'password'>('face');

  // Preload the heavy HUD component chunk in the background as soon as the page mounts
  useEffect(() => {
    const preloadHUD = () => import('@/components/hud/JarvisHUD');
    preloadHUD();
  }, []);

  // Handle Webcam feed and simulated biometric scan
  const videoRef = useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isLocked && authMethod === 'face') {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((mediaStream) => {
          stream = mediaStream;
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          // Simulate the ML facial recognition processing delay
          setTimeout(() => {
            setIsLocked(false);
          }, 800);
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
    };
  }, [isLocked, authMethod]);

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
            className="absolute inset-0 z-[200] flex flex-col items-center justify-center bg-background"
          >
            <div className="relative flex items-center justify-center mb-8 transform-gpu w-72 h-72 rounded-full overflow-hidden border-[3px] border-surface-tint shadow-[0_0_50px_rgba(0,219,231,0.4)] backdrop-blur-md bg-background/20">
               
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
            
            <h1 className="font-sans font-black text-4xl text-cyan mb-3 tracking-[0.2em] glow-cyan">
              {authMethod === 'face' ? 'BIOMETRIC_SCAN_ACTIVE' : 'MANUAL_OVERRIDE'}
            </h1>
            
            <motion.div 
              variants={typingAnimation}
              initial="hidden"
              animate="show"
              className="font-mono text-sm text-cyan/70 mb-12 flex h-6 tracking-wider"
            >
              {(authMethod === 'face' ? '[ANALYZING OPERATOR FACIAL TOPOLOGY...]' : '[ENTER AUTHORIZATION PASSCODE]').split('').map((char, index) => (
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
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan/40 to-electric-blue/40 blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                  <input 
                    type="password" 
                    placeholder="ENTER_KEY"
                    className="relative bg-surface-container-lowest/80 backdrop-blur-xl border border-cyan/60 chamfer-card-sm px-6 py-3 font-mono text-sm text-cyan focus:outline-none focus:border-cyan focus:ring-1 focus:ring-cyan/50 w-72 text-center shadow-[inset_0_0_20px_rgba(0,242,255,0.15)] transition-all placeholder:text-cyan/30"
                    onKeyDown={(e) => e.key === 'Enter' && setIsLocked(false)}
                  />
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-5 text-[10px] font-mono text-error tracking-[0.2em] uppercase flex items-center gap-2 font-bold"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
                  MANUAL_OVERRIDE_REQUIRED
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
