import { VercelRequest, VercelResponse } from '@vercel/node';
import { BetfairClient } from '../../lib/betfair-client';
import { FootballService } from '../../lib/football-service';
import { getBetfairConfigFromHeaders } from '../../lib/config';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Accept,X-Betfair-Username,X-Betfair-Password,X-Betfair-App-Key,X-Betfair-Session-Token');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { eventId } = req.query;

    if (!eventId || typeof eventId !== 'string') {
      res.status(400).json({
        success: false,
        error: 'eventId is required',
      });
      return;
    }

    // Obtener configuración desde headers
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

    res.status(200).json({
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
}
