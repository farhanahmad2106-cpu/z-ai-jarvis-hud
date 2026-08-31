import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Terminal, X, Check, AlertTriangle } from 'lucide-react';

interface HITLPromptProps {
  command: string | null;
  onAuthorize: () => void;
  onDeny: () => void;
}

export const HITLPrompt: React.FC<HITLPromptProps> = ({ command, onAuthorize, onDeny }) => {
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (!command) {
      setTimeLeft(15);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onDeny(); // Auto deny on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [command, onDeny]);

  return (
    <AnimatePresence>
      {command && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Prompt Modal */}
          <motion.div
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg border-2 border-red-500/50 bg-red-950/40 p-1 shadow-[0_0_40px_rgba(239,68,68,0.3)] backdrop-blur-3xl overflow-hidden transform-gpu"
          >
            {/* Caution tape styling */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500 opacity-80" />
            
            <div className="bg-surface-container-lowest/90 p-6 flex flex-col gap-6 relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-red-500/20 pb-4">
                <div className="flex items-center gap-3 text-red-500">
                  <ShieldAlert className="animate-pulse" size={24} />
                  <span className="font-mono text-lg font-black tracking-[0.2em] uppercase glow-sm drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                    AUTHORIZATION REQUIRED
                  </span>
                </div>
                <div className="font-mono text-xl font-bold text-red-400">
                  00:{timeLeft.toString().padStart(2, '0')}
                </div>
              </div>

              {/* Warning Context */}
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-4">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <div className="text-left font-sans text-sm text-foreground/80 leading-relaxed">
                  Z-AI / JARVIS is attempting to execute a local system command. This action requires human-in-the-loop (HITL) consent to ensure system security.
                </div>
              </div>

              {/* Command Display */}
              <div className="flex flex-col gap-2 text-left">
                <div className="font-mono text-[10px] text-cyan/70 tracking-widest uppercase font-bold flex items-center gap-2">
                  <Terminal size={12} />
                  TARGET_PAYLOAD
                </div>
                <div className="bg-black/60 border border-cyan/30 p-4 rounded-sm font-mono text-sm text-[#00ff9d] break-all shadow-[inset_0_0_15px_rgba(0,255,157,0.05)] selection:bg-cyan/30">
                  &gt; {command}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={onDeny}
                  className="flex-1 py-3 bg-red-500/10 border border-red-500 hover:bg-red-500/25 text-red-500 flex items-center justify-center gap-2 transition-all cursor-pointer font-bold uppercase tracking-widest active:scale-95 chamfer-btn"
                >
                  <X size={18} />
                  DENY ACTION
                </button>
                <button
                  onClick={onAuthorize}
                  className="flex-1 py-3 bg-[#00ff9d]/10 border border-[#00ff9d] hover:bg-[#00ff9d]/25 text-[#00ff9d] flex items-center justify-center gap-2 transition-all cursor-pointer font-bold uppercase tracking-widest active:scale-95 chamfer-btn shadow-[0_0_15px_rgba(0,255,157,0.2)] hover:shadow-[0_0_25px_rgba(0,255,157,0.4)]"
                >
                  <Check size={18} />
                  AUTHORIZE EXECUTION
                </button>
              </div>
            </div>
            
            {/* Animated Background Scanline */}
            <motion.div 
              animate={{ y: ['-10%', '110%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute top-0 left-0 w-full h-[15%] bg-gradient-to-b from-transparent via-red-500/10 to-transparent pointer-events-none"
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
