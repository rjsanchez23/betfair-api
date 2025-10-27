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
    // Obtener configuración desde headers
    const config = getBetfairConfigFromHeaders(req.headers);
    const client = new BetfairClient(config);
    const footballService = new FootballService(client);

    const matches = await footballService.getInPlayMatches();

    res.status(200).json({
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
}
