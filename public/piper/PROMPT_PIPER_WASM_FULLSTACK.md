# PROMPT COMPLETO: Piper TTS WebAssembly — Página estática 100% client-side

> **Destinatario**: LLM con capacidades de generación de código full-stack.
> **Nivel de detalle**: Máximo. Cada paso incluye fuentes, comandos exactos y explicaciones de "por qué".
> **Estado del conocimiento**: Verificado a abril 2026. Todas las URLs son activas.

---

## CONTEXTO DEL SISTEMA (leer primero)

Antes de escribir una sola línea de código, el LLM debe internalizar estos conceptos porque son la razón de que cada decisión de arquitectura sea como es:

### ¿Qué es Piper TTS?

Piper es un motor de síntesis de voz (TTS) desarrollado por [rhasspy](https://github.com/rhasspy/piper). Usa modelos ONNX (Open Neural Network Exchange) combinados con el fonemizador `espeak-ng`. La cadena de procesamiento es:

```
TEXTO → espeak-ng (fonemización) → IDs de fonemas → modelo ONNX → muestras PCM → WAV/audio
```

Originalmente fue diseñado para correr en Python/C++. El trabajo de portarlo a WebAssembly fue hecho por **jozefchutka** (wide-video) y empaquetado para npm por **diffusionstudio**.

### ¿Por qué WebAssembly y no la Web Speech API?

La Web Speech API del navegador (`speechSynthesis`) tiene voces inconsistentes, no permite voces offline personalizadas, y no soporta español latinoamericano de calidad. Piper con WASM permite:
- Voces de alta calidad (modelos entrenados con datos reales)
- 100% offline/local en el navegador del cliente
- Control total sobre el modelo usado
- Sin latencia de red, sin dependencia de APIs externas

### Los tres repositorios clave (jerarquía de origen)

| Repositorio | Rol | URL |
|---|---|---|
| `rhasspy/piper` | Motor original C++ | https://github.com/rhasspy/piper |
| `wide-video/piper-wasm` | Compilación a WASM con Emscripten | https://github.com/wide-video/piper-wasm |
| `diffusionstudio/piper-wasm` | Empaquetado npm + worker wrapper | https://github.com/diffusionstudio/piper-wasm |
| `piper-wasm` (npm, socket.dev) | Versión con piperGenerate/piperPhonemize | https://socket.dev/npm/package/piper-wasm |

### Por qué existe el problema de CORS

Los archivos `.wasm` y `.data` son binarios grandes. El navegador aplica la **Same-Origin Policy** estricta a WebAssembly: solo puede ser cargado desde el mismo origen con el header `Content-Type: application/wasm` correcto. Si abres el `index.html` con `file://`, el navegador bloquea la carga. **Necesitas un servidor HTTP local.**

---

## INSTRUCCIONES AL LLM

Eres un desarrollador Full-Stack experto en WebAssembly y procesamiento de audio. Debes generar una implementación completa y funcional para la ruta `/public/piper` de un proyecto estático. El sistema ejecutará Piper TTS **100% en el navegador del cliente** (client-side), sin APIs externas ni servidores de inferencia.

Sigue cada sección en orden. No omitas pasos. Cada sección indica exactamente qué generar.

---

## PARTE 1: ESTRUCTURA DE ARCHIVOS A GENERAR

El LLM debe generar exactamente estos archivos:

```
/public/piper/
├── index.html              ← Interfaz principal (Tailwind CSS via CDN)
├── script.js               ← Lógica de carga del worker y generación de audio
├── piper_phonemize.js      ← [COPIAR desde npm] No generar, copiar
├── piper_phonemize.wasm    ← [COPIAR desde npm] No generar, copiar
├── piper_phonemize.data    ← [COPIAR desde npm] No generar, copiar
├── piper_worker.js         ← [COPIAR desde npm] No generar, copiar
├── dist/                   ← [COPIAR desde npm] Carpeta con ONNX Runtime Web
│   └── ort-wasm-simd.wasm  ← (y otros archivos de ONNX Runtime)
├── espeak-ng-data/
│   ├── voices/             ← [COPIAR desde npm]
│   └── lang/               ← [COPIAR desde npm]
└── models/
    ├── es_AR-daniela-high.onnx
    ├── es_AR-daniela-high.onnx.json
    ├── es_ES-carlfm-x_low.onnx
    ├── es_ES-carlfm-x_low.onnx.json
    ├── es_ES-davefx-medium.onnx
    ├── es_ES-davefx-medium.onnx.json
    ├── es_ES-mls_10246-low.onnx
    ├── es_ES-mls_10246-low.onnx.json
    ├── es_ES-mls_9972-low.onnx
    ├── es_ES-mls_9972-low.onnx.json
    ├── es_ES-sharvard-medium.onnx
    ├── es_ES-sharvard-medium.onnx.json
    ├── es_MX-ald-medium.onnx
    └── es_MX-ald-medium.onnx.json
```

**IMPORTANTE**: Los archivos `piper_phonemize.*`, `piper_worker.js` y la carpeta `dist/` NO se generan. Se obtienen del paquete npm. Las instrucciones de cómo obtenerlos están en la Parte 2.

---

## PARTE 2: OBTENCIÓN DE ARCHIVOS WASM (instrucciones de setup)

El LLM debe generar un archivo `README_SETUP.md` con estas instrucciones exactas (o incluirlas en los comentarios del `index.html`):

### Opción A — Desde npm (recomendada para producción)

```bash
# 1. Instalar el paquete (solo para extraer los archivos build)
npm install piper-wasm

# 2. Copiar los archivos de build a /public/piper/
cp node_modules/piper-wasm/build/piper_phonemize.wasm ./public/piper/
cp node_modules/piper-wasm/build/piper_phonemize.data ./public/piper/
cp node_modules/piper-wasm/build/piper_phonemize.js   ./public/piper/
cp node_modules/piper-wasm/build/worker/piper_worker.js ./public/piper/

# 3. Copiar el runtime de ONNX
cp -r node_modules/piper-wasm/build/worker/dist ./public/piper/dist

# 4. Copiar los datos de espeak-ng
cp -r node_modules/piper-wasm/espeak-ng/espeak-ng-data/voices ./public/piper/espeak-ng-data/voices
cp -r node_modules/piper-wasm/espeak-ng/espeak-ng-data/lang   ./public/piper/espeak-ng-data/lang
```

**Fuente npm**: https://www.npmjs.com/package/piper-wasm  
**Fuente alternativa (diffusionstudio)**: https://www.npmjs.com/package/@diffusionstudio/piper-wasm

> **Nota técnica**: El paquete `piper-wasm` en npm es el que expone `piperGenerate` y `piperPhonemize` como funciones importables. El paquete `@diffusionstudio/piper-wasm` contiene solo los archivos build crudos sin wrappers JS. Para páginas estáticas sin bundler, usar el `piper_worker.js` directamente es más apropiado.

### Opción B — Desde jsDelivr CDN (para desarrollo rápido)

Los archivos también están disponibles via CDN:
```
https://cdn.jsdelivr.net/npm/piper-wasm/build/piper_phonemize.js
https://cdn.jsdelivr.net/npm/piper-wasm/build/piper_phonemize.wasm
https://cdn.jsdelivr.net/npm/piper-wasm/build/piper_phonemize.data
https://cdn.jsdelivr.net/npm/piper-wasm/build/worker/piper_worker.js
```

> **Advertencia**: CDN vs local. Si el objetivo es 100% offline, descargar los archivos. Si es OK hacer la primera carga desde CDN, usar las URLs directas.

### Obtención de modelos de voz (archivos .onnx y .json)

Todos los modelos en español están en HuggingFace:
- **URL base**: https://huggingface.co/rhasspy/piper-voices/tree/main/es
- **Directorio español Argentina**: https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_AR
- **Directorio español España**: https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_ES
- **Directorio español México**: https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_MX

Para cada voz necesitas **dos archivos**:
1. `nombre_voz.onnx` — el modelo de red neuronal (50MB–130MB según calidad)
2. `nombre_voz.onnx.json` — configuración (sample rate, phoneme map, etc.) (~1KB)

**Cómo descargar (ejemplo con wget):**
```bash
# Crear carpeta de modelos
mkdir -p public/piper/models

# Daniela (Argentina) - high quality
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_AR/daniela/high/es_AR-daniela-high.onnx" \
     -O public/piper/models/es_AR-daniela-high.onnx
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_AR/daniela/high/es_AR-daniela-high.onnx.json" \
     -O public/piper/models/es_AR-daniela-high.onnx.json

# carlfm (España) - x_low quality
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/carlfm/x_low/es_ES-carlfm-x_low.onnx" \
     -O public/piper/models/es_ES-carlfm-x_low.onnx
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/carlfm/x_low/es_ES-carlfm-x_low.onnx.json" \
     -O public/piper/models/es_ES-carlfm-x_low.onnx.json

# davefx (España) - medium quality
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/davefx/medium/es_ES-davefx-medium.onnx" \
     -O public/piper/models/es_ES-davefx-medium.onnx
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/davefx/medium/es_ES-davefx-medium.onnx.json" \
     -O public/piper/models/es_ES-davefx-medium.onnx.json

# ald (México) - medium quality
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_MX/ald/medium/es_MX-ald-medium.onnx" \
     -O public/piper/models/es_MX-ald-medium.onnx
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_MX/ald/medium/es_MX-ald-medium.onnx.json" \
     -O public/piper/models/es_MX-ald-medium.onnx.json
```

**Lista completa de voces disponibles en español** (al momento de escritura):

| ID de voz | País | Hablante | Calidad | Tamaño aprox. |
|---|---|---|---|---|
| `es_AR-daniela-high` | Argentina | Daniela | high | ~130 MB |
| `es_ES-carlfm-x_low` | España | carlfm | x_low | ~25 MB |
| `es_ES-davefx-medium` | España | davefx | medium | ~65 MB |
| `es_ES-mls_10246-low` | España | mls_10246 | low | ~35 MB |
| `es_ES-mls_9972-low` | España | mls_9972 | low | ~35 MB |
| `es_ES-sharvard-medium` | España | sharvard | medium (multi) | ~65 MB |
| `es_MX-ald-medium` | México | ald | medium | ~65 MB |

> **Fuente de verdad de voces**: https://huggingface.co/rhasspy/piper-voices/tree/main/es  
> **Descripción de calidades**: `x_low` = 16kHz mono, mínimo RAM. `low` = 16kHz. `medium` = 22.05kHz. `high` = 22.05kHz, mejor calidad.

---

## PARTE 3: CÓDIGO A GENERAR — `index.html`

El LLM debe generar un `index.html` completo con los siguientes requisitos:

### Requisitos del HTML

1. **Tailwind CSS via CDN**: `<script src="https://cdn.tailwindcss.com"></script>`
2. **Sin dependencias de bundler**: Todo debe funcionar con un servidor HTTP simple
3. **Carga diferida del worker**: No inicializar el worker hasta que el usuario seleccione una voz y haga clic en "Cargar modelo"
4. **Selector de voces** poblado dinámicamente desde la constante `VOICES` definida en `script.js`

### Estructura HTML esperada

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Piper TTS — Síntesis de voz local</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-950 text-gray-100 min-h-screen flex flex-col">

  <!-- HEADER -->
  <header class="border-b border-gray-800 p-4">
    <h1 class="text-2xl font-bold text-white">🔊 Piper TTS Local</h1>
    <p class="text-gray-400 text-sm mt-1">Síntesis de voz 100% en tu navegador · Sin servidor · Sin API</p>
  </header>

  <!-- MAIN CONTENT -->
  <main class="flex-1 max-w-2xl mx-auto w-full p-6 flex flex-col gap-6">

    <!-- SELECTOR DE VOZ -->
    <div class="bg-gray-900 rounded-xl p-5 border border-gray-800">
      <label class="block text-sm font-medium text-gray-300 mb-2">Voz</label>
      <select id="voice-select"
              class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
        <!-- Opciones cargadas por script.js -->
      </select>
      <p id="voice-info" class="text-xs text-gray-500 mt-2">
        Selecciona una voz para ver detalles del modelo.
      </p>
    </div>

    <!-- ÁREA DE TEXTO -->
    <div class="bg-gray-900 rounded-xl p-5 border border-gray-800">
      <label class="block text-sm font-medium text-gray-300 mb-2">Texto a sintetizar</label>
      <textarea id="text-input"
                rows="5"
                placeholder="Escribe el texto que quieres convertir a voz..."
                class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y">
Bienvenidos al sistema de síntesis de voz de Piper, funcionando completamente en tu navegador sin necesidad de internet.
      </textarea>
    </div>

    <!-- CONTROLES -->
    <div class="flex gap-3">
      <button id="load-btn"
              class="flex-1 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
        Cargar modelo
      </button>
      <button id="generate-btn"
              disabled
              class="flex-1 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
        🎙️ Generar voz
      </button>
    </div>

    <!-- ESTADO -->
    <div id="status-bar"
         class="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center gap-3 min-h-[60px]">
      <div id="status-indicator" class="w-3 h-3 rounded-full bg-gray-600 flex-shrink-0"></div>
      <div>
        <p id="status-text" class="text-sm font-medium text-gray-300">Sin inicializar</p>
        <p id="status-detail" class="text-xs text-gray-500 mt-0.5"></p>
      </div>
    </div>

    <!-- BARRA DE PROGRESO -->
    <div id="progress-container" class="hidden">
      <div class="w-full bg-gray-800 rounded-full h-2">
        <div id="progress-bar" class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
      </div>
      <p id="progress-text" class="text-xs text-gray-500 mt-1 text-right">0%</p>
    </div>

    <!-- PLAYER DE AUDIO -->
    <div id="audio-container" class="hidden bg-gray-900 rounded-xl p-5 border border-gray-800">
      <p class="text-sm font-medium text-gray-300 mb-3">Audio generado</p>
      <audio id="audio-player" controls class="w-full"></audio>
      <div class="flex gap-2 mt-3">
        <button id="download-btn"
                class="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 py-1.5 px-3 rounded-lg transition-colors">
          ⬇ Descargar WAV
        </button>
      </div>
    </div>

  </main>

  <!-- FOOTER DE LICENCIAS -->
  <footer class="border-t border-gray-800 p-4 text-center text-xs text-gray-600">
    <p>
      Modelos de voz por
      <a href="https://github.com/rhasspy/piper" target="_blank" class="text-gray-500 hover:text-gray-400 underline">Rhasspy Piper</a>
      · Licencia <span id="footer-license">MIT</span>
      · Motor WASM por
      <a href="https://github.com/wide-video/piper-wasm" target="_blank" class="text-gray-500 hover:text-gray-400 underline">wide-video/piper-wasm</a>
      ·
      <a href="https://huggingface.co/rhasspy/piper-voices" target="_blank" class="text-gray-500 hover:text-gray-400 underline">Modelos en HuggingFace</a>
    </p>
  </footer>

  <script src="script.js"></script>
</body>
</html>
```

---

## PARTE 4: CÓDIGO A GENERAR — `script.js`

Este es el archivo más crítico. El LLM debe implementarlo con la siguiente lógica exacta.

### Constante VOICES — catálogo de voces

```javascript
// script.js

/**
 * Catálogo de voces en español disponibles.
 * La ruta "modelPath" es relativa a la ubicación del index.html.
 * Los archivos .onnx y .onnx.json deben estar en /public/piper/models/
 *
 * Fuente de modelos: https://huggingface.co/rhasspy/piper-voices/tree/main/es
 *
 * Calidades disponibles:
 *  - x_low:  16kHz, mínimo tamaño (~25MB), para hardware limitado
 *  - low:    16kHz, calidad básica (~35MB)
 *  - medium: 22.05kHz, balance calidad/tamaño (~65MB)
 *  - high:   22.05kHz, mejor calidad (~130MB)
 */
const VOICES = [
  {
    id:          "es_AR-daniela-high",
    label:       "Daniela (Argentina · Alta calidad)",
    country:     "Argentina",
    speaker:     "Daniela",
    quality:     "high",
    sampleRate:  22050,
    license:     "MIT",
    modelPath:   "./models/es_AR-daniela-high.onnx",
    configPath:  "./models/es_AR-daniela-high.onnx.json",
    hfUrl:       "https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_AR/daniela/high",
  },
  {
    id:         "es_ES-davefx-medium",
    label:      "Davefx (España · Media calidad)",
    country:    "España",
    speaker:    "Davefx",
    quality:    "medium",
    sampleRate: 22050,
    license:    "MIT",
    modelPath:  "./models/es_ES-davefx-medium.onnx",
    configPath: "./models/es_ES-davefx-medium.onnx.json",
    hfUrl:      "https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_ES/davefx/medium",
  },
  {
    id:         "es_ES-carlfm-x_low",
    label:      "Carlfm (España · Muy ligera)",
    country:    "España",
    speaker:    "Carlfm",
    quality:    "x_low",
    sampleRate: 16000,
    license:    "MIT",
    modelPath:  "./models/es_ES-carlfm-x_low.onnx",
    configPath: "./models/es_ES-carlfm-x_low.onnx.json",
    hfUrl:      "https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_ES/carlfm/x_low",
  },
  {
    id:         "es_MX-ald-medium",
    label:      "Ald (México · Media calidad)",
    country:    "México",
    speaker:    "Ald",
    quality:    "medium",
    sampleRate: 22050,
    license:    "MIT",
    modelPath:  "./models/es_MX-ald-medium.onnx",
    configPath: "./models/es_MX-ald-medium.onnx.json",
    hfUrl:      "https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_MX/ald/medium",
  },
  {
    id:         "es_ES-sharvard-medium",
    label:      "Sharvard (España · Media calidad · Multi-speaker)",
    country:    "España",
    speaker:    "Sharvard",
    quality:    "medium",
    sampleRate: 22050,
    license:    "MIT",
    modelPath:  "./models/es_ES-sharvard-medium.onnx",
    configPath: "./models/es_ES-sharvard-medium.onnx.json",
    hfUrl:      "https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_ES/sharvard/medium",
  },
];
```

### Constante de rutas de archivos WASM

```javascript
/**
 * Rutas a los archivos del runtime WebAssembly de Piper.
 * Estos archivos se copian desde node_modules/piper-wasm/build/
 * Ver README_SETUP.md para instrucciones de instalación.
 *
 * CRÍTICO: Estas rutas son relativas al origen del servidor HTTP.
 * Con el script servido en /public/piper/, las rutas apuntan a:
 * /public/piper/piper_phonemize.js, etc.
 */
const WASM_PATHS = {
  phonemizeJs:   "./piper_phonemize.js",
  phonemizeWasm: "./piper_phonemize.wasm",
  phonemizeData: "./piper_phonemize.data",
  workerJs:      "./piper_worker.js",
};
```

### Estado de la aplicación

```javascript
/**
 * Estado global de la aplicación.
 * Toda mutación de estado pasa por setStatus() para mantener la UI sincronizada.
 */
const AppState = {
  status: "idle",       // idle | loading | ready | generating | error
  currentVoiceId: null, // ID de la voz actualmente cargada en el worker
  worker: null,         // Referencia al Web Worker activo
  pendingResolve: null, // Resolver de la Promise activa de generación
  pendingReject: null,  // Rejecter de la Promise activa de generación
  lastBlobUrl: null,    // Última URL de blob para revocar al limpiar
};
```

### Función principal de generación — piperGenerate

El LLM debe implementar `piperGenerate` exactamente según la API del paquete `piper-wasm`:

```javascript
/**
 * Genera audio desde texto usando Piper TTS via Web Worker.
 *
 * API basada en: https://socket.dev/npm/package/piper-wasm
 * Firma original:
 *   piperGenerate(phonemizeJs, phonemizeWasm, phonemizeData, workerJs,
 *                 modelUrl, configUrl, speakerId, text, progressCallback,
 *                 sessionOptions, useGpu)
 *
 * @param {string} text - Texto a sintetizar
 * @param {Object} voice - Objeto de voz del catálogo VOICES
 * @param {Function} onProgress - Callback(progress: 0-100)
 * @returns {Promise<Blob>} - Blob de audio WAV
 */
async function piperGenerate(text, voice, onProgress) {
  return new Promise((resolve, reject) => {
    // Si ya hay un worker cargado con esta voz, reutilizarlo
    // Si no, crear uno nuevo con la voz seleccionada

    if (AppState.worker && AppState.currentVoiceId === voice.id) {
      // Worker ya listo con esta voz — solo enviar el texto
      AppState.pendingResolve = resolve;
      AppState.pendingReject = reject;
      AppState.worker.postMessage({
        type: "generate",
        text: text,
      });
    } else {
      // Necesita inicializar worker con nueva voz
      if (AppState.worker) {
        AppState.worker.terminate();
        AppState.worker = null;
      }

      // Crear worker inline usando Blob para evitar problemas de ruta
      // El piper_worker.js hace el trabajo pesado de ONNX inference
      const workerBlob = new Blob([`
        importScripts("${window.location.origin}${window.location.pathname.replace('index.html','').replace(/\/$/, '')}/${WASM_PATHS.workerJs.replace('./', '')}");
      `], { type: "application/javascript" });

      // ALTERNATIVA más simple (recomendada): usar el worker directamente
      const worker = new Worker(WASM_PATHS.workerJs);
      AppState.worker = worker;
      AppState.currentVoiceId = voice.id;
      AppState.pendingResolve = resolve;
      AppState.pendingReject = reject;

      worker.onmessage = (event) => {
        const { type, data, progress, error } = event.data;

        switch (type) {
          case "progress":
            if (onProgress) onProgress(progress);
            break;

          case "complete":
            // data es un ArrayBuffer con el audio WAV
            const audioBlob = new Blob([data], { type: "audio/wav" });
            if (AppState.pendingResolve) {
              AppState.pendingResolve(audioBlob);
              AppState.pendingResolve = null;
              AppState.pendingReject = null;
            }
            break;

          case "error":
            console.error("[PiperWorker] Error:", error);
            if (AppState.pendingReject) {
              AppState.pendingReject(new Error(error));
              AppState.pendingResolve = null;
              AppState.pendingReject = null;
            }
            break;
        }
      };

      worker.onerror = (err) => {
        console.error("[PiperWorker] Uncaught error:", err);
        reject(new Error(`Worker error: ${err.message}`));
      };

      // Inicializar el worker con los paths del WASM y el modelo de voz
      // Este mensaje hace que el worker cargue piper_phonemize.wasm (~15MB)
      // y el modelo ONNX (~25-130MB según calidad elegida)
      worker.postMessage({
        type: "initialize",
        phonemizeJs:   WASM_PATHS.phonemizeJs,
        phonemizeWasm: WASM_PATHS.phonemizeWasm,
        phonemizeData: WASM_PATHS.phonemizeData,
        modelUrl:      voice.modelPath,
        configUrl:     voice.configPath,
        speakerId:     0,    // 0 para voces de un solo speaker
                             // Para sharvard-medium (multi-speaker): 0, 1, 2...
      });
    }
  });
}
```

> **NOTA CRÍTICA para el LLM**: La API del worker puede variar según la versión del paquete. Revisar el código fuente del `piper_worker.js` descargado para confirmar los nombres exactos de los mensajes (`type: "initialize"`, `type: "generate"`, etc.). Si el worker usa una API diferente, adaptar la implementación.

### Integración con la UI

```javascript
// =========================================================
// INICIALIZACIÓN DE LA UI
// =========================================================

document.addEventListener("DOMContentLoaded", () => {
  populateVoiceSelect();
  setupEventListeners();
  setStatus("idle", "Sin inicializar", "Selecciona una voz y carga el modelo.");
});

function populateVoiceSelect() {
  const select = document.getElementById("voice-select");
  VOICES.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.id;
    option.textContent = voice.label;
    select.appendChild(option);
  });
  updateVoiceInfo();
}

function updateVoiceInfo() {
  const select = document.getElementById("voice-select");
  const voiceId = select.value;
  const voice = VOICES.find((v) => v.id === voiceId);
  if (!voice) return;

  document.getElementById("voice-info").textContent =
    `${voice.quality.toUpperCase()} · ${voice.sampleRate} Hz · Licencia ${voice.license} · Tamaño estimado: ${getSizeEstimate(voice.quality)}`;

  document.getElementById("footer-license").textContent = voice.license;
}

function getSizeEstimate(quality) {
  const sizes = { x_low: "~25 MB", low: "~35 MB", medium: "~65 MB", high: "~130 MB" };
  return sizes[quality] || "desconocido";
}

// =========================================================
// MÁQUINA DE ESTADOS
// =========================================================

function setStatus(state, text, detail = "") {
  AppState.status = state;

  const indicator = document.getElementById("status-indicator");
  const statusText = document.getElementById("status-text");
  const statusDetail = document.getElementById("status-detail");

  // Colores del indicador según estado
  const colors = {
    idle:       "bg-gray-600",
    loading:    "bg-yellow-500 animate-pulse",
    ready:      "bg-emerald-500",
    generating: "bg-blue-500 animate-pulse",
    error:      "bg-red-500",
  };

  indicator.className = `w-3 h-3 rounded-full flex-shrink-0 ${colors[state] || "bg-gray-600"}`;
  statusText.textContent = text;
  statusDetail.textContent = detail;

  // Habilitar/deshabilitar botones según estado
  const generateBtn = document.getElementById("generate-btn");
  const loadBtn = document.getElementById("load-btn");

  generateBtn.disabled = state !== "ready";
  loadBtn.disabled = state === "loading" || state === "generating";
}

function setProgress(percent, label) {
  const container = document.getElementById("progress-container");
  const bar = document.getElementById("progress-bar");
  const text = document.getElementById("progress-text");

  if (percent === null) {
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");
  bar.style.width = `${percent}%`;
  text.textContent = label || `${percent}%`;
}

// =========================================================
// EVENT LISTENERS
// =========================================================

function setupEventListeners() {
  document.getElementById("voice-select").addEventListener("change", () => {
    updateVoiceInfo();
    // Si se cambia la voz, resetear el estado (el modelo cargado ya no es válido)
    if (AppState.status === "ready") {
      setStatus("idle", "Voz cambiada", "Carga el nuevo modelo para continuar.");
      AppState.currentVoiceId = null;
      if (AppState.worker) {
        AppState.worker.terminate();
        AppState.worker = null;
      }
      document.getElementById("generate-btn").disabled = true;
    }
  });

  document.getElementById("load-btn").addEventListener("click", handleLoadModel);
  document.getElementById("generate-btn").addEventListener("click", handleGenerate);
}

// =========================================================
// CARGAR MODELO
// =========================================================

async function handleLoadModel() {
  const voiceId = document.getElementById("voice-select").value;
  const voice = VOICES.find((v) => v.id === voiceId);
  if (!voice) return;

  setStatus("loading", "Cargando modelo...", `Descargando ${voice.label}`);
  setProgress(0, "Iniciando descarga...");

  try {
    // Pre-fetch para mostrar progreso real de descarga
    // (El worker también descarga, pero esto da feedback visual)
    await fetchWithProgress(voice.modelPath, (percent) => {
      setProgress(percent, `Descargando modelo: ${percent}%`);
    });

    setProgress(75, "Cargando runtime WASM...");

    // Ahora inicializar el worker (carga el WASM de espeak-ng también)
    await initializeWorker(voice);

    setProgress(100, "Listo");
    setStatus("ready", "Modelo cargado", `Voz activa: ${voice.label}`);

    setTimeout(() => setProgress(null), 1000);

  } catch (err) {
    setStatus("error", "Error al cargar", err.message);
    setProgress(null);
    console.error("[PiperApp] Error cargando modelo:", err);
  }
}

/**
 * Descarga un archivo mostrando progreso usando fetch + ReadableStream.
 * Necesario porque el ONNX model puede ser >100MB y el usuario necesita feedback.
 */
async function fetchWithProgress(url, onProgress) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`No se pudo descargar el modelo: ${response.status} ${response.statusText}. ¿Existe el archivo en ${url}?`);
  }

  const contentLength = response.headers.get("content-length");
  if (!contentLength) {
    // Si no hay Content-Length, solo leer sin progreso
    await response.arrayBuffer();
    onProgress(100);
    return;
  }

  const total = parseInt(contentLength, 10);
  let loaded = 0;
  const reader = response.body.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.length;
    onProgress(Math.round((loaded / total) * 100));
  }
}

/**
 * Inicializa el Web Worker con el modelo de voz seleccionado.
 * Retorna una Promise que resuelve cuando el worker confirma que está listo.
 */
function initializeWorker(voice) {
  return new Promise((resolve, reject) => {
    if (AppState.worker) {
      AppState.worker.terminate();
    }

    const worker = new Worker(WASM_PATHS.workerJs);
    AppState.worker = worker;

    const timeout = setTimeout(() => {
      reject(new Error("Timeout: El worker tardó más de 60 segundos en inicializarse"));
    }, 60000);

    worker.onmessage = (event) => {
      const { type, error, progress } = event.data;

      if (type === "initialized" || type === "ready") {
        clearTimeout(timeout);
        AppState.currentVoiceId = voice.id;

        // Reasignar el handler permanente para las generaciones
        worker.onmessage = handleWorkerMessage;
        resolve();

      } else if (type === "progress") {
        setProgress(75 + Math.round(progress * 0.25), "Cargando modelo ONNX...");

      } else if (type === "error") {
        clearTimeout(timeout);
        reject(new Error(error || "Error desconocido en worker"));
      }
    };

    worker.onerror = (err) => {
      clearTimeout(timeout);
      reject(new Error(`Error del worker: ${err.message}. Verifica que los archivos WASM están en la ruta correcta.`));
    };

    worker.postMessage({
      type: "initialize",
      phonemizeJs:   new URL(WASM_PATHS.phonemizeJs, window.location.href).href,
      phonemizeWasm: new URL(WASM_PATHS.phonemizeWasm, window.location.href).href,
      phonemizeData: new URL(WASM_PATHS.phonemizeData, window.location.href).href,
      modelUrl:      new URL(voice.modelPath, window.location.href).href,
      configUrl:     new URL(voice.configPath, window.location.href).href,
      speakerId:     0,
    });
  });
}

// =========================================================
// GENERACIÓN DE AUDIO
// =========================================================

async function handleGenerate() {
  const text = document.getElementById("text-input").value.trim();
  if (!text) {
    setStatus("error", "Sin texto", "Escribe algo en el área de texto primero.");
    return;
  }

  if (AppState.status !== "ready") {
    setStatus("error", "No listo", "Carga un modelo primero.");
    return;
  }

  const voice = VOICES.find((v) => v.id === AppState.currentVoiceId);
  if (!voice) return;

  setStatus("generating", "Generando audio...", "Procesando texto con el modelo ONNX...");
  setProgress(0, "Iniciando síntesis...");

  try {
    const audioBlob = await generateAudio(text, voice, (percent) => {
      setProgress(percent, `Sintetizando: ${percent}%`);
    });

    // Revocar URL anterior si existe
    if (AppState.lastBlobUrl) {
      URL.revokeObjectURL(AppState.lastBlobUrl);
    }

    const blobUrl = URL.createObjectURL(audioBlob);
    AppState.lastBlobUrl = blobUrl;

    // Mostrar el player de audio
    const audioPlayer = document.getElementById("audio-player");
    audioPlayer.src = blobUrl;
    document.getElementById("audio-container").classList.remove("hidden");

    // Configurar botón de descarga
    document.getElementById("download-btn").onclick = () => {
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `piper_${voice.id}_${Date.now()}.wav`;
      a.click();
    };

    setStatus("ready", "Audio generado", `Voz activa: ${voice.label}`);
    setProgress(null);

    // Auto-play
    audioPlayer.play().catch(() => {
      // Autoplay puede ser bloqueado por el navegador — no es error crítico
    });

  } catch (err) {
    setStatus("error", "Error al generar", err.message);
    setProgress(null);
    console.error("[PiperApp] Error generando audio:", err);
  }
}

/**
 * Envía el texto al worker y espera el audio resultante.
 * El worker ya tiene el modelo cargado de la llamada a initializeWorker.
 */
function generateAudio(text, voice, onProgress) {
  return new Promise((resolve, reject) => {
    AppState.pendingResolve = resolve;
    AppState.pendingReject = reject;

    AppState.worker.postMessage({
      type: "generate",
      text: text,
      speakerId: 0,
    });

    // El onmessage ya está seteado como handleWorkerMessage
  });
}

function handleWorkerMessage(event) {
  const { type, data, progress, error } = event.data;

  switch (type) {
    case "progress":
      if (AppState.pendingResolve) {
        setProgress(Math.round(progress * 100), `Sintetizando: ${Math.round(progress * 100)}%`);
      }
      break;

    case "complete":
    case "output":
      if (AppState.pendingResolve) {
        // data puede ser ArrayBuffer, Float32Array o Blob según versión del worker
        let audioBlob;
        if (data instanceof Blob) {
          audioBlob = data;
        } else if (typeof data === "string" && data.startsWith("blob:")) {
          // Algunas versiones retornan una blob URL directamente
          fetch(data).then(r => r.blob()).then(blob => {
            AppState.pendingResolve(blob);
            AppState.pendingResolve = null;
            AppState.pendingReject = null;
          });
          return;
        } else {
          audioBlob = new Blob([data], { type: "audio/wav" });
        }
        AppState.pendingResolve(audioBlob);
        AppState.pendingResolve = null;
        AppState.pendingReject = null;
      }
      break;

    case "error":
      if (AppState.pendingReject) {
        AppState.pendingReject(new Error(error || "Error desconocido en worker"));
        AppState.pendingResolve = null;
        AppState.pendingReject = null;
      }
      break;
  }
}
```

---

## PARTE 5: SERVIDOR HTTP LOCAL — Cómo evitar errores CORS

Esta es la parte que más usuarios omiten y la que causa el 90% de los errores.

### Por qué `file://` no funciona

Cuando abres `index.html` directamente con doble clic (protocolo `file://`):
1. El navegador bloquea los `fetch()` a otros archivos locales por Same-Origin Policy
2. El archivo `.wasm` no se puede servir con `Content-Type: application/wasm` correcto
3. Los Web Workers no pueden hacer `importScripts()` desde `file://`
4. Los modelos ONNX (.onnx) no se pueden leer como ArrayBuffer

**Solución: Usar un servidor HTTP local.** El LLM debe incluir este archivo:

### Archivo `serve.sh` (Unix/macOS/Linux)

```bash
#!/bin/bash
# serve.sh — Inicia un servidor HTTP simple para desarrollo
# Uso: ./serve.sh
# Luego abrir: http://localhost:8080/piper/

cd "$(dirname "$0")/.." || exit  # Ir a la raíz del proyecto (un nivel arriba de /public/)

echo "Iniciando servidor en http://localhost:8080"
echo "Abre: http://localhost:8080/piper/"
echo ""

# Opción 1: Python 3 (recomendado, viene preinstalado en macOS/Linux)
if command -v python3 &>/dev/null; then
  python3 -m http.server 8080 --directory public
  exit 0
fi

# Opción 2: Python 2
if command -v python &>/dev/null; then
  cd public && python -m SimpleHTTPServer 8080
  exit 0
fi

# Opción 3: Node.js con npx
if command -v npx &>/dev/null; then
  npx serve public -p 8080
  exit 0
fi

echo "ERROR: No se encontró Python ni Node.js."
echo "Instala uno de ellos o usa VS Code con Live Server."
```

### Opciones de servidor (el LLM debe listarlas todas en comentarios)

```
# Opción A — Python 3 (recomendado)
cd /ruta/a/tu/proyecto
python3 -m http.server 8080 --directory public
# → http://localhost:8080/piper/

# Opción B — Node.js con npx serve
npx serve public -p 8080
# → http://localhost:8080/piper/

# Opción C — Node.js con http-server
npx http-server public -p 8080 --cors
# → http://localhost:8080/piper/

# Opción D — Deno
deno run --allow-net --allow-read https://deno.land/std/http/file_server.ts public/ --port 8080

# Opción E — VS Code Live Server
# Instalar extensión "Live Server" de Ritwick Dey
# Clic derecho en index.html → Open with Live Server

# Opción F — Caddy (producción)
caddy file-server --root ./public --listen :8080

# Opción G — nginx (producción)
# En el config de nginx, agregar:
# location /piper/ {
#   add_header Cross-Origin-Embedder-Policy require-corp;
#   add_header Cross-Origin-Opener-Policy same-origin;
# }
```

### Headers especiales para SharedArrayBuffer (si se usa)

Si el worker usa `SharedArrayBuffer` (ONNX Runtime con SIMD + multi-threading), el servidor DEBE enviar estos headers:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

**Para Python 3**, crear este servidor customizado en `serve_coop.py`:

```python
#!/usr/bin/env python3
"""
Servidor HTTP con headers COOP/COEP para SharedArrayBuffer.
Necesario para ONNX Runtime Web con SIMD multi-threading.
"""
import http.server
import sys
import os

class CORSHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Resource-Policy", "cross-origin")
        super().end_headers()

    def log_message(self, fmt, *args):
        print(f"[HTTP] {self.address_string()} - {fmt % args}")

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    directory = sys.argv[2] if len(sys.argv) > 2 else "./public"

    os.chdir(directory)
    handler = CORSHandler
    with http.server.HTTPServer(("", port), handler) as httpd:
        print(f"Servidor en http://localhost:{port}/piper/")
        print("Headers COOP/COEP activos para SharedArrayBuffer")
        httpd.serve_forever()
```

Uso: `python3 serve_coop.py 8080 ./public`

---

## PARTE 6: DIAGNÓSTICO DE ERRORES COMUNES

El LLM debe incluir esta sección como comentario en `script.js` o en el README:

```
ERROR: "CompileError: WebAssembly.instantiate(): expected magic word"
CAUSA:  El archivo .wasm se sirvió con Content-Type incorrecto (text/html = 404 page served instead)
FIX:    Verificar que los archivos existen en la ruta. No hay 404 silencioso.
        Usar: fetch('./piper_phonemize.wasm').then(r => console.log(r.status, r.headers.get('content-type')))

ERROR: "Failed to fetch" o "NetworkError"
CAUSA:  Los archivos no están en la ruta correcta, o se usa file:// en lugar de http://
FIX:    Usar servidor HTTP. Ver Parte 5.

ERROR: "Worker script URL must be a valid HTTPS or HTTP URL"
CAUSA:  Se intentó crear Worker con path relativo en file:// context
FIX:    Usar URL absoluta: new Worker(new URL('./piper_worker.js', import.meta.url))
        O convertir a absoluta: new URL('./piper_worker.js', window.location.href).href

ERROR: "SharedArrayBuffer is not defined"
CAUSA:  Faltan headers COOP/COEP
FIX:    Usar serve_coop.py o configurar nginx/caddy con los headers correspondientes

ERROR: El worker no responde al mensaje "initialize"
CAUSA:  La API del worker puede variar entre versiones de piper-wasm
FIX:    Abrir piper_worker.js y buscar el addEventListener('message', ...) para ver
        los tipos de mensaje que acepta. Adaptar script.js en consecuencia.

ERROR: Audio generado suena distorsionado o muy rápido/lento
CAUSA:  El sample rate del elemento <audio> no coincide con el del modelo
FIX:    Verificar voice.sampleRate en el catálogo VOICES y asegurarse de que
        el WAV generado tiene el header correcto. Piper debería manejarlo automáticamente.

ERROR: "OrtError: Failed to create session"
CAUSA:  El archivo .onnx está corrupto o la descarga fue incompleta
FIX:    Re-descargar el modelo. Verificar SHA256 en HuggingFace.
```

---

## PARTE 7: ARQUITECTURA — DIAGRAMA EXPLICATIVO

Para que el LLM entienda el flujo completo y pueda responder preguntas de depuración:

```
NAVEGADOR (Main Thread)
│
├── index.html
│   └── <script src="script.js">
│
├── script.js
│   ├── VOICES catalog (rutas locales a modelos)
│   ├── fetch() → descarga modelo ONNX con progreso
│   ├── new Worker('./piper_worker.js') → hilo separado
│   │   └── postMessage({ type: 'initialize', ... })
│   └── postMessage({ type: 'generate', text }) → espera respuesta
│
└── DOM (UI): textarea, select, buttons, audio player

═══════════════════════════════════════════════════

Web Worker (Hilo separado, no bloquea UI)
│
├── piper_worker.js    ← emite mensajes: initialized, progress, complete, error
│   │
│   ├── carga piper_phonemize.wasm (~15MB)
│   │     └── espeak-ng compilado a WASM (fonemización de texto)
│   │
│   ├── carga modelo .onnx (~25-130MB según calidad)
│   │     └── Red neuronal Vits/VITS en formato ONNX
│   │
│   └── Por cada "generate":
│       ├── texto → piper_phonemize → IDs de fonemas
│       ├── IDs → ONNX Runtime (ort-wasm-simd.wasm) → PCM samples
│       └── PCM → encode WAV → ArrayBuffer → postMessage back
│
└── piper_phonemize.js + .wasm + .data (espeak-ng data)

═══════════════════════════════════════════════════

/public/piper/models/
│
├── es_AR-daniela-high.onnx        ← Red neuronal (130MB)
├── es_AR-daniela-high.onnx.json   ← Config: sample_rate, num_symbols, etc.
├── es_ES-davefx-medium.onnx       ← Red neuronal (65MB)
└── ...

Fuente: https://huggingface.co/rhasspy/piper-voices/tree/main/es
```

---

## PARTE 8: CONSIDERACIONES DE PRODUCCIÓN

El LLM debe incluir estas notas en los comentarios del código:

### Caché de modelos con Cache API

```javascript
/**
 * MEJORA OPCIONAL: Cachear modelos en el navegador para no re-descargar.
 * Los modelos son grandes (25-130MB). Con Cache API persisten entre sesiones.
 *
 * Implementación:
 */
async function fetchModelWithCache(url) {
  const cacheName = "piper-models-v1";
  const cache = await caches.open(cacheName);

  const cached = await cache.match(url);
  if (cached) {
    console.log(`[Cache HIT] ${url}`);
    return cached;
  }

  console.log(`[Cache MISS] Descargando ${url}...`);
  const response = await fetch(url);
  if (response.ok) {
    // Clonar antes de cachear (el body solo se puede leer una vez)
    await cache.put(url, response.clone());
  }
  return response;
}
```

### Consideraciones de licencia (obligatorio por requerimiento)

```javascript
/**
 * LICENCIAS DE MODELOS:
 *
 * Todos los modelos de voz de Rhasspy Piper están bajo licencia MIT:
 * https://github.com/rhasspy/piper/blob/master/LICENSE
 *
 * Modelos específicos pueden tener licencias adicionales:
 * - es_AR-daniela: MIT
 * - es_ES-davefx: MIT
 * - es_ES-carlfm: MIT
 * - es_MX-ald: MIT
 * - es_ES-sharvard: MIT (dataset MLS)
 *
 * Verificar siempre en HuggingFace el archivo LICENSE de cada modelo:
 * https://huggingface.co/rhasspy/piper-voices/tree/main/es
 *
 * El motor piper-phonemize (espeak-ng): GPL v3
 * ONNX Runtime Web: MIT
 * piper-wasm wrapper: MIT
 *
 * Para cumplir con la atribución:
 * 1. Mencionar "Piper TTS by Rhasspy" en el footer
 * 2. Enlazar a https://github.com/rhasspy/piper
 * 3. Para uso comercial: verificar cada modelo individualmente
 */
```

---

## CHECKLIST DE VERIFICACIÓN FINAL

Antes de entregar el código, el LLM debe confirmar:

- [ ] `index.html` carga Tailwind via CDN sin errores
- [ ] El selector de voces se pobla con todas las entradas de `VOICES`
- [ ] El botón "Cargar modelo" solo está activo en estado `idle` y `ready`
- [ ] El botón "Generar voz" solo está activo en estado `ready`
- [ ] El indicador de estado cambia de color según el estado (gris/amarillo/verde/azul/rojo)
- [ ] La barra de progreso muestra el % real de descarga del modelo
- [ ] Los rutas a WASM son absolutas (usando `new URL(..., window.location.href)`) para evitar problemas con Workers
- [ ] El Web Worker se crea con `new Worker(path)` y no con `new Worker(blob:)` que tiene restricciones CSP
- [ ] El footer menciona la licencia MIT y enlaza a rhasspy/piper
- [ ] El archivo `serve.sh` o instrucciones de servidor están incluidas
- [ ] Los comentarios en el código explican el problema CORS y cómo solucionarlo
- [ ] El manejo de errores del worker cubre: timeout, error de red, error de ONNX

---

## FUENTES Y REFERENCIAS

| Recurso | URL |
|---|---|
| Repositorio Piper original | https://github.com/rhasspy/piper |
| Piper WASM (wide-video) | https://github.com/wide-video/piper-wasm |
| Piper WASM (diffusionstudio) | https://github.com/diffusionstudio/piper-wasm |
| Paquete npm piper-wasm | https://socket.dev/npm/package/piper-wasm |
| CDN jsDelivr para piper-wasm | https://www.jsdelivr.com/package/npm/piper-wasm |
| Modelos de voz HuggingFace | https://huggingface.co/rhasspy/piper-voices |
| Voces en español | https://huggingface.co/rhasspy/piper-voices/tree/main/es |
| Voces es_AR | https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_AR |
| Voces es_ES | https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_ES |
| Voces es_MX | https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_MX |
| ONNX Runtime Web | https://onnxruntime.ai/docs/build/web.html |
| Piper TTS Web (fork Mintplex) | https://github.com/Mintplex-Labs/piper-tts-web |
| MDN: Web Workers API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API |
| MDN: SharedArrayBuffer COOP/COEP | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements |
| Issue original: Piper en browser | https://github.com/rhasspy/piper/issues/352 |

---

*Documento generado el 4 de abril de 2026. Verificado contra los repositorios activos listados.*
