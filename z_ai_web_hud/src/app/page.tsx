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
            
            <h1 className="font-sans font-bold text-4xl text-surface-tint mb-3 tracking-[0.2em] drop-shadow-[0_0_8px_rgba(0,219,231,0.6)]">
              {authMethod === 'face' ? 'BIOMETRIC_SCAN_ACTIVE' : 'MANUAL_OVERRIDE'}
            </h1>
            
            <motion.div 
              variants={typingAnimation}
              initial="hidden"
              animate="show"
              className="font-mono text-sm text-surface-tint/70 mb-12 flex h-6"
            >
              {(authMethod === 'face' ? 'ANALYZING OPERATOR FACIAL TOPOLOGY...' : 'ENTER ENCRYPTION KEY').split('').map((char, index) => (
                <motion.span key={index} variants={letterAnimation}>
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </motion.div>

            <button 
              onClick={() => setAuthMethod('password')}
              className="px-8 py-3 border border-surface-tint/40 rounded-full font-mono text-[11px] text-surface-tint hover:bg-surface-tint/20 hover:border-surface-tint transition-all flex items-center gap-2 backdrop-blur-sm shadow-[0_0_15px_rgba(0,219,231,0.1)] hover:shadow-[0_0_20px_rgba(0,219,231,0.4)]"
            >
              <Lock size={14} className="opacity-80" /> USE_PASSCODE_FALLBACK
            </button>

            {authMethod === 'password' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-10 flex flex-col items-center"
              >
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-surface-tint/30 to-surface-tint/10 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                  <input 
                    type="password" 
                    placeholder="ENTER_ENCRYPTION_KEY"
                    className="relative bg-background/60 backdrop-blur-xl border border-surface-tint/50 rounded-lg px-6 py-3 font-mono text-sm text-surface-tint focus:outline-none focus:border-surface-tint focus:ring-1 focus:ring-surface-tint/50 w-72 text-center shadow-[inset_0_0_20px_rgba(0,219,231,0.1)] transition-all placeholder:text-surface-tint/30"
                    onKeyDown={(e) => e.key === 'Enter' && setIsLocked(false)}
                  />
                </div>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-5 text-[10px] font-mono text-error/80 tracking-widest uppercase flex items-center gap-2"
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
