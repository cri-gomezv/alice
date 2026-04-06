// ─────────────────────────────────────────────────────────────────────────────
// services/settings.ts — Configuración persistente (localStorage)
// ─────────────────────────────────────────────────────────────────────────────

export type VoiceEngine = 'polly' | 'piper';

export interface AppSettings {
  voiceEngine: VoiceEngine;
  geminiApiKey: string;
  geminiApiUrl: string;
  piperModelId: string;   // id del modelo piper seleccionado
  avatarSpeed: number;   // multiplicador de velocidad (1.0 = base 200ms/frame)
}

const STORAGE_KEY = 'alejandra_settings';

const DEFAULTS: AppSettings = {
  voiceEngine: 'polly',
  geminiApiKey: 'AIzaSyCFTDT4NDIXWawU5FG11lHh0YOd-LZ6wv4',
  geminiApiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  piperModelId: 'es_AR-daniela-high',
  avatarSpeed: 1.1,   // 10% más rápido que el valor original de 200 ms/frame
};

export const PIPER_MODELS = [
  // ── Argentina ──────────────────────────────────────────────────────────────
  { id: 'es_AR-daniela-high', label: 'Daniela · Argentina · Alta calidad (~114MB)', sampleRate: 22050 },
  // ── España ─────────────────────────────────────────────────────────────────
  { id: 'es_ES-davefx-medium', label: 'Davefx · España · Media calidad (~63MB)', sampleRate: 22050 },
  { id: 'es_ES-sharvard-medium', label: 'Sharvard · España · Media · Multi-hablante (~63MB)', sampleRate: 22050 },
  { id: 'es_ES-mls_9972-low', label: 'MLS 9972 · España · Baja calidad (~35MB)', sampleRate: 16000 },
  { id: 'es_ES-mls_10246-low', label: 'MLS 10246 · España · Baja calidad (~35MB)', sampleRate: 16000 },
  { id: 'es_ES-carlfm-x_low', label: 'Carlfm · España · Muy ligera (~28MB)', sampleRate: 16000 },
  // ── México ─────────────────────────────────────────────────────────────────
  { id: 'es_MX-claude-high', label: 'Claude · México · Alta calidad (~114MB)', sampleRate: 22050 },
  { id: 'es_MX-ald-medium', label: 'Ald · México · Media calidad (~63MB)', sampleRate: 22050 },
];

// ── Lectura ───────────────────────────────────────────────────────────────────

export function getSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULTS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('[Settings] Error al leer localStorage:', e);
  }
  return { ...DEFAULTS };
}

// ── Escritura ─────────────────────────────────────────────────────────────────

export function saveSettings(partial: Partial<AppSettings>): void {
  try {
    const current = getSettings();
    const updated = { ...current, ...partial };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('[Settings] Error al guardar en localStorage:', e);
  }
}
