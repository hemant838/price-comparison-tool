import { WebsiteScraper, ScrapingResult, ProductResult } from './types';
import { AmazonScraper } from './scrapers/amazon-scraper';
import { EbayScraper } from './scrapers/ebay-scraper';
import { FlipkartScraper } from './scrapers/flipkart-scraper';
import { ShopeeScraper } from './scrapers/shopee-scraper';
import { LazadaScraper } from './scrapers/lazada-scraper';
import { GenericScraper } from './scrapers/generic-scraper';
import { AIProductMatcher } from './ai-matcher';
import { getCountryConfig } from './countries';
import { DataProcessor, ProcessingOptions } from './data-processor';

export class ScraperManager {
  private scrapers: Map<string, WebsiteScraper> = new Map();
  private aiMatcher: AIProductMatcher;
  private dataProcessor: DataProcessor;

  constructor() {
    this.initializeScrapers();
    this.aiMatcher = AIProductMatcher.getInstance();
    this.dataProcessor = new DataProcessor();
  }

  private initializeScrapers(): void {
    const scrapers = [
      new AmazonScraper(),
      new EbayScraper(),
      new FlipkartScraper(),
      new ShopeeScraper(),
      new LazadaScraper(),
      new GenericScraper()
    ];

    scrapers.forEach(scraper => {
      this.scrapers.set(scraper.name.toLowerCase(), scraper);
    });
  }

  /**
   * Get all available scrapers for a specific country
   */
  getScrapersForCountry(country: string): WebsiteScraper[] {
    const countryConfig = getCountryConfig(country);
    if (!countryConfig) return [];

    const availableScrapers: WebsiteScraper[] = [];
    
    for (const websiteName of countryConfig.websites) {
      const scraper = this.scrapers.get(websiteName.toLowerCase());
      if (scraper && scraper.supportedCountries.includes(country)) {
        availableScrapers.push(scraper);
      }
    }

    return availableScrapers;
  }

  /**
   * Scrape all available websites for a given query and country with pagination
   */
  async scrapeAll(query: string, country: string, options?: ProcessingOptions & { maxPages?: number }): Promise<{
    results: ProductResult[];
    errors: string[];
    summary: {
      totalProducts: number;
      successfulSites: number;
      failedSites: number;
      websites: string[];
      totalPages: number;
    };
  }> {
    const scrapers = this.getScrapersForCountry(country);
    const errors: string[] = [];
    const allProducts: ProductResult[] = [];
    const websites: string[] = [];
    let successfulSites = 0;
    const maxPages = options?.maxPages || 3;
    let totalPages = 0;

    if (scrapers.length === 0) {
      return {
        results: [],
        errors: [`No scrapers available for country: ${country}`],
        summary: {
          totalProducts: 0,
          successfulSites: 0,
          failedSites: 0,
          websites: [],
          totalPages: 0
        }
      };
    }

    // Run scrapers with pagination in parallel with delays
    const scrapingPromises = scrapers.map(async (scraper, index) => {
      try {
        // Add delay between requests to be respectful to servers
        await this.delay(index * 2000); // Increased delay for pagination

        websites.push(scraper.name);

        // Use pagination if scraper supports it
        if ('scrapeWithPagination' in scraper && typeof scraper.scrapeWithPagination === 'function') {
          const result = await scraper.scrapeWithPagination(query, country, maxPages);
          totalPages += maxPages;

          if (result.success) {
            successfulSites++;
            return result.products;
          } else {
            errors.push(`${scraper.name}: ${result.error}`);
            return [];
          }
        } else {
          // Fallback to regular scraping
          const result = await scraper.scrape(query, country);
          totalPages += 1;

          if (result.success) {
            successfulSites++;
            return result.products;
          } else {
            errors.push(`${scraper.name}: ${result.error}`);
            return [];
          }
        }
      } catch (error) {
        errors.push(`${scraper.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return [];
      }
    });

    const results = await Promise.all(scrapingPromises);

    // Flatten all results
    results.forEach(products => {
      allProducts.push(...products);
    });

    // Use AI to filter and rank products
    const matchedProducts = await this.aiMatcher.batchMatch(query, allProducts);

    // Process and rank results using data processor
    const processingOptions = options || { sortBy: 'price', sortOrder: 'asc' };
    const processedProducts = await this.dataProcessor.processResults(matchedProducts, processingOptions);

    // Remove duplicates
    const uniqueProducts = this.dataProcessor.removeDuplicates(processedProducts);

    return {
      results: uniqueProducts,
      errors,
      summary: {
        totalProducts: uniqueProducts.length,
        successfulSites,
        failedSites: scrapers.length - successfulSites,
        websites,
        totalPages
      }
    };
  }

  /**
   * Scrape a specific website
   */
  async scrapeWebsite(
    websiteName: string, 
    query: string, 
    country: string
  ): Promise<ScrapingResult> {
    const scraper = this.scrapers.get(websiteName.toLowerCase());
    
    if (!scraper) {
      return {
        success: false,
        products: [],
        error: `Scraper not found for website: ${websiteName}`,
        website: websiteName
      };
    }

    if (!scraper.supportedCountries.includes(country)) {
      return {
        success: false,
        products: [],
        error: `Website ${websiteName} not supported in country: ${country}`,
        website: websiteName
      };
    }

    return await scraper.scrape(query, country);
  }

  /**
   * Get list of all available scrapers
   */
  getAvailableScrapers(): string[] {
    return Array.from(this.scrapers.keys());
  }

  /**
   * Get scraper information
   */
  getScraperInfo(websiteName: string): {
    name: string;
    baseUrl: string;
    supportedCountries: string[];
  } | null {
    const scraper = this.scrapers.get(websiteName.toLowerCase());
    if (!scraper) return null;

    return {
      name: scraper.name,
      baseUrl: scraper.baseUrl,
      supportedCountries: scraper.supportedCountries
    };
  }

  /**
   * Enhanced scraping that ensures maximum coverage from all websites
   */
  async scrapeAllComprehensive(query: string, country: string, options?: ProcessingOptions & {
    maxPages?: number;
    retryFailedSites?: boolean;
    minResultsPerSite?: number;
  }): Promise<{
    results: ProductResult[];
    errors: string[];
    summary: {
      totalProducts: number;
      successfulSites: number;
      failedSites: number;
      websites: string[];
      totalPages: number;
      retryAttempts: number;
    };
  }> {
    const maxPages = options?.maxPages || 3;
    const retryFailedSites = options?.retryFailedSites ?? true;

    let retryAttempts = 0;
    const firstAttemptResult = await this.scrapeAll(query, country, { ...options, maxPages });

    // If retry is enabled and we have failed sites, try again with different strategies
    if (retryFailedSites && firstAttemptResult.summary.failedSites > 0) {
      const failedSites = firstAttemptResult.summary.websites.length - firstAttemptResult.summary.successfulSites;

      if (failedSites > 0) {
        retryAttempts++;
        console.log(`Retrying ${failedSites} failed sites with different approach...`);

        // Retry with longer delays and fewer pages
        const retryResult = await this.scrapeAll(query, country, {
          ...options,
          maxPages: Math.max(1, Math.floor(maxPages / 2))
        });

        // Merge results
        firstAttemptResult.results.push(...retryResult.results);
        firstAttemptResult.summary.successfulSites += retryResult.summary.successfulSites;
        firstAttemptResult.summary.totalProducts = firstAttemptResult.results.length;
        firstAttemptResult.errors.push(...retryResult.errors);
      }
    }

    // Process and deduplicate results
    const processedProducts = await this.dataProcessor.processResults(firstAttemptResult.results, options);
    const uniqueProducts = this.dataProcessor.removeDuplicates(processedProducts);

    return {
      results: uniqueProducts,
      errors: firstAttemptResult.errors,
      summary: {
        ...firstAttemptResult.summary,
        totalProducts: uniqueProducts.length,
        retryAttempts
      }
    };
  }

  /**
   * Get detailed scraping statistics
   */
  getScrapingStats(results: ProductResult[]): {
    websiteBreakdown: Record<string, number>;
    currencyBreakdown: Record<string, number>;
    priceRanges: Record<string, { min: number; max: number; avg: number }>;
    totalUniqueProducts: number;
  } {
    const websiteBreakdown: Record<string, number> = {};
    const currencyBreakdown: Record<string, number> = {};
    const priceRanges: Record<string, { min: number; max: number; avg: number }> = {};

    results.forEach(product => {
      // Website breakdown
      websiteBreakdown[product.website] = (websiteBreakdown[product.website] || 0) + 1;

      // Currency breakdown
      currencyBreakdown[product.currency] = (currencyBreakdown[product.currency] || 0) + 1;

      // Price ranges by currency
      const price = parseFloat(product.price) || 0;
      if (price > 0) {
        if (!priceRanges[product.currency]) {
          priceRanges[product.currency] = { min: price, max: price, avg: price };
        } else {
          priceRanges[product.currency].min = Math.min(priceRanges[product.currency].min, price);
          priceRanges[product.currency].max = Math.max(priceRanges[product.currency].max, price);
        }
      }
    });

    // Calculate averages
    Object.keys(priceRanges).forEach(currency => {
      const currencyProducts = results.filter(p => p.currency === currency);
      const prices = currencyProducts.map(p => parseFloat(p.price) || 0).filter(p => p > 0);
      priceRanges[currency].avg = prices.length > 0
        ? prices.reduce((a, b) => a + b, 0) / prices.length
        : 0;
    });

    return {
      websiteBreakdown,
      currencyBreakdown,
      priceRanges,
      totalUniqueProducts: results.length
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
