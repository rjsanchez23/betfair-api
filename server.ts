import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { BetfairClient } from './lib/betfair-client';
import { FootballService } from './lib/football-service';
import { getBetfairConfigFromHeaders } from './lib/config';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'Betfair Exchange API Wrapper',
    version: '1.0.0',
    endpoints: {
      '/api/matches': 'GET - Obtener partidos próximos (query params: hours, inPlay)',
      '/api/matches/[eventId]': 'GET - Obtener detalles de un partido específico',
      '/api/matches/live': 'GET - Obtener partidos en vivo',
      '/api/health': 'GET - Verificar estado de la API',
    },
    documentation: 'Ver README.md y POSTMAN_EXAMPLES.md',
  });
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Betfair Exchange API Wrapper',
    version: '1.0.0',
  });
});

// Get matches
app.get('/api/matches', async (req: Request, res: Response) => {
  try {
    const config = getBetfairConfigFromHeaders(req.headers);
    const client = new BetfairClient(config);
    const footballService = new FootballService(client);

    const { hours = '24', inPlay = 'false' } = req.query;

    const hoursNumber = parseInt(hours as string, 10);
    const isInPlay = inPlay === 'true';

    let matches;
    if (isInPlay) {
      matches = await footballService.getInPlayMatches();
    } else {
      matches = await footballService.getUpcomingMatches(hoursNumber);
    }

    res.json({
      success: true,
      count: matches.length,
      filters: {
        hours: hoursNumber,
        inPlay: isInPlay,
      },
      data: matches,
    });
  } catch (error) {
    console.error('Error fetching matches:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      success: false,
      error: 'Failed to fetch matches from Betfair',
      message: errorMessage,
    });
  }
});

// Get live matches
app.get('/api/matches/live', async (req: Request, res: Response) => {
  try {
    const config = getBetfairConfigFromHeaders(req.headers);
    const client = new BetfairClient(config);
    const footballService = new FootballService(client);

    const matches = await footballService.getInPlayMatches();

    res.json({
      success: true,
      count: matches.length,
      data: matches,
    });
  } catch (error) {
    console.error('Error fetching live matches:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      success: false,
      error: 'Failed to fetch live matches from Betfair',
      message: errorMessage,
    });
  }
});

// Get match details by eventId
app.get('/api/matches/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      res.status(400).json({
        success: false,
        error: 'eventId is required',
      });
      return;
    }

    const config = getBetfairConfigFromHeaders(req.headers);
    const client = new BetfairClient(config);
    const footballService = new FootballService(client);

    const match = await footballService.getMatchDetails(eventId);

    if (!match) {
      res.status(404).json({
        success: false,
        error: 'Match not found',
      });
      return;
    }

    res.json({
      success: true,
      data: match,
    });
  } catch (error) {
    console.error('Error fetching match details:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      success: false,
      error: 'Failed to fetch match details from Betfair',
      message: errorMessage,
    });
  }
});

// Start server - Listen on all network interfaces (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://192.168.1.167:${PORT}`);
  console.log(``);
  console.log(`📖 API documentation: http://192.168.1.167:${PORT}/api`);
  console.log(`💚 Health check: http://192.168.1.167:${PORT}/api/health`);
  console.log(``);
  console.log(`🌐 Accesible desde cualquier equipo en tu red local`);
});
