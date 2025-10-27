import { BetfairConfig } from '../types/betfair';

export function getBetfairConfigFromHeaders(headers: any): BetfairConfig {
  const appKey = headers['x-betfair-app-key'];
  const sessionToken = headers['x-betfair-session-token'];
  const username = headers['x-betfair-username'];
  const password = headers['x-betfair-password'];

  if (!appKey) {
    throw new Error('Missing required header: X-Betfair-App-Key');
  }

  // Si se proporciona session token, usarlo directamente
  if (sessionToken) {
    return {
      appKey,
      sessionToken,
    };
  }

  // Si no hay session token, requerir username y password para login automático
  if (!username || !password) {
    throw new Error(
      'Missing required headers: Either provide X-Betfair-Session-Token OR both X-Betfair-Username and X-Betfair-Password'
    );
  }

  return {
    username,
    password,
    appKey,
  };
}
