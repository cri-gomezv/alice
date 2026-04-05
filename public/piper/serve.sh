#!/bin/bash
# serve.sh — Servidor de desarrollo para Piper TTS
#
# USO:
#   chmod +x serve.sh
#   ./serve.sh
#
# LUEGO ABRIR: http://localhost:8080/piper/
#
# NOTA: Para ONNX Runtime con SIMD (SharedArrayBuffer), usa serve_coop.py:
#   python3 serve_coop.py 8080 ./public

set -e

PORT=8080
PUBLIC_DIR="$(dirname "$0")/public"

if [ ! -d "$PUBLIC_DIR" ]; then
  echo "ERROR: No se encontró la carpeta public/ en: $PUBLIC_DIR"
  echo "Asegúrate de ejecutar este script desde la raíz del proyecto."
  exit 1
fi

echo ""
echo "  🔊 Piper TTS — Servidor de desarrollo"
echo "  URL: http://localhost:${PORT}/piper/"
echo ""

# Opción 1: Python 3 (recomendado)
if command -v python3 &>/dev/null; then
  echo "  Usando: python3"
  python3 -m http.server "$PORT" --directory "$PUBLIC_DIR"
  exit 0
fi

# Opción 2: Python 2
if command -v python &>/dev/null; then
  echo "  Usando: python 2"
  cd "$PUBLIC_DIR" && python -m SimpleHTTPServer "$PORT"
  exit 0
fi

# Opción 3: Node.js npx serve
if command -v npx &>/dev/null; then
  echo "  Usando: npx serve"
  npx serve "$PUBLIC_DIR" -p "$PORT"
  exit 0
fi

# Opción 4: Node.js http-server
if command -v http-server &>/dev/null; then
  echo "  Usando: http-server"
  http-server "$PUBLIC_DIR" -p "$PORT" --cors
  exit 0
fi

echo "ERROR: No se encontró Python ni Node.js."
echo ""
echo "Instala una de estas opciones:"
echo "  - Python 3: https://python.org"
echo "  - Node.js:  https://nodejs.org"
echo "  - VS Code Live Server (extensión de Ritwick Dey)"
exit 1
