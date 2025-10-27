#!/bin/bash

# Script de despliegue para Raspberry Pi
# Uso: ./deploy.sh

set -e  # Salir si hay algún error

echo "🚀 Iniciando despliegue en Raspberry Pi..."

# Instalar todas las dependencias (incluyendo devDependencies para compilar)
echo "📦 Instalando dependencias..."
npm install

# Compilar TypeScript
echo "🔨 Compilando TypeScript..."
npm run build

# Limpiar devDependencies después de compilar (opcional, ahorra espacio)
echo "🧹 Limpiando dependencias de desarrollo..."
npm prune --production

# Verificar que el archivo .env existe
if [ ! -f .env ]; then
    echo "⚠️  ADVERTENCIA: No se encontró archivo .env"
    echo "   Crea un archivo .env con tus credenciales de Betfair"
    exit 1
fi

# Verificar que PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "📥 PM2 no está instalado. Instalando PM2 globalmente..."
    npm install -g pm2
fi

# Detener la aplicación anterior si existe
echo "🛑 Deteniendo aplicación anterior (si existe)..."
pm2 stop betfair-api 2>/dev/null || true
pm2 delete betfair-api 2>/dev/null || true

# Iniciar la aplicación con PM2
echo "▶️  Iniciando aplicación con PM2..."
pm2 start ecosystem.config.js

# Guardar la configuración de PM2
echo "💾 Guardando configuración de PM2..."
pm2 save

# Configurar PM2 para iniciar al arrancar el sistema
echo "🔄 Configurando inicio automático..."
pm2 startup

# Mostrar estado
echo "✅ Despliegue completado!"
echo ""
echo "📊 Estado de la aplicación:"
pm2 status

echo ""
echo "📝 Comandos útiles:"
echo "   pm2 logs betfair-api     - Ver logs"
echo "   pm2 restart betfair-api  - Reiniciar"
echo "   pm2 stop betfair-api     - Detener"
echo "   pm2 monit                - Monitor en tiempo real"
