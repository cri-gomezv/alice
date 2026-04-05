// ─────────────────────────────────────────────────────────────────────────────
// services/piperTTS.ts — Wrapper del piper_worker.js (wide-video/piper-wasm)
//
// Los archivos WASM y modelos están en public/piper/ y se sirven en /piper/
// ─────────────────────────────────────────────────────────────────────────────

const PIPER_BASE = '/piper';

const WASM_FILES = {
  phonemizeJs:    `${PIPER_BASE}/piper_phonemize.js`,
  phonemizeWasm:  `${PIPER_BASE}/piper_phonemize.wasm`,
  phonemizeData:  `${PIPER_BASE}/piper_phonemize.data`,
  workerJs:       `${PIPER_BASE}/piper_worker.js`,
  onnxRuntimeBase:`${PIPER_BASE}/dist/`,   // el worker concatena "ort.min.js" internamente
};

// ── Estado del módulo ─────────────────────────────────────────────────────────

let loadedModelId: string | null = null;
let loadedModelBlobs: Record<string, Blob> = {};

// ── Precarga del modelo con caché ─────────────────────────────────────────────

export async function loadPiperModel(
  modelId: string,
  onProgress?: (pct: number, label: string) => void
): Promise<void> {
  if (loadedModelId === modelId) {
    onProgress?.(100, 'Modelo ya cargado');
    return; // ya está en memoria
  }

  const modelUrl  = `${PIPER_BASE}/models/${modelId}.onnx`;
  const configUrl = `${PIPER_BASE}/models/${modelId}.onnx.json`;

  onProgress?.(0, 'Iniciando descarga...');

  // Cache API para no volver a descargar el modelo (~114MB para daniela-high)
  const cacheName = 'piper-models-v1';
  let cache: Cache | null = null;
  try { cache = await caches.open(cacheName); } catch { /* sin cache */ }

  const fetchCached = async (url: string, progressLabel: string, startPct: number, endPct: number): Promise<Blob> => {
    if (cache) {
      const cached = await cache.match(url);
      if (cached) {
        onProgress?.(endPct, `${progressLabel} (caché)`);
        return cached.blob();
      }
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status} al descargar ${url}`);

    const contentLength = response.headers.get('content-length');
    if (!contentLength || !response.body) {
      const blob = await response.blob();
      if (cache) cache.put(url, new Response(blob.slice(0)));
      onProgress?.(endPct, progressLabel);
      return blob;
    }

    const total  = parseInt(contentLength, 10);
    let loaded  = 0;
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      loaded += value.length;
      const pct = startPct + Math.round(((loaded / total) * (endPct - startPct)));
      onProgress?.(pct, progressLabel);
    }

    const blob = new Blob(chunks as unknown as BlobPart[]);
    if (cache) cache.put(url, new Response(blob.slice(0)));
    return blob;
  };

  const modelBlob  = await fetchCached(modelUrl,  'Descargando modelo de voz...', 0, 90);
  const configBlob = await fetchCached(configUrl, 'Descargando configuración...',90, 100);

  loadedModelBlobs = {
    [modelUrl]:  modelBlob,
    [configUrl]: configBlob,
  };
  loadedModelId = modelId;
  onProgress?.(100, 'Modelo listo');
}

export function isPiperModelLoaded(modelId: string): boolean {
  return loadedModelId === modelId;
}

// ── Síntesis de voz ───────────────────────────────────────────────────────────

export function synthesizePiper(text: string, modelId: string): Promise<ArrayBuffer> {
  const modelUrl  = `${PIPER_BASE}/models/${modelId}.onnx`;
  const configUrl = `${PIPER_BASE}/models/${modelId}.onnx.json`;

  // Construir blobs preloaded (así el worker no vuelve a descargar el modelo)
  const blobs: Record<string, Blob> = { ...loadedModelBlobs };

  return new Promise((resolve, reject) => {
    const abs = (path: string) => new URL(path, window.location.href).href;

    const worker = new Worker(abs(WASM_FILES.workerJs));
    let resolved = false;

    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error('Piper TTS: timeout (180s)'));
    }, 180_000);

    worker.onmessage = (event) => {
      const msg = event.data;
      switch (msg.kind) {
        case 'output':
          if (!resolved && msg.file) {
            resolved = true;
            clearTimeout(timeout);
            // msg.file es un Blob (audio/x-wav)
            msg.file.arrayBuffer().then(resolve).catch(reject);
          }
          break;
        case 'complete':
          if (!resolved) {
            clearTimeout(timeout);
            reject(new Error('Piper completó sin generar audio'));
          }
          worker.terminate();
          break;
        case 'stderr':
          console.warn('[Piper stderr]', msg.message);
          break;
      }
    };

    worker.onerror = (err) => {
      clearTimeout(timeout);
      worker.terminate();
      reject(new Error(`Piper worker error: ${err.message}`));
    };

    worker.postMessage({
      kind:                  'init',
      input:                 text,
      speakerId:             0,
      modelUrl:              abs(modelUrl),
      modelConfigUrl:        abs(configUrl),
      piperPhonemizeJsUrl:   abs(WASM_FILES.phonemizeJs),
      piperPhonemizeWasmUrl: abs(WASM_FILES.phonemizeWasm),
      piperPhonemizeDataUrl: abs(WASM_FILES.phonemizeData),
      onnxruntimeUrl:        abs(WASM_FILES.onnxRuntimeBase),
      blobs,
    });
  });
}
