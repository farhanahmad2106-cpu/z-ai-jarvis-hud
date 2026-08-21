"use client";

import { useEffect, useRef, useCallback } from 'react';
import { useAssistantStore } from '@/store/useAssistantStore';

// Since the API now returns plain text, parsing is trivial
function parseStreamContent(rawText: string): string {
  if (!rawText || !rawText.trim()) return "";
  return rawText.trim().replace(/^"|"$/g, '');
}

export function useVoiceInterface() {
  const { status, setStatus, appendLog } = useAssistantStore();
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const conversationHistoryRef = useRef<{ role: string; content: string }[]>([]);

  // Keep refs in sync so speech recognition callbacks always see latest values
  const statusRef = useRef(status);
  const appendLogRef = useRef(appendLog);
  useEffect(() => {
    statusRef.current = status;
    appendLogRef.current = appendLog;
  }, [status, appendLog]);

  const startContinuousListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.start(); } catch (e) { /* already running */ }
  }, []);

  // ─── SPEAK ───────────────────────────────────────────────────────────────
  const speak = useCallback(async (text: string) => {
    const cleanText = parseStreamContent(text);
    if (!cleanText) {
      console.warn('[Z-AI] Empty text passed to speak — aborting TTS.');
      setStatus('IDLE');
      startContinuousListening();
      return;
    }

    setStatus('SPEAKING');
    appendLog(`ZAYD: ${cleanText}`);

    // ── ElevenLabs TTS (premium) ──
    try {
      const response = await fetch('/api/speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
      });

      if (!response.ok) throw new Error(`TTS HTTP ${response.status}`);

      const blob = await response.blob();
      if (!blob.size) throw new Error('TTS returned empty audio blob');

      const url = URL.createObjectURL(blob);
      if (!audioRef.current) audioRef.current = new Audio();
      audioRef.current.src = url;
      audioRef.current.onended = () => {
        URL.revokeObjectURL(url);
        setStatus('IDLE');
        startContinuousListening();
      };
      audioRef.current.onerror = () => {
        URL.revokeObjectURL(url);
        webSpeechFallback(cleanText);
      };
      await audioRef.current.play();
      return; // success — exit here
    } catch (error) {
      console.warn('[Z-AI] ElevenLabs failed, switching to WebSpeech:', error);
    }

    // ── WebSpeech fallback ──
    webSpeechFallback(cleanText);

    function webSpeechFallback(txt: string) {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        setStatus('IDLE');
        startContinuousListening();
        return;
      }
      window.speechSynthesis.cancel();

      const utter = new SpeechSynthesisUtterance(txt);
      utter.rate = 1.05;
      utter.pitch = 0.9;
      utter.volume = 1;

      const pickVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        return (
          voices.find(v => v.name.includes('Google US English')) ||
          voices.find(v => v.name.includes('Microsoft David')) ||
          voices.find(v => v.name.toLowerCase().includes('male') && v.lang.startsWith('en')) ||
          voices.find(v => v.lang.startsWith('en')) ||
          voices[0]
        );
      };

      const doSpeak = () => {
        const voice = pickVoice();
        if (voice) utter.voice = voice;
        utter.onend = () => { setStatus('IDLE'); startContinuousListening(); };
        utter.onerror = (e) => {
          console.error('[Z-AI] WebSpeech error:', e);
          setStatus('IDLE');
          startContinuousListening();
        };
        window.speechSynthesis.speak(utter);
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        doSpeak();
      } else {
        // Chrome loads voices asynchronously — wait for the event
        window.speechSynthesis.addEventListener('voiceschanged', doSpeak, { once: true });
      }
    }
  }, [setStatus, appendLog, startContinuousListening]);

  // ─── PROCESS COMMAND ────────────────────────────────────────────────────
  const processCommand = useCallback(async (command: string) => {
    setStatus('THINKING');
    appendLog(`USER: ${command}`);

    try {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        let offlineResponse = "I am currently disconnected from my core network.";
        const lowerCmd = command.toLowerCase();
        
        if (lowerCmd.includes('time')) {
          offlineResponse = `The current local time is ${new Date().toLocaleTimeString()}.`;
        } else if (lowerCmd.includes('date')) {
          offlineResponse = `Today is ${new Date().toLocaleDateString()}.`;
        } else if (lowerCmd.includes('battery') || lowerCmd.includes('status')) {
          let batteryStr = "Battery status unknown.";
          try {
            const nav = navigator as any;
            if (nav.getBattery) {
              const b = await nav.getBattery();
              batteryStr = `Battery is at ${Math.round(b.level * 100)} percent.`;
            }
          } catch(e) {}
          offlineResponse = `Offline mode active. ${batteryStr}`;
        } else if (lowerCmd.includes('offline') || lowerCmd.includes('internet')) {
          offlineResponse = "Yes, I am currently operating in local offline mode without cloud connectivity.";
        }
        
        conversationHistoryRef.current.push({ role: 'assistant', content: offlineResponse });
        if (conversationHistoryRef.current.length > 5) conversationHistoryRef.current.shift();
        
        await speak(offlineResponse);
        return;
      }

      // Collect real device telemetry silently
      let telemetryData = '';
      try {
        const nav = navigator as any;
        if (nav.getBattery) {
          const battery = await nav.getBattery();
          telemetryData += `Battery: ${Math.round(battery.level * 100)}%, Charging: ${battery.charging}. `;
        }
        if (nav.connection) {
          telemetryData += `Network: ${nav.connection.effectiveType}, Downlink: ${nav.connection.downlink}Mbps.`;
        }
      } catch (_) { /* telemetry unavailable */ }

      const telemetryContext = telemetryData ? ` [SYSTEM TELEMETRY: ${telemetryData}]` : '';

      // Build conversation history (contextual memory — last 5 turns)
      const newMessages = [
        ...conversationHistoryRef.current,
        { role: 'user', content: command + telemetryContext },
      ];
      if (newMessages.length > 5) newMessages.splice(0, newMessages.length - 5);
      conversationHistoryRef.current = newMessages;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error(`Chat API HTTP ${response.status}`);

      // Accumulate streaming tokens chunk-by-chunk to keep connection active and eliminate Edge Runtime timeouts
      let cleanResponse = "";
      if (response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: !done });
            cleanResponse += chunk;
          }
        }
      } else {
        const rawText = await response.text();
        cleanResponse = rawText;
      }

      cleanResponse = parseStreamContent(cleanResponse);

      console.log('[Z-AI] Combined API response:', cleanResponse);

      if (!cleanResponse) {
        cleanResponse = 'I am unable to process that command right now. Systems on standby.';
        console.warn('[Z-AI] Empty response from API — using fallback.');
      }

      // Extract weather widget tag if present
      const weatherMatch = cleanResponse.match(/\[WEATHER:\s*([^|]+)\|([^|]+)\|([^\]]+)\]/i);
      if (weatherMatch) {
        useAssistantStore.getState().setWeatherData({
          temp: weatherMatch[1].trim(),
          condition: weatherMatch[2].trim(),
          location: weatherMatch[3].trim(),
        });
        cleanResponse = cleanResponse.replace(weatherMatch[0], '').trim();
      } else {
        useAssistantStore.getState().setWeatherData(null);
      }

      // Update conversation memory with assistant reply
      conversationHistoryRef.current.push({ role: 'assistant', content: cleanResponse });
      if (conversationHistoryRef.current.length > 5) conversationHistoryRef.current.shift();

      await speak(cleanResponse);
    } catch (error) {
      console.error('[Z-AI] processCommand error:', error);
      appendLog('ERROR: Command processing failed. Resetting sensors.');
      setStatus('IDLE');
      startContinuousListening();
    }
  }, [setStatus, appendLog, speak, startContinuousListening]);

  const processCommandRef = useRef(processCommand);
  useEffect(() => { processCommandRef.current = processCommand; }, [processCommand]);

  // ─── SPEECH RECOGNITION INIT ────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      appendLogRef.current('CRITICAL: Speech Recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Set to false to force browser to finalize results immediately upon pause
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('[Z-AI] Audio sensors online. Listening for wake word...');
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        // 'no-speech' is a normal timeout when listening. Silently ignore.
        return;
      }
      console.error('Recognition Error:', event.error);
      if (event.error === 'not-allowed') {
        appendLogRef.current('ERROR: Microphone access denied. Please check browser permissions.');
      } else if (event.error === 'network') {
        appendLogRef.current('ERROR: Voice sensor telemetry offline (network). Check connection.');
        setStatus('OFFLINE');
      } else if (event.error !== 'aborted') {
        appendLogRef.current(`ERROR: Voice sensor telemetry offline (${event.error})`);
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log('[Z-AI] Heard:', transcript);

      const currentStatus = statusRef.current;
      const wakeWords = [
        'hey zayd', 'hey zade', 'hey zayed', 'zayd', 'zade', 'zayed',
        'zyd', 'zide', 'said', 'jayd', 'jaid', 'zayt', 'zite',
        'jade', 'shade', 'jarvis', 'computer', 'hey',
      ];

      let matchedWake = '';
      for (const word of wakeWords) {
        if (transcript.includes(word)) { matchedWake = word; break; }
      }

      if (currentStatus === 'IDLE' && matchedWake) {
        const trailingText = transcript
          .substring(transcript.indexOf(matchedWake) + matchedWake.length)
          .replace(/^[,\s:?.\-]+/, '').trim();

        if (trailingText.length > 0) {
          console.log(`[Z-AI] Wake+Command: "${trailingText}"`);
          setStatus('LISTENING');
          appendLogRef.current('SYSTEM: Wake word authorized. Extracting direct command...');
          recognition.stop();
          processCommandRef.current(trailingText);
        } else {
          setStatus('LISTENING');
          appendLogRef.current('SYSTEM: Wake word detected. Ready for input.');
        }
      } else if (currentStatus === 'LISTENING') {
        recognition.stop();
        processCommandRef.current(transcript);
      }
    };

    recognition.onend = () => {
      const s = statusRef.current;
      // Do not auto-restart if we went offline or if the mic was muted/idle
      if ((s === 'IDLE' || s === 'LISTENING') && navigator.onLine) {
        try { recognition.start(); } catch (_) { /* already running */ }
      }
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch (e) { console.error('Recognition start failed:', e); }

    // Warm up WebSpeech voice engine
    if (window.speechSynthesis) window.speechSynthesis.getVoices();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        try { recognitionRef.current.stop(); } catch (_) { /* already stopped */ }
      }
    };
  }, [setStatus]);

  return {
    toggleManualListen: () => {
      const s = statusRef.current;
      if (s === 'IDLE') {
        setStatus('LISTENING');
        appendLogRef.current('SYSTEM: Manual override active. Sensors listening...');
      } else {
        setStatus('IDLE');
        appendLogRef.current('SYSTEM: Sensors set to standby.');
      }
    },
  };
}
