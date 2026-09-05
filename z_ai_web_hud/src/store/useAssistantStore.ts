import { create } from 'zustand';

export type AssistantStatus = 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'OFFLINE';

interface AssistantState {
  status: AssistantStatus;
  setStatus: (newStatus: AssistantStatus) => void;
  stopAll: () => void;
  
  // Terminal Logs (capped at 50)
  terminalLog: string[];
  appendLog: (line: string) => void;
  clearLog: () => void;

  // Weather Data
  weatherData: { temp: string, condition: string, location: string } | null;
  setWeatherData: (data: { temp: string, condition: string, location: string } | null) => void;

  // Network State
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;

  // HITL / Daemon State
  pendingCommand: string | null;
  setPendingCommand: (cmd: string | null) => void;
  commandOutput: string | null;
  setCommandOutput: (output: string | null) => void;

  // Agentic Override State
  isAgenticMode: boolean;
  setIsAgenticMode: (enabled: boolean) => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  status: 'IDLE',
  
  setStatus: (newStatus) => set((state) => {
    console.log(`[Z-AI] Transitioning: ${state.status} -> ${newStatus}`);
    
    // Rule 1: If changing to SPEAKING, explicitly ensure mic logic is off
    if (newStatus === 'SPEAKING') {
      console.warn("[Z-AI State Machine] Muting Microphone for TTS Output");
    }
    
    // Rule 2: If changing to LISTENING, explicitly ensure any playing audio is halted
    if (newStatus === 'LISTENING') {
      console.warn("[Z-AI State Machine] Interrupting TTS for Voice Input");
    }
    
    return { status: newStatus };
  }),

  stopAll: () => set({ status: 'IDLE' }),


  // Terminal Logs
  terminalLog: ['> System initialized... awaiting command'],
  appendLog: (line) => set((s) => ({
    terminalLog: [...s.terminalLog.slice(-49), line],
  })),
  clearLog: () => set({ terminalLog: ['> System initialized... awaiting command'] }),

  // Weather Data initial state
  weatherData: null,
  setWeatherData: (data) => set({ weatherData: data }),

  // Network State
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  setIsOnline: (online) => set({ isOnline: online }),

  // HITL State
  pendingCommand: null,
  setPendingCommand: (cmd) => set({ pendingCommand: cmd }),
  commandOutput: null,
  setCommandOutput: (output) => set({ commandOutput: output }),

  // Agentic Override Initial State
  isAgenticMode: false,
  setIsAgenticMode: (enabled) => set({ isAgenticMode: enabled }),
}));
