// ─────────────────────────────────────────────────────────────
// Z-AI — Axios Interceptors
// Auth injection + typed error mapping + 401 auto-lock
// ─────────────────────────────────────────────────────────────
import { AxiosInstance, AxiosError } from 'axios';
import { useAppStore }               from '../store/appStore';
import { ApiError, statusToCode }    from './ApiError';

// ── Auth Interceptor ─────────────────────────────────────────
// Reads JWT from Zustand (memory-only) and injects as Bearer header.
// If no token → request goes out unauthenticated (backend will 401 if needed).

export const attachAuthInterceptor = (client: AxiosInstance): void => {
  client.interceptors.request.use(
    (config) => {
      const token = useAppStore.getState().sessionToken;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

// ── Error Interceptor ────────────────────────────────────────
// Transforms raw Axios/HTTP errors into typed ApiError instances.
// Handles: 401 auto-lock, 429 rate-limit signal, 5xx server errors,
//          and network failures (no response object).

export const attachErrorInterceptor = (client: AxiosInstance): void => {
  client.interceptors.response.use(
    (response) => response, // pass-through on success
    async (error: AxiosError) => {
      const status = error.response?.status ?? 0;

      // 401 — session expired → force re-auth immediately
      if (status === 401) {
        useAppStore.getState().setAuthState('LOCKED');
        useAppStore.getState().setSessionToken(null);
        useAppStore.getState().appendLog('> AUTH: Session expired. Re-authentication required.');
        return Promise.reject(new ApiError('SESSION_EXPIRED', 401));
      }

      // 429 — rate limited → surface to caller to handle back-off
      if (status === 429) {
        return Promise.reject(new ApiError('RATE_LIMITED', 429));
      }

      // Network error (no response at all) — device is offline
      if (!error.response) {
        useAppStore.getState().setOnline(false);
        return Promise.reject(new ApiError('NETWORK_UNAVAILABLE', 0));
      }

      // All other HTTP errors → map by status code
      const code = statusToCode(status);
      const message = (error.response?.data as { message?: string })?.message;
      return Promise.reject(new ApiError(code, status, message));
    }
  );
};
