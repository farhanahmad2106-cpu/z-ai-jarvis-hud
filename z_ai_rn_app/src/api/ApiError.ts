// ─────────────────────────────────────────────────────────────
// Z-AI — Typed API Error Class
// All service-layer errors are typed ApiError instances.
// Never expose raw Axios errors to hooks or components.
// ─────────────────────────────────────────────────────────────

export type ApiErrorCode =
  | 'SESSION_EXPIRED'      // 401 — force re-auth
  | 'RATE_LIMITED'         // 429 — back off
  | 'SERVER_ERROR'         // 5xx — backend issue
  | 'NETWORK_UNAVAILABLE'  // no response — offline
  | 'VALIDATION_ERROR'     // 400 — bad payload
  | 'PERMISSION_DENIED'    // 403 — not authorized
  | 'NOT_FOUND'            // 404
  | 'UNKNOWN';             // catch-all

export class ApiError extends Error {
  public readonly code:   ApiErrorCode;
  public readonly status: number;

  constructor(code: ApiErrorCode, status: number, message?: string) {
    super(message ?? code);
    this.name   = 'ApiError';
    this.code   = code;
    this.status = status;
    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/** Type guard — use in catch blocks instead of instanceof checks */
export const isApiError = (e: unknown): e is ApiError =>
  e instanceof ApiError;

/** Map HTTP status → ApiErrorCode */
export const statusToCode = (status: number): ApiErrorCode => {
  if (status === 0)   return 'NETWORK_UNAVAILABLE';
  if (status === 400) return 'VALIDATION_ERROR';
  if (status === 401) return 'SESSION_EXPIRED';
  if (status === 403) return 'PERMISSION_DENIED';
  if (status === 404) return 'NOT_FOUND';
  if (status === 429) return 'RATE_LIMITED';
  if (status >= 500)  return 'SERVER_ERROR';
  return 'UNKNOWN';
};
