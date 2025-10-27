# Betfair Exchange API Wrapper

API wrapper para Betfair Exchange que devuelve partidos de fútbol con todas sus cuotas lay y back. Diseñada para desplegarse en Vercel usando serverless functions.

## Características

- Obtener partidos de fútbol próximos con cuotas lay y back
- Consultar partidos en vivo
- Obtener detalles específicos de un partido
- Sin almacenamiento de credenciales sensibles (se envían por headers)
- Compatible con cuentas gratuitas de Betfair
- CORS habilitado para uso desde frontend

## Requisitos

- Cuenta de Betfair Exchange
- Application Key de Betfair (obtener en https://www.betfair.com/exchange/plus/en/api-software)
- Cuenta de Vercel (gratuita)

## Estructura del Proyecto

```
betfair-exchange/
├── api/                    # Serverless functions de Vercel
│   ├── index.ts           # Endpoint raíz con información de la API
│   ├── health.ts          # Health check
│   ├── matches.ts         # Lista de partidos
│   └── matches/
│       ├── [eventId].ts   # Detalles de un partido específico
│       └── live.ts        # Partidos en vivo
├── lib/                   # Lógica de negocio
│   ├── betfair-client.ts  # Cliente de Betfair API
│   ├── football-service.ts # Servicio de fútbol
│   └── config.ts          # Configuración
├── types/                 # Definiciones de TypeScript
│   └── betfair.ts
├── package.json
├── tsconfig.json
└── vercel.json           # Configuración de Vercel
```

## Instalación Local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo local
npm run dev
```

## Deploy en Vercel

### Opción 1: Desde GitHub

1. Sube tu código a un repositorio de GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa tu repositorio
4. Vercel detectará automáticamente la configuración
5. Haz click en "Deploy"

### Opción 2: Desde CLI

```bash
# Instalar Vercel CLI
npm install -g vercel

# Iniciar sesión
vercel login

# Deploy
vercel
```

## Uso de la API

### Autenticación

Todas las peticiones (excepto `/api/health` y `/api`) requieren autenticación. Tienes **dos opciones**:

#### Opción 1: Con Session Token (recomendado para pruebas rápidas)
```http
X-Betfair-App-Key: tu_app_key
X-Betfair-Session-Token: tu_session_token
```

Para obtener el session token:
1. Ve a https://www.betfair.com/exchange
2. Inicia sesión
3. Abre DevTools (F12) > Application > Cookies
4. Busca la cookie `ssoid` - ese es tu session token

**Nota**: El token expira después de 8-20 horas.

#### Opción 2: Con usuario y contraseña (recomendado para producción)
```http
X-Betfair-App-Key: tu_app_key
X-Betfair-Username: tu_usuario
X-Betfair-Password: tu_contraseña
```

La API se autenticará automáticamente y renovará el token cuando sea necesario.

### Endpoints

#### 1. Información de la API
```http
GET /api
```

Respuesta:
```json
{
  "message": "Betfair Exchange API Wrapper",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

#### 2. Health Check
```http
GET /api/health
```

Respuesta:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "Betfair Exchange API Wrapper",
  "version": "1.0.0"
}
```

#### 3. Obtener Partidos
```http
GET /api/matches?hours=24&inPlay=false
```

Parámetros de query:
- `hours` (opcional, default: 24): Próximas horas a buscar
- `inPlay` (opcional, default: false): Solo partidos en vivo

Respuesta:
```json
{
  "success": true,
  "count": 10,
  "filters": {
    "hours": 24,
    "inPlay": false
  },
  "data": [
    {
      "eventId": "12345678",
      "eventName": "Real Madrid vs Barcelona",
      "competition": "La Liga",
      "country": "ES",
      "startTime": "2024-01-01T20:00:00.000Z",
      "markets": [
        {
          "marketId": "1.123456",
          "marketName": "Match Odds",
          "totalMatched": 150000.50,
          "runners": [
            {
              "selectionId": 123456,
              "runnerName": "Real Madrid",
              "backPrices": [
                { "price": 2.5, "size": 1000 },
                { "price": 2.48, "size": 500 }
              ],
              "layPrices": [
                { "price": 2.52, "size": 800 },
                { "price": 2.54, "size": 600 }
              ],
              "lastPriceTraded": 2.5,
              "status": "ACTIVE"
            }
          ]
        }
      ]
    }
  ]
}
```

#### 4. Obtener Partidos en Vivo
```http
GET /api/matches/live
```

Respuesta: Similar a `/api/matches` pero solo con partidos que están en juego actualmente.

#### 5. Obtener Detalles de un Partido
```http
GET /api/matches/{eventId}
```

Ejemplo:
```http
GET /api/matches/12345678
```

Respuesta:
```json
{
  "success": true,
  "data": {
    "eventId": "12345678",
    "eventName": "Real Madrid vs Barcelona",
    "competition": "La Liga",
    "country": "ES",
    "startTime": "2024-01-01T20:00:00.000Z",
    "markets": [ ... ]
  }
}
```

## Ejemplo de Uso con cURL

### Con Session Token
```bash
# Obtener partidos de las próximas 12 horas
curl -X GET "http://localhost:3000/api/matches?hours=12" \
  -H "X-Betfair-App-Key: tu_app_key" \
  -H "X-Betfair-Session-Token: tu_session_token"

# Obtener partidos en vivo
curl -X GET "http://localhost:3000/api/matches/live" \
  -H "X-Betfair-App-Key: tu_app_key" \
  -H "X-Betfair-Session-Token: tu_session_token"
```

### Con Usuario y Contraseña
```bash
# Obtener partidos de las próximas 12 horas
curl -X GET "http://localhost:3000/api/matches?hours=12" \
  -H "X-Betfair-App-Key: tu_app_key" \
  -H "X-Betfair-Username: tu_usuario" \
  -H "X-Betfair-Password: tu_contraseña"
```

**Ver más ejemplos en [POSTMAN_EXAMPLES.md](POSTMAN_EXAMPLES.md)**

## Ejemplo de Uso con JavaScript

```javascript
const fetchMatches = async () => {
  const response = await fetch('https://tu-app.vercel.app/api/matches?hours=24', {
    method: 'GET',
    headers: {
      'X-Betfair-Username': 'tu_usuario',
      'X-Betfair-Password': 'tu_contraseña',
      'X-Betfair-App-Key': 'tu_app_key'
    }
  });

  const data = await response.json();
  console.log(data);
};

fetchMatches();
```

## Tipos de Cuotas

### Back (Apostar a favor)
Las cuotas `backPrices` representan las mejores ofertas disponibles para apostar a que algo suceda.

### Lay (Apostar en contra)
Las cuotas `layPrices` representan las mejores ofertas disponibles para apostar a que algo NO suceda.

Cada precio incluye:
- `price`: Cuota decimal (ej: 2.5 significa ganar 2.5x tu apuesta)
- `size`: Cantidad disponible en esa cuota (en la moneda de tu cuenta)

## Limitaciones de la Cuenta Gratuita

Las cuentas gratuitas de Betfair tienen algunas limitaciones:
- Límite de peticiones por minuto (aprox. 1000/hora)
- No acceso a streaming de datos en tiempo real
- Algunos mercados pueden no estar disponibles

## Manejo de Errores

La API devuelve códigos HTTP estándar:

- `200`: Éxito
- `400`: Petición incorrecta (parámetros inválidos)
- `401`: No autorizado (credenciales incorrectas)
- `404`: Recurso no encontrado
- `405`: Método no permitido
- `500`: Error del servidor

Ejemplo de respuesta de error:
```json
{
  "success": false,
  "error": "Failed to fetch matches from Betfair",
  "message": "Login failed: INVALID_USERNAME_OR_PASSWORD"
}
```

## Seguridad

- Las credenciales NO se almacenan en el servidor
- Se envían por headers en cada petición
- Usa HTTPS siempre en producción
- No compartas tus credenciales de Betfair
- Considera implementar rate limiting en producción

## Mejoras Futuras

- [ ] Sistema de caché para reducir llamadas a Betfair
- [ ] Autenticación con API keys propias
- [ ] Webhook para cambios de cuotas en tiempo real
- [ ] Soporte para más tipos de mercado
- [ ] Filtros por competición y país
- [ ] Rate limiting

## Recursos

- [Documentación de Betfair API](https://docs.developer.betfair.com/)
- [Guía de Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Obtener Application Key de Betfair](https://www.betfair.com/exchange/plus/en/api-software)

## Licencia

MIT

## Soporte

Para problemas o preguntas, abre un issue en el repositorio de GitHub.
