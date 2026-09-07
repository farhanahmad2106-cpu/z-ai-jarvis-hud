"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Terminal, X, Check, AlertTriangle, Info, FileText } from 'lucide-react';

interface HITLPromptProps {
  command: string | null;
  description?: string | null;
  onAuthorize: () => void;
  onDeny: () => void;
}

interface CommandExplanation {
  summary: string;
  actions: string[];
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH';
}

function explainCommandInPlainEnglish(cmd: string): CommandExplanation {
  if (!cmd) {
    return {
      summary: "Zayd wants to execute a system command.",
      actions: [],
      riskLevel: "LOW",
    };
  }

  // Handle specific known compound patterns
  if (cmd.includes('cache') && cmd.includes('rm') && cmd.includes('restart')) {
    return {
      summary: "Zayd wants to clear temporary cached modules and restart the background daemon service to apply changes.",
      actions: [
        "Delete temporary cache directory: /tmp/cache_modules",
        "Restart background service: z-ai-daemon",
      ],
      riskLevel: "MODERATE",
    };
  }

  const parts = cmd.split(/&&|;|\|\|/).map((s) => s.trim()).filter(Boolean);
  const actions: string[] = [];
  let isHighRisk = false;
  let isModerateRisk = false;

  for (const part of parts) {
    if (/^rm\s+(-rf|-r|-f|-fr)?\s*/i.test(part) || /^del\s+/i.test(part) || /^rmdir\s+/i.test(part)) {
      isHighRisk = true;
      const target = part.replace(/^(rm\s+(-rf|-r|-f|-fr)?|del|rmdir)\s*/i, '').trim();
      actions.push(`Permanently delete files or directories (${target || 'specified path'})`);
    } else if (/systemctl\s+restart\s+/i.test(part) || /service\s+.*restart/i.test(part)) {
      isModerateRisk = true;
      const svc = part.match(/systemctl\s+restart\s+([^\s]+)/i)?.[1] || "system service";
      actions.push(`Restart the "${svc}" background service`);
    } else if (/systemctl\s+stop\s+/i.test(part)) {
      isHighRisk = true;
      const svc = part.match(/systemctl\s+stop\s+([^\s]+)/i)?.[1] || "system service";
      actions.push(`Stop and shut down the "${svc}" service`);
    } else if (/systemctl\s+start\s+/i.test(part)) {
      const svc = part.match(/systemctl\s+start\s+([^\s]+)/i)?.[1] || "system service";
      actions.push(`Start the "${svc}" service`);
    } else if (/^(kill|pkill|taskkill)\s+/i.test(part)) {
      isHighRisk = true;
      actions.push(`Forcefully terminate a running process`);
    } else if (/^(npm|yarn|pnpm|pip)\s+(install|add|i)\s*/i.test(part)) {
      actions.push(`Download and install software dependencies`);
    } else if (/^git\s+/i.test(part)) {
      actions.push(`Execute a Git version control action (${part})`);
    } else if (/^(curl|wget)\s+/i.test(part)) {
      actions.push(`Download data or files from the internet`);
    } else if (/^(mkdir|touch)\s+/i.test(part)) {
      actions.push(`Create new folders or files`);
    } else if (/^(cat|grep|tail|head|ls|dir)\s+/i.test(part)) {
      actions.push(`Inspect or read local system files`);
    } else {
      actions.push(`Run system command: "${part}"`);
    }
  }

  const riskLevel = isHighRisk ? "HIGH" : isModerateRisk ? "MODERATE" : "LOW";

  let summary = "";
  if (actions.length === 1) {
    summary = `Zayd wants to ${actions[0].charAt(0).toLowerCase() + actions[0].slice(1)}.`;
  } else if (actions.length > 1) {
    summary = `Zayd wants to perform ${actions.length} sequential actions on your computer.`;
  } else {
    summary = "Zayd wants to execute a system command.";
  }

  return { summary, actions, riskLevel };
}

export const HITLPrompt: React.FC<HITLPromptProps> = ({ command, description, onAuthorize, onDeny }) => {
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

  const explanation = useMemo(() => {
    if (!command) return null;
    const exp = explainCommandInPlainEnglish(command);
    if (description) {
      exp.summary = description;
    }
    return exp;
  }, [command, description]);

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
            className="relative w-full max-w-xl border-2 border-red-500/50 bg-red-950/40 p-1 shadow-[0_0_40px_rgba(239,68,68,0.3)] backdrop-blur-3xl overflow-hidden transform-gpu"
          >
            {/* Caution tape styling */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500 opacity-80" />
            
            <div className="bg-surface-container-lowest/95 p-6 flex flex-col gap-5 relative z-10">
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
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 p-3.5">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <div className="text-left font-sans text-xs sm:text-sm text-foreground/80 leading-relaxed">
                  Z-AI / JARVIS is attempting to execute a local system command. This action requires human-in-the-loop (HITL) consent to ensure system security.
                </div>
              </div>

              {/* Plain English Explanation Section */}
              {explanation && (
                <div className="flex flex-col gap-2.5 text-left bg-cyan/5 border border-cyan/30 p-4 rounded-sm shadow-[inset_0_0_15px_rgba(0,242,255,0.05)]">
                  <div className="flex items-center justify-between border-b border-cyan/20 pb-2">
                    <div className="font-mono text-[10px] text-cyan font-extrabold tracking-widest uppercase flex items-center gap-1.5 glow-cyan">
                      <FileText size={13} className="text-cyan animate-pulse" />
                      WHAT ZAYD WANTS TO DO (PLAIN ENGLISH)
                    </div>
                    <span
                      className={`font-mono text-[9px] px-2 py-0.5 rounded font-extrabold tracking-wider uppercase border ${
                        explanation.riskLevel === "HIGH"
                          ? "border-red-500/50 text-red-400 bg-red-500/15"
                          : explanation.riskLevel === "MODERATE"
                          ? "border-amber-500/50 text-amber-400 bg-amber-500/15"
                          : "border-cyan/50 text-cyan bg-cyan/15"
                      }`}
                    >
                      {explanation.riskLevel} RISK
                    </span>
                  </div>

                  <p className="font-sans text-sm text-foreground/95 leading-relaxed font-medium">
                    {explanation.summary}
                  </p>

                  {explanation.actions.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-1 pt-2 border-t border-cyan/10">
                      <span className="font-mono text-[9px] text-cyan/70 uppercase tracking-wider font-bold">
                        Detailed Action Steps:
                      </span>
                      <ul className="space-y-1 font-mono text-[11px] text-foreground/85">
                        {explanation.actions.map((act, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-cyan shrink-0 font-bold">&bull;</span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Technical Command Display */}
              <div className="flex flex-col gap-2 text-left">
                <div className="font-mono text-[10px] text-cyan/70 tracking-widest uppercase font-bold flex items-center gap-2">
                  <Terminal size={12} />
                  TARGET_PAYLOAD (TECHNICAL CODE)
                </div>
                <div className="bg-black/70 border border-cyan/30 p-3.5 rounded-sm font-mono text-xs sm:text-sm text-[#00ff9d] break-all shadow-[inset_0_0_15px_rgba(0,255,157,0.05)] selection:bg-cyan/30">
                  &gt; {command}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-1">
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
