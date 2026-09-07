"use client";

import React, { useState } from "react";
import { Terminal, CornerDownLeft, Sparkles, Shield, RefreshCw, Activity, RotateCcw } from "lucide-react";
import { useAssistantStore } from "@/store/useAssistantStore";
import { playChirp, playSuccess, playAlert, playPing, playModeShift } from "@/utils/cyberSound";
import { DIAGNOSTICS_RESPONSE } from "@/utils/hudConfig";

export const CommandInputBar: React.FC = () => {
  const [inputVal, setInputVal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { appendLog, setStatus, clearLog, contextMemory } = useAssistantStore();

  const handleCommandSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputVal.trim();
    if (!query || isSubmitting) return;

    playChirp(2100);
    appendLog(`USER: ${query}`);
    setInputVal("");
    setIsSubmitting(true);
    setStatus("THINKING");

    try {
      // Try sending query to chat API if available
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...contextMemory,
            { role: "user", content: query }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.text || data.response || "Command acknowledged and processed by neural core.";
        setStatus("SPEAKING");
        playSuccess();
        appendLog(`ZAYD: ${reply}`);
        setTimeout(() => setStatus("STANDBY"), 3500);
      } else {
        throw new Error("Local fallback");
      }
    } catch {
      // Offline / Local response simulation
      setTimeout(() => {
        playSuccess();
        setStatus("SPEAKING");
        appendLog(`ZAYD: Command protocol [${query.toUpperCase()}] executed via local core.`);
        setTimeout(() => setStatus("STANDBY"), 2500);
      }, 700);
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeMacro = (type: string) => {
    playChirp(1900);
    switch (type) {
      case "radar":
        playPing(920);
        appendLog("MACRO: Orbital sector radar sweep triggered.");
        break;
      case "shield":
        playModeShift(1.3);
        appendLog("MACRO: Auxiliary deflector grids boosted to 100% capacity.");
        break;
      case "diagnostics":
        playAlert();
        appendLog("MACRO: Full diagnostic sweep sequence authorized.");
        DIAGNOSTICS_RESPONSE.forEach((msg, idx) => {
          setTimeout(() => appendLog(msg), (idx + 1) * 120);
        });
        break;
      case "vitals":
        playChirp(2400);
        appendLog("MACRO: Neural biometric sync confirmed. Vitals nominal.");
        break;
      case "purge":
        playChirp(1500);
        clearLog();
        appendLog("SYSTEM: Terminal logs flushed by operator.");
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full max-w-xl flex flex-col gap-2 z-40 transform-gpu select-none">
      {/* Quick Action Tactical Macro Chips */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          type="button"
          onClick={() => executeMacro("radar")}
          className="font-mono text-[8px] text-cyan/80 hover:text-cyan border border-cyan/30 hover:border-cyan hover:bg-cyan/15 px-2.5 py-1 chamfer-btn flex items-center gap-1 transition-all active:scale-95 cursor-pointer uppercase font-bold whitespace-nowrap shadow-[0_0_10px_rgba(0,242,255,0.15)]"
        >
          <Sparkles size={9} /> RADAR_SWEEP
        </button>

        <button
          type="button"
          onClick={() => executeMacro("shield")}
          className="font-mono text-[8px] text-[#00ff9d]/80 hover:text-[#00ff9d] border border-[#00ff9d]/30 hover:border-[#00ff9d] hover:bg-[#00ff9d]/15 px-2.5 py-1 chamfer-btn flex items-center gap-1 transition-all active:scale-95 cursor-pointer uppercase font-bold whitespace-nowrap shadow-[0_0_10px_rgba(0,255,157,0.15)]"
        >
          <Shield size={9} /> SHIELD_BOOST
        </button>

        <button
          type="button"
          onClick={() => executeMacro("diagnostics")}
          className="font-mono text-[8px] text-amber-400/80 hover:text-amber-400 border border-amber-400/30 hover:border-amber-400 hover:bg-amber-400/15 px-2.5 py-1 chamfer-btn flex items-center gap-1 transition-all active:scale-95 cursor-pointer uppercase font-bold whitespace-nowrap shadow-[0_0_10px_rgba(251,191,36,0.15)]"
        >
          <RefreshCw size={9} /> SYS_DIAGNOSTICS
        </button>

        <button
          type="button"
          onClick={() => executeMacro("vitals")}
          className="font-mono text-[8px] text-pink-400/80 hover:text-pink-400 border border-pink-400/30 hover:border-pink-400 hover:bg-pink-400/15 px-2.5 py-1 chamfer-btn flex items-center gap-1 transition-all active:scale-95 cursor-pointer uppercase font-bold whitespace-nowrap shadow-[0_0_10px_rgba(244,114,182,0.15)]"
        >
          <Activity size={9} /> SYNC_VITALS
        </button>

        <button
          type="button"
          onClick={() => executeMacro("purge")}
          className="font-mono text-[8px] text-red-400/80 hover:text-red-400 border border-red-400/30 hover:border-red-400 hover:bg-red-400/15 px-2.5 py-1 chamfer-btn flex items-center gap-1 transition-all active:scale-95 cursor-pointer uppercase font-bold whitespace-nowrap shadow-[0_0_10px_rgba(239,68,68,0.15)]"
        >
          <RotateCcw size={9} /> PURGE_LOGS
        </button>
      </div>

      {/* Cybernetic Input Field */}
      <form
        onSubmit={handleCommandSubmit}
        className="relative flex items-center w-full chamfer-card light-pipe-cyan bg-surface-container-lowest/90 backdrop-blur-2xl px-4 py-2.5 border border-cyan/40 shadow-[0_0_25px_rgba(0,242,255,0.2)] focus-within:border-cyan focus-within:shadow-[0_0_35px_rgba(0,242,255,0.4)] transition-all"
      >
        <div className="flex items-center gap-2 text-cyan shrink-0 mr-2">
          <Terminal size={14} className="animate-pulse glow-cyan" />
          <span className="font-mono text-[10px] font-bold text-cyan/70">&gt;</span>
        </div>

        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={isSubmitting ? "PROCESSING PROTOCOL..." : "ENTER SYS_COMMAND OR QUERY..."}
          disabled={isSubmitting}
          className="w-full bg-transparent font-mono text-[11px] text-cyan placeholder-cyan/40 focus:outline-none tracking-wider selection:bg-cyan/30"
        />

        <button
          type="submit"
          disabled={!inputVal.trim() || isSubmitting}
          className={`shrink-0 ml-2 font-mono text-[9px] px-3 py-1 chamfer-btn flex items-center gap-1 transition-all font-bold tracking-wider uppercase cursor-pointer ${
            inputVal.trim() && !isSubmitting
              ? "bg-cyan text-background hover:bg-cyan/90 shadow-[0_0_12px_#00f2ff] active:scale-95"
              : "border border-cyan/20 text-cyan/40 cursor-not-allowed"
          }`}
        >
          <span>SEND</span>
          <CornerDownLeft size={10} />
        </button>
      </form>
    </div>
  );
};
