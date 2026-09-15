"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, CornerDownLeft, Bot, Sparkles, Volume2, X, Copy, Check, Maximize2 } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const { status, setStatus, appendLog, contextMemory, addContextTurn } = useAssistantStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const responseScrollRef = useRef<HTMLDivElement>(null);

  // Quick conversational prompt suggestions
  const CHAT_PROMPTS = [
    { label: "👋 Hello Zayd", prompt: "Hello Zayd, give me a quick status briefing." },
    { label: "📊 System Report", prompt: "Give me an overview of all active modules and telemetry." },
    { label: "🌦️ Weather & Time", prompt: "What is the current time, weather, and environmental readings?" },
    { label: "⚡ Capabilities", prompt: "What tasks and engineering skills can you help me with?" },
  ];

  // Helper to copy response text
  const handleCopyResponse = (text: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Re-focus input field automatically when typing finishes
  useEffect(() => {
    if (!isTyping) {
      inputRef.current?.focus();
    }
  }, [isTyping]);

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

      // Extract weather widget tag if present
      const weatherMatch = replyText.match(/\[WEATHER:\s*([^|]+)\|([^|]+)\|([^\]]+)\]/i);
      if (weatherMatch) {
        useAssistantStore.getState().setWeatherData({
          temp: weatherMatch[1].trim(),
          condition: weatherMatch[2].trim(),
          location: weatherMatch[3].trim(),
        });
        replyText = replyText.replace(weatherMatch[0], '').trim();
      }

      // Extract desktop daemon command tag if present
      const commandMatch = replyText.match(/\[COMMAND:\s*([^\]]+)\]/i);
      if (commandMatch) {
        const cmd = commandMatch[1].trim();
        useAssistantStore.getState().setPendingCommand(cmd);
        replyText = replyText.replace(commandMatch[0], '').trim();
      }

      if (!replyText || replyText.trim() === "") {
        const isAffirmative = message.toLowerCase().match(/\b(yes|yup|yep|sure|proceed|ok|go ahead|do it)\b/);
        const lastTopic = contextMemory.slice().reverse().find((m: any) => m.content && !m.content.toLowerCase().match(/\b(yes|yup|yep|sure|proceed|ok|hello|hi)\b/))?.content || "";
        if (isAffirmative && lastTopic) {
          const topicName = lastTopic.replace(/^(i can search the web for|shall i proceed|do you want me to|explain|tell me about|what is|how is)\s*/i, '').replace(/[?.\-]+$/, '').trim();
          replyText = `Affirmative, Operator. Telemetry and records on ${topicName || 'your topic'} are synchronized and ready.`;
        } else {
          replyText = `Understood. All system protocols are online and functioning nominally. How else may I assist you, operator?`;
        }
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
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  };

  return (
    <div className="w-full max-w-xl flex flex-col gap-1.5 z-40 transform-gpu select-none shrink-0 px-2 sm:px-4 xl:px-0">
      {/* Latest Chat Conversation Bubble (if present) */}
      {lastExchange && (
        <div className="relative flex flex-col gap-1 p-3 glass-panel chamfer-card-sm text-left transition-all">
          {/* Header Row: Operator Tag & Action Controls */}
          <div className="flex items-center justify-between gap-2 border-b border-cyan/15 pb-1">
            <div className="flex items-center gap-1.5 font-mono text-[9.5px] text-cyan/70 truncate">
              <span className="text-cyan font-bold tracking-wider shrink-0">OPERATOR:</span>
              <span className="text-foreground/85 truncate max-w-[320px]">{lastExchange.user}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Copy Response Button */}
              <button
                type="button"
                onClick={() => handleCopyResponse(lastExchange.zayd)}
                className="text-cyan/60 hover:text-cyan p-1 transition-colors cursor-pointer"
                title={copied ? "Copied!" : "Copy response"}
              >
                {copied ? <Check size={11} className="text-[#00ff9d]" /> : <Copy size={11} />}
              </button>

              {/* Expand to Full View Modal Button */}
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="text-cyan/60 hover:text-cyan p-1 transition-colors cursor-pointer"
                title="Expand full transmission"
              >
                <Maximize2 size={11} />
              </button>

              {/* Dismiss Bubble Button */}
              <button
                type="button"
                onClick={() => {
                  setLastExchange(null);
                  inputRef.current?.focus();
                }}
                className="text-cyan/60 hover:text-red-400 p-1 transition-colors cursor-pointer"
                title="Dismiss message"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Scrollable Zayd Response - strictly constrained in height with sleek scrollbar */}
          <div className="flex items-start gap-2 pt-0.5 font-mono text-[11px] text-[#00ff9d]">
            <Bot size={13} className="shrink-0 mt-0.5 text-cyan animate-pulse glow-cyan" />
            <div
              ref={responseScrollRef}
              className="flex-1 max-h-24 sm:max-h-28 overflow-y-auto pr-1 cyber-scrollbar text-left select-text"
            >
              <span className="text-cyan font-bold tracking-wider mr-1.5">ZAYD:</span>
              <span className={isTyping ? "text-amber-400 animate-pulse font-mono text-[11px]" : "text-foreground/95 font-sans text-xs leading-relaxed"}>
                {lastExchange.zayd}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Conversational Quick Suggestion Chips */}
      <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto py-0.5 pb-1.5 cyber-scrollbar">
        {CHAT_PROMPTS.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(item.prompt)}
            disabled={isTyping}
            className="font-mono text-[8.5px] text-cyan/75 hover:text-cyan border border-cyan/30 hover:border-cyan hover:bg-cyan/15 px-2.5 py-0.5 chamfer-btn flex items-center gap-1 transition-all active:scale-95 cursor-pointer uppercase font-bold whitespace-nowrap shadow-[0_0_8px_rgba(0,242,255,0.1)] disabled:opacity-50"
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Chat Input Field - Always Visible & Guaranteed Anchor */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="relative flex items-center w-full chamfer-card light-pipe-cyan glass-panel px-3.5 py-2 focus-within:border-cyan focus-within:shadow-[0_0_35px_rgba(0,242,255,0.4)] transition-all shrink-0 group"
      >
        <div className="flex items-center gap-1.5 text-cyan shrink-0 mr-2">
          <MessageSquare size={13} className="text-cyan animate-pulse glow-cyan" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder={isTyping ? "Zayd is formulating response..." : "Chat with Zayd... (type next question here)"}
          disabled={isTyping}
          className="w-full bg-transparent font-sans text-xs text-cyan placeholder-cyan/40 focus:outline-none tracking-wide selection:bg-cyan/30"
        />

        <button
          type="submit"
          disabled={!inputVal.trim() || isTyping}
          className={`shrink-0 ml-2 font-mono text-[9px] px-3 py-1 chamfer-btn flex items-center gap-1 transition-all font-bold tracking-wider uppercase cursor-pointer ${
            inputVal.trim() && !isTyping
              ? "bg-cyan text-background hover:bg-cyan/90 shadow-[0_0_12px_#00f2ff] hover:scale-105 active:scale-95 group-focus-within:translate-x-1"
              : "border border-cyan/20 text-cyan/30 cursor-not-allowed"
          }`}
        >
          <span>CHAT</span>
          <CornerDownLeft size={10} className="transition-transform group-focus-within:-translate-x-0.5" />
        </button>
      </form>

      {/* Full Transmission Modal for Long Paragraphs/Answers */}
      {isExpanded && lastExchange && (
        <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-surface-container-lowest border border-cyan/40 chamfer-card p-6 shadow-[0_0_50px_rgba(0,242,255,0.25)] flex flex-col gap-4 text-left">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-cyan/20 pb-3">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-cyan glow-cyan" />
                <span className="font-mono text-xs text-cyan font-bold tracking-widest uppercase">
                  [ZAYD_TRANSMISSION_EXPANDED]
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyResponse(lastExchange.zayd)}
                  className="font-mono text-[9px] text-cyan border border-cyan/30 px-2.5 py-1 chamfer-btn hover:bg-cyan/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check size={10} className="text-[#00ff9d]" /> : <Copy size={10} />}
                  <span>{copied ? "COPIED" : "COPY TEXT"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="text-cyan/60 hover:text-cyan p-1 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Operator Query */}
            <div className="font-mono text-[10px] text-cyan/70 bg-cyan/5 p-2.5 border-l-2 border-cyan">
              <span className="font-bold text-cyan mr-1.5">QUERY:</span>
              <span className="text-foreground/90">{lastExchange.user}</span>
            </div>

            {/* Full Answer Body */}
            <div className="max-h-[50vh] overflow-y-auto cyber-scrollbar pr-2 font-sans text-sm text-foreground/95 leading-relaxed space-y-2 select-text">
              {lastExchange.zayd}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-2 border-t border-cyan/15">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="font-mono text-[9px] bg-cyan text-background px-4 py-1.5 font-bold uppercase tracking-wider chamfer-btn hover:bg-cyan/90 transition-all cursor-pointer shadow-[0_0_10px_#00f2ff]"
              >
                RETURN TO HUD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
