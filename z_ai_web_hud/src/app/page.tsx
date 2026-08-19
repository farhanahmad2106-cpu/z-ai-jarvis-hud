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
            <div className="relative flex items-center justify-center mb-8 transform-gpu w-64 h-64 rounded-full overflow-hidden border-2 border-surface-tint shadow-[0_0_30px_rgba(6,182,212,0.3)]">
               
               {/* Live Webcam Feed */}
               {authMethod === 'face' ? (
                 <>
                   <video 
                     ref={videoRef} 
                     autoPlay 
                     playsInline 
                     muted 
                     className="absolute w-full h-full object-cover filter grayscale sepia hue-rotate-[180deg] saturate-200 opacity-60"
                   />
                   <motion.div 
                     animate={{ y: ["-100%", "100%"] }}
                     transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                     className="absolute w-full h-2 bg-surface-tint shadow-[0_0_15px_#06b6d4] opacity-50 z-10"
                   />
                 </>
               ) : (
                 <Fingerprint size={64} className="text-surface-tint glow-sm transform-gpu" />
               )}
               
               <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute w-[105%] h-[105%] border-2 border-dashed border-surface-tint/60 rounded-full transform-gpu will-change-transform z-20 pointer-events-none"
               />
            </div>
            
            <h1 className="font-sans font-bold text-3xl text-surface-tint mb-2 tracking-widest">
              {authMethod === 'face' ? 'BIOMETRIC_SCAN_ACTIVE' : 'MANUAL_OVERRIDE'}
            </h1>
            <p className="font-mono text-sm text-foreground/40 mb-12">
              {authMethod === 'face' ? 'ANALYZING OPERATOR FACIAL TOPOLOGY...' : 'ENTER ENCRYPTION KEY'}
            </p>

            <button 
              onClick={() => setAuthMethod('password')}
              className="px-6 py-2 border border-surface-tint/30 rounded-full font-mono text-[10px] text-surface-tint hover:bg-surface-tint/10 transition-all flex items-center gap-2"
            >
              <Lock size={12} /> USE_PASSCODE_FALLBACK
            </button>

            {authMethod === 'password' && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex flex-col items-center"
              >
                <input 
                  type="password" 
                  placeholder="ENTER_ENCRYPTION_KEY"
                  className="bg-surface-container/50 border border-outline/20 rounded-lg px-4 py-2 font-mono text-xs text-surface-tint focus:outline-none focus:border-surface-tint/60 w-64 text-center"
                  onKeyDown={(e) => e.key === 'Enter' && setIsLocked(false)}
                />
                <p className="mt-4 text-[9px] font-mono text-error/60">MANUAL_OVERRIDE_REQUIRED</p>
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
