# TTS Local — Xenova / español

## Requisitos
- Node.js instalado (https://nodejs.org) — solo para servir archivos
- Chrome o Edge (necesitan HTTPS o localhost para AudioContext + ES modules)

## Cómo usar

1. Coloca ambos archivos en la misma carpeta:
   - index.html
   - server.js

2. Abre una terminal en esa carpeta y ejecuta:
   ```
   node server.js
   ```

3. Abre Chrome/Edge en:
   ```
   http://localhost:8080
   ```

4. La primera vez descarga el modelo (~100 MB desde HuggingFace).
   Las siguientes veces lo usa desde caché del browser — sin descarga.

## Características
- Audio generado en memoria (Float32Array → AudioBuffer)
- Sin Blob, sin URL.createObjectURL, sin archivos temporales
- Memoria liberada automáticamente al terminar la reproducción
- Visualizador de onda en tiempo real
- Sin APIs externas, sin Python, sin instalaciones adicionales

## Modelo
Xenova/mms-tts-spa — español nativo, pesos ONNX

## CDN

import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.1';
