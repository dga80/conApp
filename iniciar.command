#!/bin/bash

# Directorio del proyecto
cd "/Users/danidev/Desktop/contApp"

echo "=================================================="
echo "    🏠 Iniciando HomeBudget 2026 (Stitch UI)      "
echo "=================================================="
echo ""

# Limpiar cache de webpack si hubo cambios de compilación
rm -rf .next 2>/dev/null

LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")

echo "💻 Acceso Local en tu Mac:     http://localhost:3000"
if [ "$LOCAL_IP" != "localhost" ]; then
  echo "📱 Acceso Móvil (Misma Wi-Fi): http://$LOCAL_IP:3000"
fi
echo ""
echo "Iniciando servidor y abriendo navegador..."

# Abrir el navegador tras 3 segundos
(sleep 3 && open "http://localhost:3000") &

# Iniciar servidor de desarrollo
npm run dev
