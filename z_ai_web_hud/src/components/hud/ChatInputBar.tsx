"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, CornerDownLeft, Bot, Sparkles, Volume2, X } from "lucide-react";
import { useAssistantStore } from "@/store/useAssistantStore";
import { playChirp, playSuccess, isSoundMuted } from "@/utils/cyberSound";

interface ChatExchange {
  user: string;
  zayd: string;
}

export const ChatInputBar: React.FC = () => {
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastExchange, setLastExchange] = useState<ChatExchange | null>(null);
  const { status, setStatus, appendLog, contextMemory, addContextTurn } = useAssistantStore();

  const inputRef = useRef<HTMLInputElement>(null);

  // Quick conversational prompt suggestions
  const CHAT_PROMPTS = [
    { label: "👋 Hello Zayd", prompt: "Hello Zayd, give me a quick status briefing." },
    { label: "📊 System Report", prompt: "Give me an overview of all active modules and telemetry." },
    { label: "🌦️ Weather & Time", prompt: "What is the current time, weather, and environmental readings?" },
    { label: "⚡ Capabilities", prompt: "What tasks and engineering skills can you help me with?" },
  ];

  // Helper to synthesize speech in browser if speech is enabled
  const speakReply = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSoundMuted()) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;

      utterance.onstart = () => setStatus("SPEAKING");
      utterance.onend = () => setStatus("IDLE");
      utterance.onerror = () => setStatus("IDLE");

      // Choose an English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find((v) => v.lang?.startsWith("en") && (v.name?.includes("Male") || v.name?.includes("Natural") || v.name?.includes("Google")));
      if (preferred) utterance.voice = preferred;

      window.speechSynthesis.speak(utterance);
    } catch {
      setStatus("IDLE");
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const message = (customText || inputVal).trim();
    if (!message || isTyping) return;

    playChirp(2000);
    setInputVal("");
    setIsTyping(true);
    setStatus("THINKING");

    appendLog(`USER: ${message}`);
    setLastExchange({ user: message, zayd: "Thinking..." });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-z-ai-auth": process.env.NEXT_PUBLIC_Z_AI_HUD_SECRET || "",
        },
        body: JSON.stringify({
          messages: [
            ...contextMemory,
            { role: "user", content: message },
          ],
        }),
      });

      let replyText = "";
      if (response.ok) {
        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let done = false;
          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;
            if (value) {
              const chunk = decoder.decode(value, { stream: true });
              replyText += chunk;
            }
          }
        } else {
          replyText = await response.text();
        }
      }

      if (!replyText || replyText.trim() === "") {
        replyText = `Understood. All system protocols are online and functioning nominally. How else may I assist you, operator?`;
      }

      // Clean markdown tags or quotes if any
      replyText = replyText.replace(/^"|"$/g, "").trim();

      playSuccess();
      setStatus("SPEAKING");
      appendLog(`ZAYD: ${replyText}`);
      setLastExchange({ user: message, zayd: replyText });

      // Save to assistant store memory
      addContextTurn({ role: "user", content: message });
      addContextTurn({ role: "assistant", content: replyText });

      // Speak response aloud if supported
      speakReply(replyText);

      // Reset status to IDLE after speaking duration estimate
      const displayTime = Math.max(3000, Math.min(replyText.length * 50, 8000));
      setTimeout(() => {
        if (!window.speechSynthesis || !window.speechSynthesis.speaking) {
          setStatus("IDLE");
        }
      }, displayTime);
    } catch {
      // Local fallback reply
      const fallbackReply = `Acknowledged: "${message}". Zayd core is operating in standby mode. All local sensors active.`;
      playSuccess();
      setStatus("SPEAKING");
      appendLog(`ZAYD: ${fallbackReply}`);
      setLastExchange({ user: message, zayd: fallbackReply });
      speakReply(fallbackReply);
      setTimeout(() => setStatus("IDLE"), 3000);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="w-full max-w-xl flex flex-col gap-2 z-40 transform-gpu select-none">
      {/* Latest Chat Conversation Bubble (if present) */}
      {lastExchange && (
        <div className="relative flex flex-col gap-1.5 p-3.5 bg-surface-container-lowest/95 backdrop-blur-2xl border border-cyan/30 chamfer-card-sm shadow-[0_0_20px_rgba(0,242,255,0.15)] text-left transition-all">
          <button
            onClick={() => setLastExchange(null)}
            className="absolute top-2 right-2 text-cyan/40 hover:text-cyan p-1 transition-colors cursor-pointer"
            title="Dismiss Message"
          >
            <X size={12} />
          </button>

          {/* User query */}
          <div className="flex items-center gap-2 font-mono text-[10px] text-cyan/70">
            <span className="text-cyan font-bold tracking-wider">OPERATOR:</span>
            <span className="text-foreground/85 truncate">{lastExchange.user}</span>
          </div>

          {/* Zayd Response */}
          <div className="flex items-start gap-2 pt-1 border-t border-cyan/15 font-mono text-[11px] text-[#00ff9d] leading-relaxed">
            <Bot size={13} className="shrink-0 mt-0.5 text-cyan animate-pulse glow-cyan" />
            <div className="flex-1">
              <span className="text-cyan font-bold tracking-wider mr-1.5">ZAYD:</span>
              <span className={isTyping ? "text-amber-400 animate-pulse" : "text-foreground/95 font-sans text-xs"}>
                {lastExchange.zayd}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Conversational Quick Suggestion Chips */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CHAT_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(item.prompt)}
            disabled={isTyping}
            className="font-mono text-[9px] text-cyan/80 hover:text-cyan border border-cyan/30 hover:border-cyan hover:bg-cyan/15 px-3 py-1 chamfer-btn flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer uppercase font-bold whitespace-nowrap shadow-[0_0_10px_rgba(0,242,255,0.12)] disabled:opacity-50"
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Chat Input Field */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="relative flex items-center w-full chamfer-card light-pipe-cyan bg-surface-container-lowest/90 backdrop-blur-2xl px-4 py-2.5 border border-cyan/40 shadow-[0_0_25px_rgba(0,242,255,0.2)] focus-within:border-cyan focus-within:shadow-[0_0_35px_rgba(0,242,255,0.4)] transition-all"
      >
        <div className="flex items-center gap-2 text-cyan shrink-0 mr-2">
          <MessageSquare size={14} className="text-cyan animate-pulse glow-cyan" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={isTyping ? "Zayd is formulating response..." : "Chat with Zayd... (type your message here)"}
          disabled={isTyping}
          className="w-full bg-transparent font-sans text-xs text-cyan placeholder-cyan/40 focus:outline-none tracking-wide selection:bg-cyan/30"
        />

        <button
          type="submit"
          disabled={!inputVal.trim() || isTyping}
          className={`shrink-0 ml-2 font-mono text-[9px] px-3.5 py-1.5 chamfer-btn flex items-center gap-1.5 transition-all font-bold tracking-wider uppercase cursor-pointer ${
            inputVal.trim() && !isTyping
              ? "bg-cyan text-background hover:bg-cyan/90 shadow-[0_0_12px_#00f2ff] active:scale-95"
              : "border border-cyan/20 text-cyan/30 cursor-not-allowed"
          }`}
        >
          <span>CHAT</span>
          <CornerDownLeft size={10} />
        </button>
      </form>
    </div>
  );
};
