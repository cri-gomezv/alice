// ─────────────────────────────────────────────────────────────────────────────
// services/lipsync.ts  — v4  (animación ping-pong, sin visemas)
//
// Muestra las imágenes de /new_alice_frames/001.jpg … 026.jpg
// avanzando de 1 → 26 y luego retrocediendo 26 → 1 en bucle,
// mientras el avatar esté hablando.
// ─────────────────────────────────────────────────────────────────────────────

// ── Configuración ─────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 26;   // 001.jpg … 026.jpg
const FRAME_MS     = 200;  // ms por frame (ajusta para velocidad: ↑ = más lento)

// ── URL del frame ─────────────────────────────────────────────────────────────
export function frameUrl(frameNum: number): string {
  return `/new_alice_frames/${String(frameNum).padStart(3, '0')}.jpg`;
}

// ── Tipos públicos ────────────────────────────────────────────────────────────
export interface LipSyncHandle {
  stop: () => void;
}

// ── Motor de animación ping-pong ──────────────────────────────────────────────
// Avanza de 1 → TOTAL_FRAMES, luego retrocede a 1, y repite en bucle.
// Se detiene al llamar .stop(), volviendo siempre al frame 1 (boca cerrada).
export function startLipSync(
  _text: string,                         // ignorado en esta versión
  onFrame: (frameNum: number) => void,
  _onEnd: () => void                     // ignorado: el bucle no tiene fin propio
): LipSyncHandle {
  let frame     = 1;
  let direction: 1 | -1 = 1;            // 1 = avanzar, -1 = retroceder
  let stopped   = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  onFrame(frame);

  const tick = () => {
    if (stopped) return;

    frame += direction;

    if (frame >= TOTAL_FRAMES) {
      frame     = TOTAL_FRAMES;
      direction = -1;                    // llega al final → empezar a retroceder
    } else if (frame <= 1) {
      frame     = 1;
      direction = 1;                     // llega al inicio → empezar a avanzar
    }

    onFrame(frame);
    timeoutId = setTimeout(tick, FRAME_MS);
  };

  timeoutId = setTimeout(tick, FRAME_MS);

  return {
    stop: () => {
      stopped = true;
      if (timeoutId !== null) clearTimeout(timeoutId);
      onFrame(1);                        // volver al frame 1 (boca cerrada)
    },
  };
}

// ── textToFrameEvents — mantenida para compatibilidad de tipos ────────────────
// No se usa en esta versión pero evita errores de importación si algo la llama.
export interface FrameEvent {
  frame: number;
  durationMs: number;
}
export function textToFrameEvents(_text: string): FrameEvent[] {
  return [];
}
