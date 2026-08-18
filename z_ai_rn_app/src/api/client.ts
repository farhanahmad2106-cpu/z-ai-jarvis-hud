// ─────────────────────────────────────────────────────────────
// Z-AI — Axios API Client
// Single instance — imported by all service files
// ─────────────────────────────────────────────────────────────
import axios from 'axios';
import { attachAuthInterceptor, attachErrorInterceptor } from './interceptors';

const apiClient = axios.create({
  timeout: 15_000, // 15s hard cap — no infinite pending requests
  headers: {
    'Content-Type': 'application/json',
    'X-Client':     'z-ai-rn/1.0',
  },
});

// Order matters: auth interceptor runs BEFORE error interceptor
attachAuthInterceptor(apiClient);
attachErrorInterceptor(apiClient);

export default apiClient;
