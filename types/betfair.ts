export interface BetfairConfig {
  username?: string;
  password?: string;
  appKey: string;
  sessionToken?: string;
}

export interface LoginResponse {
  token: string;
  product: string;
  status: string;
  error?: string;
}

export interface MarketFilter {
  eventTypeIds?: string[];
  eventIds?: string[];
  marketTypeCodes?: string[];
  marketCountries?: string[];
  marketStartTime?: {
    from: string;
    to: string;
  };
  inPlayOnly?: boolean;
}

export interface Event {
  id: string;
  name: string;
  countryCode: string;
  timezone: string;
  openDate: string;
}

export interface Competition {
  id: string;
  name: string;
}

export interface MarketCatalogue {
  marketId: string;
  marketName: string;
  marketStartTime: string;
  totalMatched: number;
  runners: Runner[];
  event: Event;
  competition: Competition;
}

export interface Runner {
  selectionId: number;
  runnerName: string;
  handicap: number;
  sortPriority: number;
}

export interface PriceSize {
  price: number;
  size: number;
}

export interface ExchangePrices {
  availableToBack: PriceSize[];
  availableToLay: PriceSize[];
}

export interface RunnerBook {
  selectionId: number;
  status: string;
  ex: ExchangePrices;
  lastPriceTraded?: number;
}

export interface MarketBook {
  marketId: string;
  status: string;
  totalMatched: number;
  runners: RunnerBook[];
}

export interface FootballMatch {
  eventId: string;
  eventName: string;
  competition: string;
  country: string;
  startTime: string;
  markets: FootballMarket[];
}

export interface FootballMarket {
  marketId: string;
  marketName: string;
  totalMatched: number;
  runners: FootballRunner[];
}

export interface FootballRunner {
  selectionId: number;
  runnerName: string;
  backPrices: PriceSize[];
  layPrices: PriceSize[];
  lastPriceTraded?: number;
  status: string;
}
