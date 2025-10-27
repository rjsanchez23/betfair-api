import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    message: 'Betfair Exchange API Wrapper',
    version: '1.0.0',
    endpoints: {
      '/api/matches': 'GET - Obtener partidos próximos (query params: hours, inPlay)',
      '/api/matches/[eventId]': 'GET - Obtener detalles de un partido específico',
      '/api/matches/live': 'GET - Obtener partidos en vivo',
      '/api/health': 'GET - Verificar estado de la API',
    },
    documentation: 'https://github.com/tu-usuario/betfair-exchange-api',
  });
}
