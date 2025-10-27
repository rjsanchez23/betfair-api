# 🍓 Instalar API en Raspberry Pi

Esta guía te ayudará a montar la API de Betfair en tu Raspberry Pi en tu red local.

## ✅ Ventajas de usar Raspberry Pi

- ✅ **Sin bloqueos geográficos** - Tu IP residencial funciona perfectamente con Betfair
- ✅ **Control total** - Tu propia infraestructura
- ✅ **Siempre disponible** - 24/7 en tu red local
- ✅ **Bajo consumo** - ~5W de consumo eléctrico
- ✅ **Accesible desde toda tu red** - Otros dispositivos pueden usar la API

---

## 📋 Requisitos

- Raspberry Pi 3B+ o superior (recomendado: Pi 4 con 2GB+ RAM)
- Raspbian OS (Raspberry Pi OS) instalado
- Conexión SSH habilitada
- Node.js 18+ (lo instalaremos)

---

## 🚀 Instalación Paso a Paso

### 1. Conectarte a tu Raspberry Pi

Desde tu Mac:

```bash
# Encontrar la IP de tu Raspberry Pi
# (busca en tu router o usa: ping raspberrypi.local)

# Conectar por SSH
ssh pi@192.168.1.XXX
# Contraseña por defecto: raspberry (cámbiala después)
```

### 2. Actualizar el sistema

```bash
sudo apt update
sudo apt upgrade -y
```

### 3. Instalar Node.js (versión 20 LTS)

```bash
# Descargar e instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node --version  # Debería mostrar v20.x.x
npm --version   # Debería mostrar 10.x.x
```

### 4. Instalar PM2 (gestor de procesos)

```bash
sudo npm install -g pm2
```

### 5. Clonar el proyecto desde GitHub

**En tu Raspberry Pi (vía SSH)**:

```bash
# Opción A: Usar HTTPS (recomendado para empezar)
cd ~
git clone https://github.com/rjsanchez23/betfair-api.git betfair-api
cd betfair-api

# Instalar dependencias
npm install

# Compilar TypeScript
npm run build
```

**Opcional - Configurar SSH para GitHub** (para no tener que poner contraseña):

```bash
# Generar clave SSH en la Raspberry Pi
ssh-keygen -t ed25519 -C "tu_email@ejemplo.com"

# Ver la clave pública
cat ~/.ssh/id_ed25519.pub

# Copia esta clave y añádela en GitHub:
# https://github.com/settings/keys
# Luego podrás clonar con: git clone git@github.com:rjsanchez23/betfair-api.git
```

### 6. Configurar credenciales de Betfair

```bash
# Crear archivo .env con tus credenciales
nano .env
```

Añade tus credenciales:
```
BETFAIR_APP_KEY=tu_app_key
BETFAIR_USERNAME=tu_usuario
BETFAIR_PASSWORD=tu_contraseña
PORT=3000
```

Guarda con `Ctrl+X`, luego `Y`, luego `Enter`.

### 7. Desplegar la aplicación

```bash
# Dar permisos de ejecución al script de despliegue
chmod +x deploy.sh

# Ejecutar el script de despliegue
./deploy.sh
```

El script automáticamente:
- ✅ Instala dependencias
- ✅ Compila TypeScript
- ✅ Configura PM2
- ✅ Inicia la aplicación
- ✅ Configura inicio automático

**O manualmente**:

```bash
# Iniciar con PM2 usando el archivo de configuración
pm2 start ecosystem.config.js

# Configurar para que inicie al arrancar
pm2 startup
pm2 save

# Ver logs
pm2 logs betfair-api

# Ver estado
pm2 status
```

---

## 🌐 Acceder a la API

Una vez iniciada, la API estará disponible en:

```
http://IP_DE_TU_RASPBERRY:3001
```

Por ejemplo, si tu Raspberry Pi tiene IP `192.168.1.100`:

```bash
# Desde cualquier dispositivo en tu red
curl http://192.168.1.100:3001/api/health

# Con credenciales de Betfair
curl -X GET "http://192.168.1.100:3001/api/matches?hours=24" \
  -H "X-Betfair-App-Key: 7LTRxdVr6VesaIAu" \
  -H "X-Betfair-Username: tu_usuario" \
  -H "X-Betfair-Password: tu_contraseña"
```

---

## 🔧 Comandos Útiles de PM2

```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs betfair-api

# Reiniciar la app
pm2 restart betfair-api

# Detener la app
pm2 stop betfair-api

# Eliminar la app
pm2 delete betfair-api

# Ver uso de recursos
pm2 monit
```

---

## 🔄 Actualizar la API (usando Git)

Cuando hagas cambios en tu código:

### Desde tu Mac (subir cambios):

```bash
# En tu proyecto local
cd /Users/ricardo/Documents/vercel/betfair-exchange

# Hacer commit de tus cambios
git add .
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push origin main
```

### En tu Raspberry Pi (actualizar):

```bash
# Conectar por SSH
ssh pi@IP_DE_TU_PI

# Ir al directorio del proyecto
cd ~/betfair-api

# Descargar últimos cambios
git pull origin main

# Reinstalar dependencias (si cambiaron)
npm install

# Recompilar
npm run build

# Reiniciar con PM2
pm2 restart betfair-api

# Ver logs para verificar
pm2 logs betfair-api
```

**Script rápido de actualización** - Crear un archivo `update.sh`:

```bash
#!/bin/bash
cd ~/betfair-api
git pull origin main
npm install
npm run build
pm2 restart betfair-api
pm2 logs betfair-api
```

Luego solo ejecutar: `./update.sh`

---

## 🌍 Exponer la API a Internet (Opcional)

Si quieres acceder desde fuera de tu red local:

### Opción 1: Port Forwarding en tu Router

1. Accede a tu router (ej: 192.168.1.1)
2. Busca "Port Forwarding" o "NAT"
3. Añade una regla:
   - Puerto externo: 3001
   - Puerto interno: 3001
   - IP destino: IP de tu Raspberry Pi
   - Protocolo: TCP

### Opción 2: Cloudflare Tunnel (Recomendado - GRATIS)

```bash
# En la Raspberry Pi
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Autenticarte
cloudflared tunnel login

# Crear tunnel
cloudflared tunnel create betfair-api

# Configurar
nano ~/.cloudflared/config.yml
```

Añade:
```yaml
tunnel: <TUNNEL_ID>
credentials-file: /home/pi/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: betfair-api.tudominio.com
    service: http://localhost:3001
  - service: http_status:404
```

```bash
# Iniciar tunnel
cloudflared tunnel route dns betfair-api betfair-api.tudominio.com
cloudflared tunnel run betfair-api
```

---

## 🔐 Seguridad

### 1. Cambiar contraseña de Pi

```bash
passwd
```

### 2. Actualizar el sistema regularmente

```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Firewall (opcional)

```bash
sudo apt install ufw
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 3001/tcp # API
sudo ufw enable
```

---

## 📊 Monitoreo

### Ver uso de recursos

```bash
# CPU y RAM
htop

# Temperatura de la Raspberry Pi
vcgencmd measure_temp

# Espacio en disco
df -h
```

---

## 🐛 Troubleshooting

### La API no responde

```bash
pm2 logs betfair-api  # Ver errores
pm2 restart betfair-api
```

### Puerto 3001 ya en uso

```bash
sudo lsof -i :3001
sudo kill -9 <PID>
```

### No puedo acceder desde otros dispositivos

```bash
# Verificar que el servidor escucha en 0.0.0.0
netstat -tulpn | grep 3001

# Si no, edita server.ts para usar '0.0.0.0'
# Ya está configurado correctamente en tu código
```

### Error de memoria en Raspberry Pi 1GB

Si tienes una Pi con poca RAM:

```bash
# Editar ecosystem de PM2
pm2 start dist/server.js --name betfair-api --max-memory-restart 200M
```

---

## 🎯 Resumen Rápido

```bash
# 1. SSH a tu Pi
ssh pi@IP_DE_TU_PI

# 2. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Instalar PM2
sudo npm install -g pm2

# 4. Recibir el proyecto (ya lo transferiste)
cd ~/betfair-api
npm install
npm run build

# 5. Iniciar
pm2 start dist/server.js --name betfair-api
pm2 startup
pm2 save

# 6. Verificar
curl http://localhost:3001/api/health
```

---

## 💡 Ventajas de esta Solución

✅ Sin costos mensuales (solo electricidad ~€3/año)
✅ Sin límites de peticiones
✅ IP residencial - Betfair no lo bloqueará
✅ Acceso desde toda tu red local
✅ Control total del servidor
✅ Perfecto para desarrollo y producción personal

---

¡Tu API estará disponible 24/7 en tu red local sin problemas de bloqueos! 🚀
