# 🚀 Desplegar en Fly.io - Región Madrid

Todo está configurado. Solo necesitas ejecutar estos comandos:

## Paso 1: Añadir flyctl al PATH

```bash
export FLYCTL_INSTALL="/Users/ricardo/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"
```

O añade estas líneas a tu `~/.zshrc`:
```bash
echo 'export FLYCTL_INSTALL="/Users/ricardo/.fly"' >> ~/.zshrc
echo 'export PATH="$FLYCTL_INSTALL/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## Paso 2: Autenticarte en Fly.io

```bash
flyctl auth login
```

Esto abrirá tu navegador para que inicies sesión (puedes usar GitHub, Google, o email).

## Paso 3: Lanzar la aplicación

```bash
cd /Users/ricardo/Documents/vercel/betfair-exchange
flyctl launch --no-deploy
```

Te hará algunas preguntas:
- **App name**: `betfair-exchange-api` (o presiona Enter para usar el sugerido)
- **Choose a region**: Selecciona `mad` (Madrid, España) ✅
- **Would you like to set up a PostgreSQL database?**: `No`
- **Would you like to set up an Upstash Redis database?**: `No`
- **Create .dockerignore?**: `No` (ya lo tenemos)

## Paso 4: Desplegar

```bash
flyctl deploy
```

Esto:
1. Construirá tu Docker image
2. Lo desplegará en Madrid
3. Te dará una URL como: `https://betfair-exchange-api.fly.dev`

## Paso 5: Probar

Una vez desplegado:

```bash
# Health check
curl https://betfair-exchange-api.fly.dev/api/health

# Con tus credenciales
curl -X GET "https://betfair-exchange-api.fly.dev/api/matches?hours=24" \
  -H "X-Betfair-App-Key: 7LTRxdVr6VesaIAu" \
  -H "X-Betfair-Username: tu_usuario" \
  -H "X-Betfair-Password: tu_contraseña"
```

---

## 📊 Comandos Útiles de Fly.io

```bash
# Ver estado de la app
flyctl status

# Ver logs en tiempo real
flyctl logs

# Abrir dashboard
flyctl dashboard

# Ver información de la app
flyctl info

# Escalar (cambiar recursos)
flyctl scale memory 512  # Aumentar a 512MB si es necesario

# SSH a la máquina
flyctl ssh console
```

---

## 💰 Costos

Fly.io tiene un **plan gratuito** que incluye:
- ✅ 3 máquinas shared-cpu-1x con 256MB RAM
- ✅ 160GB de transferencia de datos/mes
- ✅ Suficiente para tu API

Tu aplicación está configurada para usar:
- 256MB RAM
- 1 CPU compartida
- 1 máquina mínima corriendo

Esto entra perfectamente en el plan gratuito.

---

## 🔧 Si Necesitas Hacer Cambios

1. Modifica tu código
2. Ejecuta: `flyctl deploy`
3. Fly.io desplegará automáticamente

---

## 🌍 Regiones Disponibles

Si Madrid no funciona, puedes probar:
- `lhr` - London, Reino Unido
- `ams` - Amsterdam, Países Bajos
- `fra` - Frankfurt, Alemania
- `cdg` - París, Francia

Para cambiar región:
```bash
flyctl regions set mad
```

---

## ✅ Ventajas de Fly.io para Betfair

1. **IP menos detectada** que AWS/Vercel
2. **Región en España** (Madrid)
3. **Baja latencia** para tus usuarios europeos
4. **Plan gratuito generoso**
5. **Fácil de escalar** si crece tu proyecto

---

## 🎯 Resumen de Comandos Rápidos

```bash
# 1. Configurar PATH
export PATH="/Users/ricardo/.fly/bin:$PATH"

# 2. Login
flyctl auth login

# 3. Launch (sin deploy aún)
flyctl launch --no-deploy

# 4. Deploy
flyctl deploy

# 5. Probar
curl https://betfair-exchange-api.fly.dev/api/health
```

---

¡Ejecuta estos comandos y tu API estará corriendo desde Madrid! 🇪🇸🚀
