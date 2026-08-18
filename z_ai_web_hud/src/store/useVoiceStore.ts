import { create } from 'zustand';

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  setIsListening: (val: boolean) => void;
  setIsSpeaking: (val: boolean) => void;
  setIsThinking: (val: boolean) => void;
  
  // High-level triggers with safety locks
  startListening: () => void;
  startSpeaking: () => void;
  startThinking: () => void;
  stopAll: () => void;
}

export const useVoiceStore = create<VoiceState>((set, get) => ({
  isListening: false,
  isSpeaking: false,
  isThinking: false,

  setIsListening: (val) => set({ isListening: val }),
  setIsSpeaking: (val) => set({ isSpeaking: val }),
  setIsThinking: (val) => set({ isThinking: val }),

  startListening: () => {
    const { isSpeaking } = get();
    if (isSpeaking) {
      // In a real app, logic to stop TTS would go here
      console.warn("[Z-AI] Interrupting TTS for Voice Input");
      set({ isSpeaking: false });
    }
    set({ isListening: true, isThinking: false });
  },

  startSpeaking: () => {
    const { isListening } = get();
    if (isListening) {
      // In a real app, logic to stop Mic would go here
      console.warn("[Z-AI] Muting Microphone for TTS Output");
      set({ isListening: false });
    }
    set({ isSpeaking: true, isThinking: false });
  },

  startThinking: () => {
    set({ isThinking: true, isListening: false, isSpeaking: false });
  },

  stopAll: () => set({ isListening: false, isSpeaking: false, isThinking: false })
}));
