#!/bin/bash

# Script de actualización para Raspberry Pi
# Uso: ./update.sh

set -e  # Salir si hay algún error

echo "🔄 Actualizando aplicación..."

# Ir al directorio del proyecto
cd ~/betfair-api

# Guardar cambios locales si los hay (stash)
echo "💾 Guardando cambios locales (si los hay)..."
git stash

# Descargar últimos cambios
echo "⬇️  Descargando últimos cambios desde GitHub..."
git pull origin main

# Restaurar cambios locales si los había
git stash pop 2>/dev/null || true

# Reinstalar dependencias
echo "📦 Instalando/actualizando dependencias..."
npm install

# Recompilar TypeScript
echo "🔨 Recompilando TypeScript..."
npm run build

# Reiniciar aplicación con PM2
echo "🔄 Reiniciando aplicación..."
pm2 restart betfair-api

# Mostrar logs
echo "✅ Actualización completada!"
echo ""
echo "📊 Estado actual:"
pm2 status

echo ""
echo "📝 Últimos logs:"
pm2 logs betfair-api --lines 20 --nostream
