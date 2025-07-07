import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { ProductResult } from '../types';

export class AmazonScraper extends BaseScraper {
  name = 'Amazon';
  baseUrl = 'https://www.amazon.com';
  // Support all countries - Amazon is available globally
  supportedCountries = [
    'US', 'IN', 'GB', 'CA', 'AU', 'DE', 'FR', 'JP', 'BR', 'MX',
    'IT', 'ES', 'NL', 'SE', 'PL', 'TR', 'AE', 'SA', 'SG', 'EG',
    // Add all other countries - Amazon ships globally or has local presence
    'AR', 'AT', 'BE', 'BG', 'BO', 'CH', 'CL', 'CN', 'CO', 'CR',
    'CY', 'CZ', 'DK', 'EC', 'EE', 'FI', 'GR', 'GT', 'HK', 'HR',
    'HU', 'ID', 'IE', 'IL', 'IS', 'KR', 'LT', 'LU', 'LV', 'MT',
    'MY', 'NO', 'NZ', 'PA', 'PE', 'PH', 'PT', 'RO', 'SI', 'SK',
    'TH', 'TW', 'UY', 'VE', 'VN', 'ZA'
  ];

  private getDomainForCountry(country: string): string {
    const domains: Record<string, string> = {
      'US': 'amazon.com',
      'IN': 'amazon.in',
      'GB': 'amazon.co.uk',
      'CA': 'amazon.ca',
      'AU': 'amazon.com.au',
      'DE': 'amazon.de',
      'FR': 'amazon.fr',
      'JP': 'amazon.co.jp',
      'BR': 'amazon.com.br',
      'MX': 'amazon.com.mx',
      'IT': 'amazon.it',
      'ES': 'amazon.es',
      'NL': 'amazon.nl',
      'SE': 'amazon.se',
      'PL': 'amazon.pl',
      'TR': 'amazon.com.tr',
      'AE': 'amazon.ae',
      'SA': 'amazon.sa',
      'SG': 'amazon.sg',
      'EG': 'amazon.eg',
      'BE': 'amazon.com.be',
      'AT': 'amazon.de', // Austria uses German Amazon
      'CH': 'amazon.de', // Switzerland uses German Amazon
      'NO': 'amazon.se', // Norway uses Swedish Amazon
      'DK': 'amazon.se', // Denmark uses Swedish Amazon
      'FI': 'amazon.se', // Finland uses Swedish Amazon
      'IE': 'amazon.co.uk', // Ireland uses UK Amazon
      'PT': 'amazon.es', // Portugal uses Spanish Amazon
      'GR': 'amazon.de', // Greece uses German Amazon
      'CY': 'amazon.de', // Cyprus uses German Amazon
      'MT': 'amazon.de', // Malta uses German Amazon
      'LU': 'amazon.fr', // Luxembourg uses French Amazon
      'CZ': 'amazon.de', // Czech Republic uses German Amazon
      'SK': 'amazon.de', // Slovakia uses German Amazon
      'HU': 'amazon.de', // Hungary uses German Amazon
      'RO': 'amazon.de', // Romania uses German Amazon
      'BG': 'amazon.de', // Bulgaria uses German Amazon
      'HR': 'amazon.de', // Croatia uses German Amazon
      'SI': 'amazon.de', // Slovenia uses German Amazon
      'EE': 'amazon.de', // Estonia uses German Amazon
      'LV': 'amazon.de', // Latvia uses German Amazon
      'LT': 'amazon.de'  // Lithuania uses German Amazon
    };

    // For countries without specific Amazon domains, use the closest regional one
    const regionalDefaults: Record<string, string> = {
      // Asia-Pacific
      'CN': 'amazon.cn',
      'HK': 'amazon.com',
      'TW': 'amazon.com',
      'KR': 'amazon.com',
      'TH': 'amazon.sg',
      'MY': 'amazon.sg',
      'ID': 'amazon.sg',
      'PH': 'amazon.sg',
      'VN': 'amazon.sg',
      'NZ': 'amazon.com.au',

      // Americas
      'AR': 'amazon.com',
      'CL': 'amazon.com',
      'CO': 'amazon.com',
      'PE': 'amazon.com',
      'UY': 'amazon.com',
      'VE': 'amazon.com',
      'BO': 'amazon.com',
      'EC': 'amazon.com',
      'PA': 'amazon.com',
      'CR': 'amazon.com',
      'GT': 'amazon.com',

      // Africa & Middle East
      'ZA': 'amazon.com',
      'IL': 'amazon.com',
      'IS': 'amazon.co.uk'
    };

    return domains[country] || regionalDefaults[country] || 'amazon.com';
  }

  protected buildSearchUrl(query: string, country: string, page: number = 1): string {
    const domain = this.getDomainForCountry(country);
    const encodedQuery = encodeURIComponent(query);
    return `https://www.${domain}/s?k=${encodedQuery}&page=${page}&ref=sr_pg_${page}`;
  }

  protected parseSearchResults($: cheerio.CheerioAPI): ProductResult[] {
    const products: ProductResult[] = [];

    // Amazon search result selectors (these may need updates as Amazon changes their layout)
    const productSelectors = [
      '[data-component-type="s-search-result"]',
      '.s-result-item',
      '[data-asin]'
    ];

    let productElements = $('body');

    // Try different selectors to find products
    for (const selector of productSelectors) {
      productElements = $(selector);
      if (productElements.length > 0) break;
    }

    productElements.each((_, element) => {
      try {
        const $element = $(element);
        
        // Extract product name
        const nameSelectors = [
          'h2 a span',
          '.s-size-mini span',
          '[data-cy="title-recipe-title"]',
          'h2 span'
        ];
        
        let productName = '';
        for (const selector of nameSelectors) {
          productName = $element.find(selector).first().text().trim();
          if (productName) break;
        }

        if (!productName) return;

        // Extract price
        const priceSelectors = [
          '.a-price-whole',
          '.a-price .a-offscreen',
          '.a-price-range .a-offscreen',
          '.a-price-symbol'
        ];
        
        let priceText = '';
        for (const selector of priceSelectors) {
          priceText = $element.find(selector).first().text().trim();
          if (priceText) break;
        }

        // Extract link
        const linkElement = $element.find('h2 a, .s-link-style a').first();
        const relativeLink = linkElement.attr('href');
        
        if (!relativeLink) return;
        
        const fullLink = relativeLink.startsWith('http') 
          ? relativeLink 
          : `https://www.${this.getDomainForCountry('US')}${relativeLink}`;

        // Extract image
        const imageUrl = $element.find('img').first().attr('src') || '';

        // Extract rating
        const ratingText = $element.find('.a-icon-alt').first().text();
        const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
        const rating = ratingMatch ? parseFloat(ratingMatch[1]) : undefined;

        // Extract review count
        const reviewText = $element.find('.a-size-base').text();
        const reviewMatch = reviewText.match(/\((\d+(?:,\d+)*)\)/);
        const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, '')) : undefined;

        const price = this.extractPrice(priceText);
        const currency = this.extractCurrency(priceText);

        if (price && price !== '0') {
          products.push({
            link: fullLink,
            price,
            currency,
            productName,
            website: this.name,
            imageUrl,
            rating,
            reviewCount,
            availability: 'In Stock' // Amazon usually shows availability separately
          });
        }
      } catch (error) {
        console.error('Error parsing Amazon product:', error);
      }
    });

    return products;
  }

  /**
   * Scrape multiple pages for more comprehensive results
   */
  async scrapeMultiplePages(query: string, country: string, maxPages: number = 3): Promise<ProductResult[]> {
    const allProducts: ProductResult[] = [];

    for (let page = 1; page <= maxPages; page++) {
      try {
        const searchUrl = this.buildSearchUrl(query, country, page);
        const $ = await this.fetchPage(searchUrl);

        if (!$) {
          console.warn(`Failed to fetch Amazon page ${page} for ${country}`);
          continue;
        }

        const pageProducts = this.parseSearchResults($);

        // If no products found on this page, likely reached the end
        if (pageProducts.length === 0) {
          break;
        }

        allProducts.push(...pageProducts);

        // Add delay between page requests to be respectful
        if (page < maxPages) {
          await this.delay(1000 + Math.random() * 1000); // 1-2 second delay
        }

      } catch (error) {
        console.error(`Error scraping Amazon page ${page}:`, error);
        // Continue with next page even if one fails
      }
    }

    return allProducts;
  }
}
