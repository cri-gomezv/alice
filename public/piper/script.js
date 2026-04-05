"use strict";

/**
 * Piper TTS — script.js
 *
 * API REAL del piper_worker.js (wide-video/piper-wasm):
 *   - NO tiene fase "initialize" separada.
 *   - Cada generación envía UN mensaje con todos los datos.
 *   - El worker responde con mensajes { kind: "fetch"|"output"|"complete"|"stderr" }
 *
 * Mensaje de entrada al worker:
 *   {
 *     input:                string,
 *     speakerId:            number,
 *     modelUrl:             string,  // URL absoluta al .onnx
 *     modelConfigUrl:       string,  // URL absoluta al .onnx.json
 *     piperPhonemizeJsUrl:  string,
 *     piperPhonemizeWasmUrl: string,
 *     piperPhonemizeDataUrl: string,
 *     onnxruntimeUrl:       string,  // URL absoluta a dist/ort-web.es6.min.js
 *     blobs:                {}       // caché interna (vacío en primera llamada)
 *   }
 */

const VOICES = [
  {
    id:         "es_AR-daniela-high",
    label:      "Daniela (Argentina · Alta calidad)",
    quality:    "high",
    sampleRate: 22050,
    license:    "MIT",
    modelPath:  "./models/es_AR-daniela-high.onnx",
    configPath: "./models/es_AR-daniela-high.onnx.json",
  },
  {
    id:         "es_ES-davefx-medium",
    label:      "Davefx (España · Media calidad)",
    quality:    "medium",
    sampleRate: 22050,
    license:    "MIT",
    modelPath:  "./models/es_ES-davefx-medium.onnx",
    configPath: "./models/es_ES-davefx-medium.onnx.json",
  },
  {
    id:         "es_ES-carlfm-x_low",
    label:      "Carlfm (España · Muy ligera ~25MB)",
    quality:    "x_low",
    sampleRate: 16000,
    license:    "MIT",
    modelPath:  "./models/es_ES-carlfm-x_low.onnx",
    configPath: "./models/es_ES-carlfm-x_low.onnx.json",
  },
  {
    id:         "es_MX-ald-medium",
    label:      "Ald (México · Media calidad)",
    quality:    "medium",
    sampleRate: 22050,
    license:    "MIT",
    modelPath:  "./models/es_MX-ald-medium.onnx",
    configPath: "./models/es_MX-ald-medium.onnx.json",
  },
  {
    id:         "es_ES-sharvard-medium",
    label:      "Sharvard (España · Media · Multi-hablante)",
    quality:    "medium",
    sampleRate: 22050,
    license:    "MIT",
    modelPath:  "./models/es_ES-sharvard-medium.onnx",
    configPath: "./models/es_ES-sharvard-medium.onnx.json",
  },
];

const WASM = {
  phonemizeJs:   "./piper_phonemize.js",
  phonemizeWasm: "./piper_phonemize.wasm",
  phonemizeData: "./piper_phonemize.data",
  workerJs:      "./piper_worker.js",
  // BUG FIX #3: el worker construye ´${onnxruntimeUrl}ort.min.js´ internamente,
  // por lo que esta URL debe ser la CARPETA (terminada en "/"), no el archivo.
  onnxRuntimeBase: "./dist/",
};

const App = {
  status:         "idle",
  lastBlobUrl:    null,
  currentVoiceId: null,
};

// =========================================================
// INIT
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
  populateVoiceSelect();
  setupEventListeners();
  setStatus("idle", "Sin inicializar", "Selecciona una voz y pulsa Cargar modelo.");
});

function populateVoiceSelect() {
  const select = document.getElementById("voice-select");
  VOICES.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.id;
    opt.textContent = v.label;
    select.appendChild(opt);
  });
  updateVoiceInfo();
}

function updateVoiceInfo() {
  const voice = getSelectedVoice();
  if (!voice) return;
  document.getElementById("voice-info").textContent =
    `${voice.quality.toUpperCase()} · ${voice.sampleRate.toLocaleString()} Hz · ${getSizeEstimate(voice.quality)}`;
  document.getElementById("footer-license").textContent = voice.license;
}

function getSizeEstimate(q) {
  return { x_low: "~25 MB", low: "~35 MB", medium: "~65 MB", high: "~130 MB" }[q] || "?";
}

function getSelectedVoice() {
  return VOICES.find(v => v.id === document.getElementById("voice-select").value);
}

function setupEventListeners() {
  const textarea = document.getElementById("text-input");
  textarea.addEventListener("input", () => {
    document.getElementById("char-count").textContent = `${textarea.value.length} caracteres`;
  });
  document.getElementById("char-count").textContent = `${textarea.value.trim().length} caracteres`;

  document.getElementById("voice-select").addEventListener("change", () => {
    updateVoiceInfo();
    if (App.status === "ready") {
      setStatus("idle", "Voz cambiada", "Pulsa Cargar modelo para continuar.");
      App.currentVoiceId = null;
    }
  });

  document.getElementById("load-btn").addEventListener("click", handleLoadModel);
  document.getElementById("generate-btn").addEventListener("click", handleGenerate);
}

// =========================================================
// ESTADO
// =========================================================
function setStatus(state, text, detail = "") {
  App.status = state;
  const colors = {
    idle:       "bg-gray-600",
    loading:    "bg-yellow-500 animate-pulse",
    ready:      "bg-emerald-500",
    generating: "bg-blue-500 animate-pulse",
    error:      "bg-red-500",
  };
  document.getElementById("status-indicator").className =
    `w-2.5 h-2.5 rounded-full flex-shrink-0 ${colors[state] || "bg-gray-600"}`;
  document.getElementById("status-text").textContent   = text;
  document.getElementById("status-detail").textContent = detail;
  document.getElementById("generate-btn").disabled = state !== "ready";
  document.getElementById("load-btn").disabled     = state === "loading" || state === "generating";
  if (state !== "error") document.getElementById("debug-container").classList.add("hidden");
}

function setProgress(percent, label) {
  const c = document.getElementById("progress-container");
  if (percent === null) { c.classList.add("hidden"); return; }
  c.classList.remove("hidden");
  document.getElementById("progress-bar").style.width = `${Math.min(100, percent)}%`;
  document.getElementById("progress-text").textContent = label || `${percent}%`;
}

function showDebug(msg) {
  document.getElementById("debug-container").classList.remove("hidden");
  document.getElementById("debug-text").textContent = msg;
}

// =========================================================
// CARGAR MODELO — pre-descarga para caché
// =========================================================
async function handleLoadModel() {
  const voice = getSelectedVoice();
  if (!voice) return;

  setStatus("loading", "Descargando modelo...", voice.label);
  setProgress(0, "Iniciando...");

  try {
    await fetchWithProgress(voice.modelPath, (pct) => {
      setProgress(pct, `Descargando modelo: ${pct}%`);
    });
    App.currentVoiceId = voice.id;
    setProgress(100, "Listo");
    setStatus("ready", "Modelo listo — pulsa Generar voz", `Voz: ${voice.label}`);
    setTimeout(() => setProgress(null), 800);
  } catch (err) {
    setStatus("error", "Error al descargar", err.message);
    showDebug(err.message);
    setProgress(null);
  }
}

// =========================================================
// GENERAR AUDIO
// =========================================================
async function handleGenerate() {
  const text = document.getElementById("text-input").value.trim();
  if (!text) { setStatus("error", "Sin texto", "Escribe algo primero."); return; }
  if (App.status !== "ready") { setStatus("error", "No listo", "Carga el modelo primero."); return; }

  const voice = VOICES.find(v => v.id === App.currentVoiceId);
  if (!voice) return;

  setStatus("generating", "Generando audio...", "Procesando con ONNX Runtime...");
  setProgress(0, "Iniciando síntesis...");

  try {
    const audioBlob = await generateWithWorker(text, voice);

    if (App.lastBlobUrl) URL.revokeObjectURL(App.lastBlobUrl);
    const blobUrl = URL.createObjectURL(audioBlob);
    App.lastBlobUrl = blobUrl;

    const player = document.getElementById("audio-player");
    player.src = blobUrl;
    document.getElementById("audio-container").classList.remove("hidden");

    document.getElementById("download-btn").onclick = () => {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `piper_${voice.id}_${Date.now()}.wav`;
      a.click();
    };

    setStatus("ready", "Audio generado ✓", `Voz: ${voice.label}`);
    setProgress(null);
    player.play().catch(() => {});

  } catch (err) {
    setStatus("error", "Error al generar", err.message);
    showDebug(err.message + "\n\nRevisa la consola del navegador (F12).");
    setProgress(null);
    console.error("[PiperTTS]", err);
  }
}

/**
 * Genera audio usando la API real del worker wide-video/piper-wasm.
 * El worker NO tiene estado — cada llamada crea un worker nuevo.
 */
function generateWithWorker(text, voice) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL(WASM.workerJs, window.location.href).href);
    const fetchProgress = {};
    let resolved = false;

    const timeout = setTimeout(() => {
      worker.terminate();
      reject(new Error("Timeout: síntesis tardó más de 180 segundos."));
    }, 180000);

    worker.onmessage = (event) => {
      const msg = event.data;

      switch (msg.kind) {
        case "fetch":
          // Progreso de descargas internas del worker
          if (msg.total && msg.loaded !== undefined) {
            fetchProgress[msg.url] = msg.loaded / msg.total;
            const vals = Object.values(fetchProgress);
            const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
            setProgress(Math.round(avg * 100), `Cargando: ${Math.round(avg * 100)}%`);
          }
          break;

        case "output":
          // BUG FIX #2: el worker envía el audio en msg.file (Blob audio/x-wav)
          // NO en msg.blob, msg.audio, ni msg.data.
          if (!resolved && msg.file) {
            resolved = true;
            clearTimeout(timeout);
            const blob = msg.file instanceof Blob
              ? msg.file
              : new Blob([msg.file], { type: "audio/wav" });
            resolve(blob);
          } else if (!resolved && !msg.file) {
            // phonemize-only output (sin audio) — ignorar
            console.log("[PiperTTS] output sin audio (phonemize-only):", msg);
          }
          break;

        case "complete":
          // Si llegamos aquí sin haber resuelto, algo fue mal
          if (!resolved) {
            clearTimeout(timeout);
            reject(new Error("El worker completó sin generar audio. Revisa la consola."));
          }
          worker.terminate();
          break;

        case "stderr":
          console.warn("[PiperWorker stderr]", msg.message);
          break;

        default:
          console.log("[PiperWorker msg]", msg);
          break;
      }
    };

    worker.onerror = (err) => {
      clearTimeout(timeout);
      worker.terminate();
      reject(new Error(`Worker error: ${err.message}`));
    };

    // BUG FIX #1: el worker espera kind:"init" (línea 151 de piper_worker.js)
    // Sin este campo el worker ignora el mensaje completamente.
    // BUG FIX #3: onnxruntimeUrl debe ser la carpeta base (./dist/) porque
    // internamente el worker hace: `${onnxruntimeBase}ort.min.js`
    worker.postMessage({
      kind:                  "init",         // ← REQUERIDO
      input:                 text,
      speakerId:             0,
      modelUrl:              new URL(voice.modelPath,  window.location.href).href,
      modelConfigUrl:        new URL(voice.configPath, window.location.href).href,
      piperPhonemizeJsUrl:   new URL(WASM.phonemizeJs,   window.location.href).href,
      piperPhonemizeWasmUrl: new URL(WASM.phonemizeWasm, window.location.href).href,
      piperPhonemizeDataUrl: new URL(WASM.phonemizeData, window.location.href).href,
      onnxruntimeUrl:        new URL(WASM.onnxRuntimeBase, window.location.href).href, // base dir
      blobs: {},
    });
  });
}

// =========================================================
// FETCH CON PROGRESO + CACHE API
// =========================================================
async function fetchWithProgress(url, onProgress) {
  const cacheName = "piper-models-v1";
  let cache = null;
  try {
    cache = await caches.open(cacheName);
    const cached = await cache.match(url);
    if (cached) {
      console.log(`[PiperTTS] Cache HIT: ${url}`);
      onProgress(100);
      return;
    }
  } catch (e) {}

  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} al descargar ${url}`);

  const contentLength = response.headers.get("content-length");
  if (!contentLength) {
    await response.arrayBuffer();
    onProgress(100);
    return;
  }

  const total  = parseInt(contentLength, 10);
  let loaded   = 0;
  const reader = response.body.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress(Math.round((loaded / total) * 100));
  }

  if (cache) {
    try { await cache.put(url, new Response(new Blob(chunks))); } catch (e) {}
  }
}