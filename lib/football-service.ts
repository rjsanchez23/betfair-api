import { BetfairClient } from './betfair-client';
import { FootballMatch, FootballMarket, FootballRunner, MarketCatalogue, MarketBook } from '../types/betfair';

// Estructura simplificada para las cuotas
export interface SimplifiedOdds {
  eventId: string;
  eventName: string;
  competition: string;
  country: string;
  startTime: string;
  match_odds?: {
    home: { back: number; lay: number };
    draw: { back: number; lay: number };
    away: { back: number; lay: number };
  };
  over_under_05?: { over: { back: number; lay: number }; under: { back: number; lay: number } };
  over_under_15?: { over: { back: number; lay: number }; under: { back: number; lay: number } };
  over_under_25?: { over: { back: number; lay: number }; under: { back: number; lay: number } };
  over_under_35?: { over: { back: number; lay: number }; under: { back: number; lay: number } };
  over_under_45?: { over: { back: number; lay: number }; under: { back: number; lay: number } };
  over_under_55?: { over: { back: number; lay: number }; under: { back: number; lay: number } };
  over_under_65?: { over: { back: number; lay: number }; under: { back: number; lay: number } };
  over_under_75?: { over: { back: number; lay: number }; under: { back: number; lay: number } };
  over_under_85?: { over: { back: number; lay: number }; under: { back: number; lay: number } };
}

export class FootballService {
  private client: BetfairClient;

  // ID de evento para fútbol en Betfair
  private readonly FOOTBALL_EVENT_TYPE_ID = '1';

  // 5 grandes ligas europeas
  private readonly TOP_5_LEAGUES = [
    'Spanish La Liga',
    'English Premier League',
    'Italian Serie A',
    'German Bundesliga',
    'French Ligue 1'
  ];

  constructor(client: BetfairClient) {
    this.client = client;
  }

  /**
   * Filtrar solo partidos de las 5 grandes ligas
   */
  private filterTop5Leagues(matches: FootballMatch[]): FootballMatch[] {
    return matches.filter(match =>
      this.TOP_5_LEAGUES.some(league =>
        match.competition.toLowerCase().includes(league.toLowerCase())
      )
    );
  }

  /**
   * Convertir estructura compleja de Betfair a formato simplificado
   */
  private simplifyMatch(match: FootballMatch): SimplifiedOdds {
    const simplified: SimplifiedOdds = {
      eventId: match.eventId,
      eventName: match.eventName,
      competition: match.competition,
      country: match.country,
      startTime: match.startTime,
    };

    match.markets.forEach((market) => {
      const marketName = market.marketName.toLowerCase();

      // Match Odds (1X2)
      if (marketName.includes('match odds')) {
        const home = market.runners.find((r) => !r.runnerName.includes('Draw') && !r.runnerName.includes('The Draw'));
        const draw = market.runners.find((r) => r.runnerName.includes('Draw'));
        const away = market.runners.find((r) => !r.runnerName.includes('Draw') && r.selectionId !== home?.selectionId);

        if (home && draw && away) {
          simplified.match_odds = {
            home: {
              back: home.backPrices[0]?.price || 0,
              lay: home.layPrices[0]?.price || 0,
            },
            draw: {
              back: draw.backPrices[0]?.price || 0,
              lay: draw.layPrices[0]?.price || 0,
            },
            away: {
              back: away.backPrices[0]?.price || 0,
              lay: away.layPrices[0]?.price || 0,
            },
          };
        }
      }

      // Over/Under Goals
      const ouMatch = marketName.match(/over\/under (\d+\.5) goals?/);
      if (ouMatch) {
        const goals = ouMatch[1].replace('.', '');
        const over = market.runners.find((r) => r.runnerName.toLowerCase().includes('over'));
        const under = market.runners.find((r) => r.runnerName.toLowerCase().includes('under'));

        if (over && under) {
          const key = `over_under_${goals}` as keyof SimplifiedOdds;
          (simplified as any)[key] = {
            over: {
              back: over.backPrices[0]?.price || 0,
              lay: over.layPrices[0]?.price || 0,
            },
            under: {
              back: under.backPrices[0]?.price || 0,
              lay: under.layPrices[0]?.price || 0,
            },
          };
        }
      }
    });

    return simplified;
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
    // Solo devolver información básica, sin cuotas detalladas
    const matches = await this.getFootballMatches(0, ['MATCH_ODDS'], true);
    return this.filterTop5Leagues(matches);
  }

  async getUpcomingMatches(hours: number = 24): Promise<FootballMatch[]> {
    // Solo devolver información básica, sin cuotas detalladas
    const matches = await this.getFootballMatches(hours, ['MATCH_ODDS'], false);
    return this.filterTop5Leagues(matches);
  }

  /**
   * Obtener todas las cuotas disponibles para un partido específico
   * Incluye Match Odds y todos los Over/Under
   */
  async getMatchWithAllMarkets(eventId: string): Promise<FootballMatch | null> {
    const filter = {
      eventIds: [eventId],
      marketTypeCodes: [
        'MATCH_ODDS',
        'OVER_UNDER_05',
        'OVER_UNDER_15',
        'OVER_UNDER_25',
        'OVER_UNDER_35',
        'OVER_UNDER_45',
        'OVER_UNDER_55',
        'OVER_UNDER_65',
        'OVER_UNDER_75',
        'OVER_UNDER_85'
      ]
    };

    const marketCatalogues = await this.client.listMarketCatalogue(filter, 100, [
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

  /**
   * Obtener cuotas simplificadas para un partido específico
   * Devuelve formato flat: over_under_25: { over: {back, lay}, under: {back, lay} }
   */
  async getMatchOddsSimplified(eventId: string): Promise<SimplifiedOdds | null> {
    const match = await this.getMatchWithAllMarkets(eventId);
    if (!match) return null;

    return this.simplifyMatch(match);
  }

  async getMatchOdds(eventId: string): Promise<FootballMarket | null> {
    const match = await this.getMatchDetails(eventId);
    if (!match) return null;

    const matchOddsMarket = match.markets.find((m) => m.marketName.includes('Match Odds'));
    return matchOddsMarket || null;
  }
}
