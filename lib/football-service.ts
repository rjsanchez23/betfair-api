import { BetfairClient } from './betfair-client';
import { FootballMatch, FootballMarket, FootballRunner, MarketCatalogue, MarketBook } from '../types/betfair';

export class FootballService {
  private client: BetfairClient;

  // ID de evento para fútbol en Betfair
  private readonly FOOTBALL_EVENT_TYPE_ID = '1';

  // Tipos de mercado más comunes
  private readonly MARKET_TYPES = {
    MATCH_ODDS: 'MATCH_ODDS', // 1X2
    OVER_UNDER: 'OVER_UNDER_25', // Más/Menos goles
    BOTH_TEAMS_TO_SCORE: 'BOTH_TEAMS_TO_SCORE',
    CORRECT_SCORE: 'CORRECT_SCORE',
  };

  constructor(client: BetfairClient) {
    this.client = client;
  }

  async getFootballMatches(
    hours: number = 24,
    marketTypes: string[] = ['MATCH_ODDS'],
    inPlayOnly: boolean = false
  ): Promise<FootballMatch[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + hours * 60 * 60 * 1000);

    const filter = {
      eventTypeIds: [this.FOOTBALL_EVENT_TYPE_ID],
      marketTypeCodes: marketTypes,
      marketStartTime: {
        from: now.toISOString(),
        to: futureDate.toISOString(),
      },
      inPlayOnly,
    };

    // Obtener catálogo de mercados
    const marketCatalogues = await this.client.listMarketCatalogue(filter, 200, [
      'COMPETITION',
      'EVENT',
      'RUNNER_DESCRIPTION',
      'MARKET_START_TIME',
    ]);

    if (marketCatalogues.length === 0) {
      return [];
    }

    // Obtener precios para todos los mercados
    const marketIds = marketCatalogues.map((m) => m.marketId);
    const marketBooks = await this.client.listMarketBook(marketIds);

    // Agrupar por evento
    return this.groupByEvent(marketCatalogues, marketBooks);
  }

  private groupByEvent(catalogues: MarketCatalogue[], books: MarketBook[]): FootballMatch[] {
    const eventMap = new Map<string, FootballMatch>();

    catalogues.forEach((catalogue) => {
      const eventId = catalogue.event.id;
      const marketBook = books.find((b) => b.marketId === catalogue.marketId);

      if (!marketBook) return;

      // Si el evento no existe, crearlo
      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, {
          eventId: catalogue.event.id,
          eventName: catalogue.event.name,
          competition: catalogue.competition?.name || 'Unknown',
          country: catalogue.event.countryCode || 'Unknown',
          startTime: catalogue.marketStartTime,
          markets: [],
        });
      }

      const match = eventMap.get(eventId)!;

      // Agregar mercado con sus runners y precios
      const runners: FootballRunner[] = catalogue.runners.map((runner) => {
        const runnerBook = marketBook.runners.find((r) => r.selectionId === runner.selectionId);

        return {
          selectionId: runner.selectionId,
          runnerName: runner.runnerName,
          backPrices: runnerBook?.ex?.availableToBack || [],
          layPrices: runnerBook?.ex?.availableToLay || [],
          lastPriceTraded: runnerBook?.lastPriceTraded,
          status: runnerBook?.status || 'UNKNOWN',
        };
      });

      match.markets.push({
        marketId: catalogue.marketId,
        marketName: catalogue.marketName,
        totalMatched: marketBook.totalMatched,
        runners,
      });
    });

    return Array.from(eventMap.values());
  }

  async getMatchDetails(eventId: string): Promise<FootballMatch | null> {
    const filter = {
      eventIds: [eventId],
    };

    const marketCatalogues = await this.client.listMarketCatalogue(filter, 50, [
      'COMPETITION',
      'EVENT',
      'RUNNER_DESCRIPTION',
      'MARKET_START_TIME',
    ]);

    if (marketCatalogues.length === 0) {
      return null;
    }

    const marketIds = marketCatalogues.map((m) => m.marketId);
    const marketBooks = await this.client.listMarketBook(marketIds);

    const matches = this.groupByEvent(marketCatalogues, marketBooks);
    return matches[0] || null;
  }

  async getInPlayMatches(): Promise<FootballMatch[]> {
    return this.getFootballMatches(0, ['MATCH_ODDS'], true);
  }

  async getUpcomingMatches(hours: number = 24): Promise<FootballMatch[]> {
    return this.getFootballMatches(hours, ['MATCH_ODDS'], false);
  }

  async getMatchOdds(eventId: string): Promise<FootballMarket | null> {
    const match = await this.getMatchDetails(eventId);
    if (!match) return null;

    const matchOddsMarket = match.markets.find((m) => m.marketName.includes('Match Odds'));
    return matchOddsMarket || null;
  }
}
