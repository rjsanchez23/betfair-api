import axios, { AxiosInstance } from 'axios';
import https from 'https';
import { BetfairConfig, LoginResponse, MarketFilter, MarketCatalogue, MarketBook } from '../types/betfair';

export class BetfairClient {
  // Usar siempre el dominio español (identitysso.betfair.es)
  private readonly baseUrl = 'https://identitysso.betfair.es/api';
  private readonly apiUrl = 'https://api.betfair.com/exchange/betting/json-rpc/v1';
  private readonly config: BetfairConfig;
  private sessionToken: string | null = null;
  private axiosInstance: AxiosInstance;

  constructor(config: BetfairConfig) {
    this.config = config;
    // Si se proporciona un session token directamente, usarlo
    if (config.sessionToken) {
      this.sessionToken = config.sessionToken;
    }
    // Configuración HTTPS para resolver problemas de certificados
    // En desarrollo local, deshabilitar verificación SSL si está configurado
    const httpsAgent = new https.Agent({
      rejectUnauthorized: process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0',
      keepAlive: true,
    });

    this.axiosInstance = axios.create({
      timeout: 60000, // 60 segundos para Raspberry Pi
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      httpsAgent,
    });
  }

  async login(): Promise<string> {
    try {
      console.log(`[Betfair] Intentando login en ${this.baseUrl}...`);

      const response = await this.axiosInstance.post<LoginResponse>(
        `${this.baseUrl}/login`,
        new URLSearchParams({
          username: this.config.username!,
          password: this.config.password!,
        }).toString(),
        {
          headers: {
            'X-Application': this.config.appKey,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (response.data.status === 'SUCCESS' && response.data.token) {
        this.sessionToken = response.data.token;
        console.log('[Betfair] Login exitoso');
        return this.sessionToken;
      }

      throw new Error(`Login failed: ${response.data.status} - ${response.data.error || 'Unknown error'}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        const statusCode = error.response?.status;
        const errorDetail = responseData ? JSON.stringify(responseData) : error.message;
        console.error(`[Betfair] Login error: ${errorDetail}`);

        // Si es timeout, dar más información
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          throw new Error(`Timeout al conectar con Betfair. Verifica tu conexión a internet o prueba con NODE_TLS_REJECT_UNAUTHORIZED=0`);
        }

        throw new Error(`Betfair login error (${statusCode}): ${errorDetail}`);
      }
      throw error;
    }
  }

  async ensureLoggedIn(): Promise<void> {
    if (!this.sessionToken) {
      await this.login();
    }
  }

  private async makeApiCall<T>(method: string, params: any): Promise<T> {
    await this.ensureLoggedIn();

    try {
      const response = await this.axiosInstance.post(
        this.apiUrl,
        {
          jsonrpc: '2.0',
          method,
          params,
          id: 1,
        },
        {
          headers: {
            'X-Application': this.config.appKey,
            'X-Authentication': this.sessionToken!,
          },
        }
      );

      if (response.data.error) {
        throw new Error(`Betfair API error: ${JSON.stringify(response.data.error)}`);
      }

      return response.data.result;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        const statusCode = error.response?.status;
        const errorDetail = responseData ? JSON.stringify(responseData) : error.message;
        throw new Error(`Betfair API call error (${statusCode}): ${errorDetail}`);
      }
      throw error;
    }
  }

  async listMarketCatalogue(
    filter: MarketFilter,
    maxResults: number = 200,
    marketProjection: string[] = ['COMPETITION', 'EVENT', 'RUNNER_DESCRIPTION', 'MARKET_START_TIME']
  ): Promise<MarketCatalogue[]> {
    return this.makeApiCall<MarketCatalogue[]>('SportsAPING/v1.0/listMarketCatalogue', {
      filter,
      maxResults,
      marketProjection,
    });
  }

  async listMarketBook(
    marketIds: string[],
    priceProjection: any = {
      priceData: ['EX_BEST_OFFERS'],
      exBestOffersOverrides: {
        bestPricesDepth: 3,
      },
    }
  ): Promise<MarketBook[]> {
    return this.makeApiCall<MarketBook[]>('SportsAPING/v1.0/listMarketBook', {
      marketIds,
      priceProjection,
    });
  }

  async keepAlive(): Promise<any> {
    await this.ensureLoggedIn();

    try {
      const response = await this.axiosInstance.post(
        `${this.baseUrl}/keepAlive`,
        {},
        {
          headers: {
            'X-Application': this.config.appKey,
            'X-Authentication': this.sessionToken!,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Keep alive error: ${error.message}`);
      }
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (!this.sessionToken) return;

    try {
      await this.axiosInstance.post(
        `${this.baseUrl}/logout`,
        {},
        {
          headers: {
            'X-Application': this.config.appKey,
            'X-Authentication': this.sessionToken,
          },
        }
      );
      this.sessionToken = null;
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
}
