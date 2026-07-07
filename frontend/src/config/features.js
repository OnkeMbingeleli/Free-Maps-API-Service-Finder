// Feature flags — lets 84 devs ship incrementally without every feature
// being finished before anything goes live. See blueprint §12C.
export const FEATURES = {
  AI_ASSISTANT: import.meta.env.VITE_AI_ENABLED === 'true',
  OFFLINE_MODE: true, // always on, core to the brief
  WHATSAPP_SHARE: true,
  EMERGENCY_MODE: true,
  GAMIFICATION: true,
  VOICE_SEARCH: true,
};
