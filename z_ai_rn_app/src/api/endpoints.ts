// ─────────────────────────────────────────────────────────────
// Z-AI — API Endpoint Constants
// Single source of truth — no magic strings in service files
// ─────────────────────────────────────────────────────────────

const BASE = process.env.EXPO_PUBLIC_API_URL;

if (!BASE && __DEV__) {
  console.warn(
    '[Z-AI] EXPO_PUBLIC_API_URL is not set. API calls will fail.\n' +
    'Create a .env file with EXPO_PUBLIC_API_URL=http://localhost:3000'
  );
}

const API = BASE ?? 'http://localhost:3000';

export const Endpoints = {
  auth: {
    login:      `${API}/api/auth/login`,
    verifyFace: `${API}/api/auth/verify-face`,
    me:         `${API}/api/auth/me`,
  },
  permissions: {
    list:   `${API}/api/permissions`,
    update: `${API}/api/permissions`,
  },
  chat: `${API}/api/chat`,
  tts:  `${API}/api/tts`,
  tools: {
    weather: `${API}/api/tools/weather`,
    news:    `${API}/api/tools/news`,
  },
} as const;
