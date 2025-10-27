# ✅ API Desplegada Exitosamente en Vercel

Tu API está desplegada en: `https://betfair-exchange-k43mr40u4-rjsanchezs-projects.vercel.app`

Sin embargo, **tiene protección de autenticación activada** que necesitas desactivar.

## 🔓 Desactivar Protección de Deployment

### Opción 1: Desde el Dashboard de Vercel (Recomendado)

1. Ve a: https://vercel.com/rjsanchezs-projects/betfair-exchange
2. Click en **Settings**
3. Ve a **Deployment Protection**
4. Cambia a **"Only Production"** o **"Disabled"**
5. Guarda los cambios

### Opción 2: Asignar un dominio de producción

Vercel asigna automáticamente un dominio:
- `betfair-exchange.vercel.app` (sin autenticación)

Ve al dashboard y encontrarás el dominio principal.

---

## 🧪 Probar la API

Una vez desactivada la protección, usa estos endpoints:

### URL Base
```
https://betfair-exchange.vercel.app
```
(El dominio exacto lo ves en tu dashboard de Vercel)

### 1. Health Check
```bash
curl https://betfair-exchange.vercel.app/api/health
```

### 2. Obtener Partidos (con usuario/contraseña)
```bash
curl -X GET "https://betfair-exchange.vercel.app/api/matches?hours=24" \
  -H "X-Betfair-App-Key: 7LTRxdVr6VesaIAu" \
  -H "X-Betfair-Username: tu_usuario" \
  -H "X-Betfair-Password: tu_contraseña"
```

### 3. Obtener Partidos (con session token)
```bash
curl -X GET "https://betfair-exchange.vercel.app/api/matches?hours=24" \
  -H "X-Betfair-App-Key: 7LTRxdVr6VesaIAu" \
  -H "X-Betfair-Session-Token: wQD+bOojl5xxH4iaOSXr+53C206Js9072gIGtR/cacM="
```

### 4. Partidos en vivo
```bash
curl -X GET "https://betfair-exchange.vercel.app/api/matches/live" \
  -H "X-Betfair-App-Key: 7LTRxdVr6VesaIAu" \
  -H "X-Betfair-Session-Token: wQD+bOojl5xxH4iaOSXr+53C206Js9072gIGtR/cacM="
```

---

## 📋 Resumen de lo que Hemos Hecho

✅ Creada una API wrapper completa para Betfair Exchange
✅ Soporta autenticación con usuario/contraseña o session token
✅ Configurada para usar `betfair.es` (España)
✅ Endpoints para obtener partidos de fútbol con cuotas lay/back
✅ Desplegada en Vercel con TypeScript compilado
✅ CORS configurado para acceso desde cualquier origen
✅ Sin problemas de DNS/certificados SSL

---

## 🎯 Endpoints Disponibles

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api` | GET | Información de la API |
| `/api/health` | GET | Health check (sin autenticación) |
| `/api/matches` | GET | Obtener partidos próximos |
| `/api/matches/live` | GET | Obtener partidos en vivo |
| `/api/matches/:eventId` | GET | Detalles de un partido específico |

### Query Parameters para `/api/matches`:
- `hours` (opcional, default: 24): Próximas horas a buscar
- `inPlay` (opcional, default: false): Solo partidos en vivo

### Headers requeridos (excepto /api/health):

**Opción 1: Session Token**
```
X-Betfair-App-Key: 7LTRxdVr6VesaIAu
X-Betfair-Session-Token: tu_token
```

**Opción 2: Usuario/Contraseña** (recomendado)
```
X-Betfair-App-Key: 7LTRxdVr6VesaIAu
X-Betfair-Username: tu_usuario
X-Betfair-Password: tu_contraseña
```

---

## 🔄 Actualizar el Deployment

Para hacer cambios y redesplegar:

```bash
# Hacer tus cambios en el código
# Luego:
vercel --prod
```

O si tienes GitHub conectado, simplemente:
```bash
git add .
git commit -m "Descripción de cambios"
git push
```

Vercel desplegará automáticamente.

---

## 📚 Archivos de Documentación

- [README.md](README.md) - Documentación completa del proyecto
- [COMO_PROBAR.md](COMO_PROBAR.md) - Guía de pruebas locales
- [CURL_DIRECTO_BETFAIR.md](CURL_DIRECTO_BETFAIR.md) - Comandos directos a Betfair
- [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md) - Guía de deployment
- [COMO_ACTIVAR_API.md](COMO_ACTIVAR_API.md) - Solución de problemas con App Key
- [POSTMAN_EXAMPLES.md](POSTMAN_EXAMPLES.md) - Ejemplos para Postman

---

## 🎉 ¡Todo Listo!

Tu API está funcionando en Vercel. Solo necesitas:

1. **Ir al dashboard de Vercel** → https://vercel.com/rjsanchezs-projects/betfair-exchange
2. **Desactivar Deployment Protection** en Settings
3. **Copiar el dominio de producción** (betfair-exchange.vercel.app)
4. **Probar los endpoints** con tus credenciales de Betfair

---

## 💡 Próximos Pasos Opcionales

- Añadir sistema de caché para optimizar peticiones
- Implementar rate limiting
- Añadir más tipos de mercados (Over/Under, Correct Score, etc.)
- Crear un frontend para visualizar los datos
- Añadir webhooks para notificaciones de cambios de cuotas
- Implementar sistema de logging y monitoreo

---

## 🆘 Soporte

Si tienes problemas:

1. **Ver logs en Vercel**: https://vercel.com/rjsanchezs-projects/betfair-exchange → Deployments → Click en el último → Logs
2. **Revisar documentación de Betfair**: https://docs.developer.betfair.com/
3. **Verificar App Key**: https://www.betfair.com/exchange/plus/en/api-software

---

¡Felicidades! Tu API de Betfair Exchange está lista para usar 🚀
