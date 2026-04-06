// ─────────────────────────────────────────────────────────────────────────────
// services/lipsync.ts  — v4  (animación ping-pong, sin visemas)
//
// Muestra las imágenes de /new_alejandra_frames/001.jpg … 026.jpg
// avanzando de 1 → 26 y luego retrocediendo 26 → 1 en bucle,
// mientras el avatar esté hablando.
// ─────────────────────────────────────────────────────────────────────────────

// ── Configuración ─────────────────────────────────────────────────────────────
const TOTAL_FRAMES = 26;   // 001.jpg … 026.jpg
const FRAME_MS = 200;  // ms por frame (ajusta para velocidad: ↑ = más lento)

// ── URL del frame ─────────────────────────────────────────────────────────────
export function frameUrl(frameNum: number): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/new_alice_frames/${String(frameNum).padStart(3, '0')}.jpg`;
}

// ── Tipos públicos ────────────────────────────────────────────────────────────
export interface LipSyncHandle {
  stop: () => void;
}

// ── Motor de animación ping-pong ──────────────────────────────────────────────
// Avanza de 1 → TOTAL_FRAMES, luego retrocede a 1, y repite en bucle.
// Se detiene al llamar .stop(), volviendo siempre al frame 1 (boca cerrada).
//
// speedMultiplier: 1.0 = velocidad base (200ms/frame)
//                  1.1 = 10% más rápido (~182ms/frame)
//                  2.0 = el doble de rápido (100ms/frame)
//                  0.5 = la mitad de rápido (400ms/frame)
export function startLipSync(
  _text: string,                         // ignorado en esta versión
  onFrame: (frameNum: number) => void,
  _onEnd: () => void,                    // ignorado: el bucle no tiene fin propio
  speedMultiplier: number = 1.0
): LipSyncHandle {
  const frameMs = Math.max(50, Math.round(FRAME_MS / speedMultiplier));

  let frame = 1;
  let direction: 1 | -1 = 1;            // 1 = avanzar, -1 = retroceder
  let stopped = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  onFrame(frame);

  const tick = () => {
    if (stopped) return;

    frame += direction;

    if (frame >= TOTAL_FRAMES) {
      frame = TOTAL_FRAMES;
      direction = -1;                    // llega al final → empezar a retroceder
    } else if (frame <= 1) {
      frame = 1;
      direction = 1;                     // llega al inicio → empezar a avanzar
    }

    onFrame(frame);
    timeoutId = setTimeout(tick, frameMs);
  };

  timeoutId = setTimeout(tick, frameMs);

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
