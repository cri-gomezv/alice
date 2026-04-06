# README_SETUP.md — Piper TTS WebAssembly

Síntesis de voz 100% en el navegador del cliente. Sin APIs externas. Sin inferencia en servidor.

## Estructura de archivos

```
/public/piper/
├── index.html                        ✅ Generado
├── script.js                         ✅ Generado
├── serve_coop.py                     ✅ Generado (servidor con headers COOP/COEP)
├── serve.sh                          ✅ Generado (servidor rápido de desarrollo)
│
├── piper_phonemize.js                ⬇ COPIAR desde npm (ver Paso 1)
├── piper_phonemize.wasm              ⬇ COPIAR desde npm
├── piper_phonemize.data              ⬇ COPIAR desde npm
├── piper_worker.js                   ⬇ COPIAR desde npm
├── dist/                             ⬇ COPIAR desde npm (ONNX Runtime)
│   └── ort-wasm-simd.wasm
├── espeak-ng-data/
│   ├── voices/                       ⬇ COPIAR desde npm
│   └── lang/                         ⬇ COPIAR desde npm
└── models/
    ├── es_AR-daniela-high.onnx       ⬇ DESCARGAR desde HuggingFace (Paso 2)
    ├── es_AR-daniela-high.onnx.json
    ├── es_ES-carlfm-x_low.onnx
    ├── es_ES-carlfm-x_low.onnx.json
    ├── es_ES-davefx-medium.onnx
    ├── es_ES-davefx-medium.onnx.json
    ├── es_MX-ald-medium.onnx
    ├── es_MX-ald-medium.onnx.json
    ├── es_ES-sharvard-medium.onnx
    ├── es_ES-sharvard-medium.onnx.json
    ├── es_ES-mls_10246-low.onnx
    ├── es_ES-mls_10246-low.onnx.json
    ├── es_ES-mls_9972-low.onnx
    └── es_ES-mls_9972-low.onnx.json
```

---

## Paso 1: Copiar archivos WASM desde npm

Estos archivos son el motor WebAssembly de Piper. Se obtienen del paquete npm.

```bash
# Desde la raíz de tu proyecto
npm install piper-wasm

# Copiar motor WASM
cp node_modules/piper-wasm/build/piper_phonemize.wasm  public/piper/
cp node_modules/piper-wasm/build/piper_phonemize.data  public/piper/
cp node_modules/piper-wasm/build/piper_phonemize.js    public/piper/
cp node_modules/piper-wasm/build/worker/piper_worker.js public/piper/

# Copiar ONNX Runtime Web
cp -r node_modules/piper-wasm/build/worker/dist        public/piper/dist

# Copiar datos de espeak-ng (fonemización de texto)
mkdir -p public/piper/espeak-ng-data
cp -r node_modules/piper-wasm/espeak-ng/espeak-ng-data/voices public/piper/espeak-ng-data/voices
cp -r node_modules/piper-wasm/espeak-ng/espeak-ng-data/lang   public/piper/espeak-ng-data/lang
```

**Fuente npm**: https://www.npmjs.com/package/piper-wasm

---

## Paso 2: Descargar modelos de voz (.onnx)

Los modelos se obtienen de HuggingFace. Cada voz requiere dos archivos: `.onnx` (modelo) y `.onnx.json` (configuración).

**URL base**: https://huggingface.co/rhasspy/piper-voices/tree/main/es

```bash
mkdir -p public/piper/models
cd public/piper/models

# ── Argentina ──────────────────────────────────────────────────────────────
# Daniela · Alta calidad · ~130MB (mejor calidad, más pesado)
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_AR/daniela/high/es_AR-daniela-high.onnx"
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_AR/daniela/high/es_AR-daniela-high.onnx.json"

# ── España ─────────────────────────────────────────────────────────────────
# Carlfm · Muy ligero · ~25MB (RECOMENDADO para primera prueba)
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/carlfm/x_low/es_ES-carlfm-x_low.onnx"
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/carlfm/x_low/es_ES-carlfm-x_low.onnx.json"

# Davefx · Media calidad · ~65MB
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/davefx/medium/es_ES-davefx-medium.onnx"
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/davefx/medium/es_ES-davefx-medium.onnx.json"

# Sharvard · Media calidad · Multi-hablante · ~65MB
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/sharvard/medium/es_ES-sharvard-medium.onnx"
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/sharvard/medium/es_ES-sharvard-medium.onnx.json"

# MLS 10246 · Baja calidad · ~35MB
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/mls_10246/low/es_ES-mls_10246-low.onnx"
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/mls_10246/low/es_ES-mls_10246-low.onnx.json"

# MLS 9972 · Baja calidad · ~35MB
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/mls_9972/low/es_ES-mls_9972-low.onnx"
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/mls_9972/low/es_ES-mls_9972-low.onnx.json"

# ── México ─────────────────────────────────────────────────────────────────
# Ald · Media calidad · ~65MB
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_MX/ald/medium/es_MX-ald-medium.onnx"
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_MX/ald/medium/es_MX-ald-medium.onnx.json"
```

### Tabla de voces disponibles

| ID | País | Hablante | Calidad | Tamaño |
|---|---|---|---|---|
| `es_AR-daniela-high` | Argentina | Daniela | high | ~130 MB |
| `es_ES-carlfm-x_low` | España | Carlfm | x_low | ~25 MB |
| `es_ES-davefx-medium` | España | Davefx | medium | ~65 MB |
| `es_ES-sharvard-medium` | España | Sharvard | medium | ~65 MB |
| `es_ES-mls_10246-low` | España | MLS 10246 | low | ~35 MB |
| `es_ES-mls_9972-low` | España | MLS 9972 | low | ~35 MB |
| `es_MX-ald-medium` | México | Ald | medium | ~65 MB |

---

## Paso 3: Iniciar el servidor

**IMPORTANTE**: No abras `index.html` directamente con doble clic (`file://`).
El navegador bloqueará los archivos `.wasm` y los Web Workers.
**Siempre usa un servidor HTTP.**

### Opción A — Python 3 con COOP/COEP (RECOMENDADO para producción local)

```bash
python3 serve_coop.py 8080 ./public
# → http://localhost:8080/piper/
```

Incluye los headers `Cross-Origin-Embedder-Policy` y `Cross-Origin-Opener-Policy`
requeridos por ONNX Runtime SIMD (SharedArrayBuffer).

### Opción B — Script automático

```bash
chmod +x serve.sh
./serve.sh
# → http://localhost:8080/piper/
```

### Opción C — Python 3 simple (sin COOP/COEP)

```bash
python3 -m http.server 8080 --directory public
# → http://localhost:8080/piper/
```

Funciona si ONNX Runtime no necesita SharedArrayBuffer en tu versión del paquete.

### Opción D — Node.js

```bash
npx serve public -p 8080
# o
npx http-server public -p 8080 --cors
```

### Para nginx (producción)

```nginx
location /piper/ {
    root /var/www/tu-proyecto/public;
    add_header Cross-Origin-Embedder-Policy "require-corp";
    add_header Cross-Origin-Opener-Policy "same-origin";
    add_header Cross-Origin-Resource-Policy "cross-origin";
    
    # Content-Type correcto para .wasm
    types {
        application/wasm wasm;
    }
}
```

### Para Caddy (producción)

```caddyfile
example.com {
    root * /var/www/tu-proyecto/public
    file_server
    
    header /piper/* {
        Cross-Origin-Embedder-Policy "require-corp"
        Cross-Origin-Opener-Policy "same-origin"
    }
}
```

---

## Diagnóstico de errores

| Error | Causa | Solución |
|---|---|---|
| `CompileError: expected magic word` | `.wasm` servido como HTML (404) | Verifica que los archivos WASM existen en la carpeta |
| `Failed to fetch` / `NetworkError` | Se usa `file://` en lugar de `http://` | Iniciar servidor HTTP |
| `SharedArrayBuffer is not defined` | Faltan headers COOP/COEP | Usar `serve_coop.py` o configurar nginx |
| `Worker script URL must be valid HTTP` | Worker con path relativo en `file://` | Iniciar servidor HTTP |
| `Timeout: El worker tardó más de 120s` | Modelo muy grande / poco RAM | Usar `es_ES-carlfm-x_low` (~25MB) primero |
| `OrtError: Failed to create session` | Archivo `.onnx` corrupto | Re-descargar el modelo |

---

## Licencias

- **Modelos de voz Piper**: MIT — https://github.com/rhasspy/piper/blob/master/LICENSE
- **piper-phonemize (espeak-ng)**: GPL v3
- **ONNX Runtime Web**: MIT
- **piper-wasm wrapper**: MIT

Para uso comercial: verificar la licencia de cada modelo individualmente en HuggingFace.

---

## Referencias

| Recurso | URL |
|---|---|
| Piper TTS (repositorio principal) | https://github.com/rhasspy/piper |
| Piper WASM (wide-video) | https://github.com/wide-video/piper-wasm |
| Paquete npm piper-wasm | https://www.npmjs.com/package/piper-wasm |
| Modelos en español (HuggingFace) | https://huggingface.co/rhasspy/piper-voices/tree/main/es |
| ONNX Runtime Web | https://onnxruntime.ai/docs/build/web.html |
| MDN: Web Workers API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API |
| MDN: SharedArrayBuffer COOP/COEP | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements |

# Secuencia de comandos que funcionó correctamente

1. Preparación del Entorno (En Ubuntu Host)
Primero, entramos al contenedor mapeando nuestra carpeta de trabajo:

```bash
cd ~/2026/alejandra/public/piper
docker run -it -v $(pwd):/wasm -w /wasm debian:11.3
```

2. Configuración Interna (Dentro de Docker)
Instalamos las herramientas de compilación y el SDK de Emscripten:

```bash
# Instalación de dependencias
apt-get update && apt-get install --yes --no-install-recommends \
build-essential cmake ca-certificates curl pkg-config git python3 \
autogen automake autoconf libtool wget  

# Configuración de Emscripten
mkdir -p /wasm/modules
git clone --depth 1 https://github.com/emscripten-core/emsdk.git /wasm/modules/emsdk
cd /wasm/modules/emsdk
./emsdk install 3.1.47
./emsdk activate 3.1.47
source ./emsdk_env.sh
```

3. Compilación de Librerías (Dentro de Docker)
Compilamos espeak-ng y preparamos los binarios de Piper:

```bash
# Compilar espeak-ng
git clone --depth 1 https://github.com/rhasspy/espeak-ng.git /wasm/modules/espeak-ng
cd /wasm/modules/espeak-ng
./autogen.sh && ./configure && make

# Instalación de piper-wasm vía npm (para obtener los archivos de distribución)
cd /wasm
npm install piper-wasm
```

4. Organización de Archivos Finales (Dentro de Docker)
Dado que la compilación manual de Piper suele fallar en la generación de datos dentro de Docker, el método exitoso fue extraer los archivos del paquete npm instalado y organizarlos en la estructura que Alejandra necesita:

```bash
# Crear estructura de carpetas
mkdir -p /wasm/dist
mkdir -p /wasm/espeak-ng-data
mkdir -p /wasm/models

# Copiar Binarios y Worker
cp node_modules/piper-wasm/build/piper_phonemize.data /wasm/
cp node_modules/piper-wasm/build/piper_phonemize.js   /wasm/
cp node_modules/piper-wasm/build/piper_phonemize.wasm /wasm/
cp node_modules/piper-wasm/build/worker/piper_worker.js /wasm/

# Copiar ONNX Runtime (Librerías de ejecución)
cp -r node_modules/piper-wasm/build/worker/dist/* /wasm/dist/

# Copiar Datos de voz (espeak-ng)
cp -r node_modules/piper-wasm/espeak-ng/espeak-ng-data/voices /wasm/espeak-ng-data/
cp -r node_modules/piper-wasm/espeak-ng/espeak-ng-data/lang   /wasm/espeak-ng-data/

# Descargar un modelo de voz para pruebas (Ejemplo: Carlfm)
cd /wasm/models
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/carlfm/x_low/es_ES-carlfm-x_low.onnx"
wget "https://huggingface.co/rhasspy/piper-voices/resolve/main/es/es_ES/carlfm/x_low/es_ES-carlfm-x_low.onnx.json"
```

5. Salida y Verificación (En Ubuntu Host)
Ahora simplemente sal del contenedor. Los archivos ya estarán en tu disco duro:

```bash
exit

# Verificar en tu Ubuntu
cd ~/2026/alejandra/public/piper
ls -R
```

¿Por qué funcionó esto?

En lugar de pelear con el error de Permission denied al compilar las entonaciones (que es un problema de ejecución de binarios WASM en entornos Linux nativos), instalamos el paquete npm que ya contiene los archivos .data, .js y .wasm pre-compilados y los movimos a la estructura de carpetas correcta para tu servidor web.