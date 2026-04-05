#!/bin/bash
# download_models.sh — Descarga todos los modelos de voz en español
#
# USO:
#   chmod +x download_models.sh
#   ./download_models.sh              # descarga todas las voces
#   ./download_models.sh carlfm       # descarga solo una voz (más rápido para probar)
#
# VOCES DISPONIBLES:
#   daniela   → Argentina, alta calidad, ~130MB
#   carlfm    → España, muy ligera, ~25MB  ← RECOMENDADA para empezar
#   davefx    → España, media calidad, ~65MB
#   sharvard  → España, media calidad, multi-hablante, ~65MB
#   mls10246  → España, baja calidad, ~35MB
#   mls9972   → España, baja calidad, ~35MB
#   ald       → México, media calidad, ~65MB

set -e

MODELS_DIR="$(dirname "$0")/public/piper/models"
HF_BASE="https://huggingface.co/rhasspy/piper-voices/resolve/main/es"

mkdir -p "$MODELS_DIR"

download_voice() {
  local name="$1"
  local onnx_url="$2"
  local json_url="$3"
  local onnx_file="$MODELS_DIR/$(basename "$onnx_url")"
  local json_file="$MODELS_DIR/$(basename "$json_url")"

  echo ""
  echo "⬇  Descargando: $name"

  if [ -f "$onnx_file" ]; then
    echo "   ✓ .onnx ya existe, omitiendo"
  else
    echo "   Descargando .onnx ..."
    wget -q --show-progress -O "$onnx_file" "$onnx_url" || \
    curl -L --progress-bar -o "$onnx_file" "$onnx_url"
  fi

  if [ -f "$json_file" ]; then
    echo "   ✓ .onnx.json ya existe, omitiendo"
  else
    echo "   Descargando .onnx.json ..."
    wget -q -O "$json_file" "$json_url" || \
    curl -L -o "$json_file" "$json_url"
  fi

  echo "   ✅ $name listo"
}

FILTER="${1:-all}"

case "$FILTER" in
  daniela|all)
    download_voice "Daniela (Argentina · high · ~130MB)" \
      "$HF_BASE/es_AR/daniela/high/es_AR-daniela-high.onnx" \
      "$HF_BASE/es_AR/daniela/high/es_AR-daniela-high.onnx.json"
    ;;
esac

case "$FILTER" in
  carlfm|all)
    download_voice "Carlfm (España · x_low · ~25MB)" \
      "$HF_BASE/es_ES/carlfm/x_low/es_ES-carlfm-x_low.onnx" \
      "$HF_BASE/es_ES/carlfm/x_low/es_ES-carlfm-x_low.onnx.json"
    ;;
esac

case "$FILTER" in
  davefx|all)
    download_voice "Davefx (España · medium · ~65MB)" \
      "$HF_BASE/es_ES/davefx/medium/es_ES-davefx-medium.onnx" \
      "$HF_BASE/es_ES/davefx/medium/es_ES-davefx-medium.onnx.json"
    ;;
esac

case "$FILTER" in
  sharvard|all)
    download_voice "Sharvard (España · medium · ~65MB)" \
      "$HF_BASE/es_ES/sharvard/medium/es_ES-sharvard-medium.onnx" \
      "$HF_BASE/es_ES/sharvard/medium/es_ES-sharvard-medium.onnx.json"
    ;;
esac

case "$FILTER" in
  mls10246|all)
    download_voice "MLS 10246 (España · low · ~35MB)" \
      "$HF_BASE/es_ES/mls_10246/low/es_ES-mls_10246-low.onnx" \
      "$HF_BASE/es_ES/mls_10246/low/es_ES-mls_10246-low.onnx.json"
    ;;
esac

case "$FILTER" in
  mls9972|all)
    download_voice "MLS 9972 (España · low · ~35MB)" \
      "$HF_BASE/es_ES/mls_9972/low/es_ES-mls_9972-low.onnx" \
      "$HF_BASE/es_ES/mls_9972/low/es_ES-mls_9972-low.onnx.json"
    ;;
esac

case "$FILTER" in
  ald|all)
    download_voice "Ald (México · medium · ~65MB)" \
      "$HF_BASE/es_MX/ald/medium/es_MX-ald-medium.onnx" \
      "$HF_BASE/es_MX/ald/medium/es_MX-ald-medium.onnx.json"
    ;;
esac

echo ""
echo "✅ Descarga completada."
echo "   Modelos en: $MODELS_DIR"
echo ""
echo "Siguiente paso: iniciar el servidor"
echo "  python3 serve_coop.py 8080 ./public"
echo "  → http://localhost:8080/piper/"
