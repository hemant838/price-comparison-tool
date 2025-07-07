import axios from 'axios';
import * as cheerio from 'cheerio';
import { WebsiteScraper, ScrapingResult, ProductResult } from '../types';

export abstract class BaseScraper implements WebsiteScraper {
  abstract name: string;
  abstract baseUrl: string;
  abstract supportedCountries: string[];

  protected userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ];

  protected getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  protected async fetchPage(url: string): Promise<cheerio.CheerioAPI | null> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 10000,
      });

      return cheerio.load(response.data) as cheerio.CheerioAPI;
    } catch (error) {
      console.error(`Error fetching page ${url}:`, error);
      return null;
    }
  }

  protected extractPrice(priceText: string): string {
    if (!priceText) return '0';
    
    // Remove common currency symbols and extract numbers
    const cleaned = priceText.replace(/[^\d.,]/g, '');
    const price = cleaned.replace(/,/g, '');
    
    return price || '0';
  }

  protected extractCurrency(priceText: string, defaultCurrency: string = 'USD'): string {
    const currencySymbols: Record<string, string> = {
      '$': 'USD',
      '€': 'EUR',
      '£': 'GBP',
      '¥': 'JPY',
      '₹': 'INR',
      'R$': 'BRL',
      'C$': 'CAD',
      'A$': 'AUD',
    };

    for (const [symbol, currency] of Object.entries(currencySymbols)) {
      if (priceText.includes(symbol)) {
        return currency;
      }
    }

    return defaultCurrency;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected buildSearchUrl(_query: string, _country: string, _page?: number): string {
    // This should be implemented by each specific scraper
    throw new Error('buildSearchUrl must be implemented by subclass');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected parseSearchResults(_$: cheerio.CheerioAPI): ProductResult[] {
    // This should be implemented by each specific scraper
    throw new Error('parseSearchResults must be implemented by subclass');
  }

  async scrape(query: string, country: string): Promise<ScrapingResult> {
    try {
      if (!this.supportedCountries.includes(country)) {
        return {
          success: false,
          products: [],
          error: `Country ${country} not supported by ${this.name}`,
          website: this.name
        };
      }

      const searchUrl = this.buildSearchUrl(query, country);
      const $ = await this.fetchPage(searchUrl);

      if (!$) {
        return {
          success: false,
          products: [],
          error: 'Failed to fetch search results',
          website: this.name
        };
      }

      const products = this.parseSearchResults($);

      return {
        success: true,
        products,
        website: this.name
      };
    } catch (error) {
      console.error(`Error scraping ${this.name}:`, error);
      return {
        success: false,
        products: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        website: this.name
      };
    }
  }

  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Scrape multiple pages for comprehensive results
   */
  async scrapeWithPagination(query: string, country: string, maxPages: number = 3): Promise<ScrapingResult> {
    try {
      if (!this.supportedCountries.includes(country)) {
        return {
          success: false,
          products: [],
          error: `Country ${country} not supported by ${this.name}`,
          website: this.name
        };
      }

      const allProducts: ProductResult[] = [];
      let successfulPages = 0;

      for (let page = 1; page <= maxPages; page++) {
        try {
          const searchUrl = this.buildSearchUrl(query, country, page);
          const $ = await this.fetchPage(searchUrl);

          if (!$) {
            console.warn(`Failed to fetch page ${page} from ${this.name}`);
            continue;
          }

          const pageProducts = this.parseSearchResults($);

          // If no products found on this page, likely reached the end
          if (pageProducts.length === 0) {
            break;
          }

          allProducts.push(...pageProducts);
          successfulPages++;

          // Log successful page scraping
          console.log(`Successfully scraped page ${page} from ${this.name}, found ${pageProducts.length} products`);

          // Add delay between page requests to be respectful
          if (page < maxPages) {
            await this.delay(1000 + Math.random() * 1000); // 1-2 second delay
          }

        } catch (error) {
          console.error(`Error scraping page ${page} from ${this.name}:`, error);
          // Continue with next page even if one fails
        }
      }

      console.log(`Completed pagination scraping for ${this.name}: ${successfulPages} successful pages, ${allProducts.length} total products`);

      return {
        success: allProducts.length > 0,
        products: allProducts,
        website: this.name,
        error: allProducts.length === 0 ? 'No products found across all pages' : undefined
      };
    } catch (error) {
      console.error(`Error in pagination scraping for ${this.name}:`, error);
      return {
        success: false,
        products: [],
        error: error instanceof Error ? error.message : 'Unknown error',
        website: this.name
      };
    }
  }
}
