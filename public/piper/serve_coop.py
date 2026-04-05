#!/usr/bin/env python3
"""
serve_coop.py — Servidor HTTP con headers COOP/COEP para Piper TTS

PARA QUÉ SIRVE:
  ONNX Runtime Web usa SharedArrayBuffer para operaciones SIMD multi-thread.
  SharedArrayBuffer requiere que el servidor envíe estos headers de seguridad:
    Cross-Origin-Embedder-Policy: require-corp
    Cross-Origin-Opener-Policy: same-origin

  Sin estos headers verás: "ReferenceError: SharedArrayBuffer is not defined"

USO:
  python3 serve_coop.py
  python3 serve_coop.py 8080
  python3 serve_coop.py 8080 ./public

LUEGO ABRIR:
  http://localhost:8080/piper/

PRODUCCIÓN (nginx):
  location /piper/ {
    add_header Cross-Origin-Embedder-Policy "require-corp";
    add_header Cross-Origin-Opener-Policy "same-origin";
    add_header Cross-Origin-Resource-Policy "cross-origin";
  }

PRODUCCIÓN (Caddy):
  header /piper/* {
    Cross-Origin-Embedder-Policy "require-corp"
    Cross-Origin-Opener-Policy "same-origin"
  }
"""

import http.server
import sys
import os
import mimetypes

# Registrar tipos MIME críticos para WebAssembly
mimetypes.add_type("application/wasm", ".wasm")
mimetypes.add_type("application/octet-stream", ".onnx")
mimetypes.add_type("application/json", ".json")


class CoopHandler(http.server.SimpleHTTPRequestHandler):
    """Handler HTTP que agrega los headers requeridos para SharedArrayBuffer."""

    def end_headers(self):
        # Headers obligatorios para SharedArrayBuffer / ONNX Runtime SIMD
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        self.send_header("Cross-Origin-Opener-Policy",   "same-origin")
        self.send_header("Cross-Origin-Resource-Policy", "cross-origin")
        # Evitar caché agresivo en desarrollo
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        print(f"[HTTP] {self.address_string()} → {fmt % args}")

    def guess_type(self, path):
        """Forzar Content-Type correcto para archivos .wasm y .onnx."""
        if path.endswith(".wasm"):
            return "application/wasm"
        if path.endswith(".onnx"):
            return "application/octet-stream"
        return super().guess_type(path)


def main():
    port      = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    directory = sys.argv[2] if len(sys.argv) > 2 else "./public"

    # Resolver ruta absoluta
    directory = os.path.abspath(directory)

    if not os.path.isdir(directory):
        print(f"ERROR: El directorio no existe: {directory}")
        print(f"Uso: python3 serve_coop.py [puerto] [directorio]")
        print(f"Ejemplo: python3 serve_coop.py 8080 ./public")
        sys.exit(1)

    os.chdir(directory)

    handler = CoopHandler
    with http.server.HTTPServer(("", port), handler) as httpd:
        print(f"")
        print(f"  🔊 Piper TTS — Servidor local")
        print(f"  ─────────────────────────────────────────")
        print(f"  URL:        http://localhost:{port}/piper/")
        print(f"  Directorio: {directory}")
        print(f"  COOP/COEP:  ✓ Activos (SharedArrayBuffer habilitado)")
        print(f"  ─────────────────────────────────────────")
        print(f"  Ctrl+C para detener")
        print(f"")

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n  Servidor detenido.")


if __name__ == "__main__":
    main()
