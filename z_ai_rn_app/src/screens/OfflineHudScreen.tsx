// ─────────────────────────────────────────────────────────────
// OfflineHudScreen — Shown as a view variant of MainHud
// when isOnline === false (per code review fix N-04)
// This is a standalone screen stub that MainHudScreen
// conditionally renders — it re-uses MainHudScreen entirely.
// Exported separately for any direct deep-linking needs (V2+).
// ─────────────────────────────────────────────────────────────
import React from 'react';
// MainHudScreen already handles the offline state via isOnline selector.
// This file simply re-exports it so the file path exists for V2 routing.
export { default } from './MainHudScreen';
