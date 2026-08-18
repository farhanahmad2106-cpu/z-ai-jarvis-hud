# Z-AI (JARVIS) V1.1 - Screen Breakdown & UX Architecture

## 1. Screen List
1. **Security Lock Screen (Biometric/Face ID):** The entry point. A clean, glassmorphic interface that scans the user or prompts for a manual password.
2. **Main HUD (Active State):** The primary immersive dashboard featuring the 3-ring J.A.R.V.I.S core and peripheral metrics.
3. **App Permission & Control Dashboard:** A functional management layer to toggle authorized applications and view system logs.
4. **Network Failure / Offline Mode State:** A specialized visual state of the Main HUD that indicates reduced connectivity while maintaining local control.

---

## 2. Layout Hierarchy & Component Breakdown

### Screen 1: Security Lock Screen
*   **Layout:** Centered focal point with a blurred, immersive background.
*   **Components:**
    *   *Biometric Scanner:* A pulsing cyan ring indicating active Face ID scanning.
    *   *Glassmorphic Password Input:* A hidden-by-default field that slides up if biometric fails.
    *   *System Status Bar:* Minimalist indicators for Battery, Time, and Connection.
*   **Interaction:** Automatic Face ID scan on wake. Tap "Use Password" to bypass.

### Screen 2: Main HUD (The "JARVIS" Core)
*   **Layout:** Fixed-position peripheral modules around a centralized active core.
*   **Components:**
    *   *Central 3-Ring Hologram:* Animated SVG rings that react to voice input (Listening/Thinking/Speaking).
    *   *Left Metric Module:* Vertical "ALT" level-meter with scanning lines.
    *   *Right Status Module:* "Status: Online" and "Mic: ON/OFF" toggles.
    *   *Bottom-Left Terminal Log:* A scrolling text field for real-time script/command output.
*   **Interaction:** Voice-activated. Tap metrics to expand detailed data views.

### Screen 3: Permission Dashboard
*   **Layout:** Structured list view with high contrast for utility.
*   **Components:**
    *   *App List Cards:* WhatsApp, VS Code, etc., with manual "Authorized" toggles.
    *   *Shell Script Console:* A dedicated section for manual script execution.
    *   *Global Security Toggle:* One-tap lock for all applications.
*   **Interaction:** Direct manipulation of toggles; search bar for application filtering.

---

## 3. States & Logic

### Interaction Logic
*   **Voice Trigger:** System transitions from "Idle" to "Listening" when wake word is detected.
*   **Connectivity Fallback:** If internet is lost, the HUD core transitions to a "Glitched/Static" state, and the TTS engine swaps to Browser Speech Synthesis automatically.

### Empty States
*   **Terminal Log:** Displays "System initialized... awaiting command" in a dim teal.
*   **Permission Dashboard:** If no apps are authorized, displays "No apps currently managed. Tap '+' to add."

### Error States
*   **Face ID Failure:** Red pulsing ring with the message "Biometric Mismatch. Access Denied."
*   **Network Failure:** HUD core turns orange/red with a "Disconnected - Local Mode Active" warning banner.
*   **Command Error:** "Unable to execute [Command]. Check local permissions." displayed in the terminal log.