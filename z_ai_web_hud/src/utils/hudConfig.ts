/**
 * High-fidelity Z-AI JARVIS HUD Configuration Matrices
 * Extracts static layouts, constant arrays, and complex math telemetry 
 * out of the main rendering thread to optimize bundle size and FCP/LCP.
 */

// Telemetry bar mock matrices for the HUD Left Wing Altimeter
export const ALTIMETER_MATRIX = [100, 80, 90, 70, 60, 85, 20];

// CPU diagnostic telemetry presets
export const CPU_NOMINAL_LOAD = "42.8%";
export const CPU_THINKING_LOAD = "98.2%";

// Thermal core telemetry presets
export const TEMP_NOMINAL_CELSIUS = "34°C";
export const TEMP_THINKING_CELSIUS = "48°C";

// SVG Waveform paths representing visual frequency fluctuations
export const WAVEFORM_PATHS = {
  LISTENING: "M0 15 Q 5 5, 10 25 T 20 5 T 30 25 T 40 5 T 50 25 T 60 5 T 70 25 T 80 5 T 90 25 T 100 15",
  SPEAKING:  "M0 15 Q 5 10, 10 20 T 20 10 T 30 20 T 40 10 T 50 20 T 60 10 T 70 20 T 80 10 T 90 20 T 100 15",
  IDLE:      "M0 15 Q 5 14, 10 16 T 20 14 T 30 16 T 40 14 T 50 16 T 60 14 T 70 16 T 80 14 T 90 16 T 100 15"
};

// System diagnostics self-check script responses
export const DIAGNOSTICS_RESPONSE = [
  "SYSTEM: Diagnostics check started...",
  "SYSTEM: Main core load: NOMINAL",
  "SYSTEM: Neural synchronization: 100%",
  "SYSTEM: ElevenLabs engine link: NOMINAL",
  "SYSTEM: Edge runtime API routes: OPERATIONAL",
  "SYSTEM: GPU-acceleration check: ENABLED",
  "SYSTEM: Biometric encryption layers: ACTIVE",
  "SYSTEM: Diagnostics complete. Core calibrated."
];
