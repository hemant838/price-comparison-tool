import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { ProductResult } from '../types';

export class FlipkartScraper extends BaseScraper {
  name = 'Flipkart';
  baseUrl = 'https://www.flipkart.com';
  // Flipkart primarily serves India but ships to many countries
  supportedCountries = [
    'IN', // Primary market
    // Countries where Flipkart ships or has presence
    'US', 'GB', 'CA', 'AU', 'AE', 'SG', 'MY', 'BD', 'LK', 'NP', 'BT', 'MV',
    'PK', 'AF', 'MM', 'TH', 'ID', 'PH', 'VN', 'KH', 'LA', 'BN', 'CN', 'HK',
    'TW', 'KR', 'JP', 'MN', 'KZ', 'UZ', 'KG', 'TJ', 'TM'
  ];

  protected buildSearchUrl(query: string, country: string, page: number = 1): string {
    const encodedQuery = encodeURIComponent(query);
    const pageParam = page > 1 ? `&page=${page}` : '';
    return `https://www.flipkart.com/search?q=${encodedQuery}${pageParam}`;
  }

  protected parseSearchResults($: cheerio.CheerioAPI): ProductResult[] {
    const products: ProductResult[] = [];

    // Flipkart search result selectors
    const productSelectors = [
      '[data-id]',
      '._1AtVbE',
      '._13oc-S'
    ];

    let productElements = $('body');

    for (const selector of productSelectors) {
      productElements = $(selector);
      if (productElements.length > 0) break;
    }

    productElements.each((_, element) => {
      try {
        const $element = $(element);
        
        // Extract product name
        const nameSelectors = [
          '._4rR01T',
          '.s1Q9rs',
          '._2WkVRV',
          'a[title]'
        ];
        
        let productName = '';
        for (const selector of nameSelectors) {
          const nameElement = $element.find(selector);
          productName = nameElement.attr('title') || nameElement.text().trim();
          if (productName) break;
        }

        if (!productName) return;

        // Extract price
        const priceSelectors = [
          '._30jeq3',
          '._1_WHN1',
          '.Nx9bqj'
        ];
        
        let priceText = '';
        for (const selector of priceSelectors) {
          priceText = $element.find(selector).first().text().trim();
          if (priceText) break;
        }

        // Extract link
        const linkSelectors = [
          'a[href*="/p/"]',
          '._1fQZEK',
          '._2rpwqI'
        ];
        
        let relativeLink = '';
        for (const selector of linkSelectors) {
          relativeLink = $element.find(selector).attr('href') || '';
          if (relativeLink) break;
        }
        
        if (!relativeLink) return;
        
        const fullLink = relativeLink.startsWith('http') 
          ? relativeLink 
          : `https://www.flipkart.com${relativeLink}`;

        // Extract image
        const imageUrl = $element.find('img').first().attr('src') || '';

        // Extract rating
        const ratingElement = $element.find('._3LWZlK');
        const ratingText = ratingElement.text().trim();
        const rating = ratingText ? parseFloat(ratingText) : undefined;

        // Extract review count
        const reviewElement = $element.find('._2_R_DZ');
        const reviewText = reviewElement.text().trim();
        const reviewMatch = reviewText.match(/\((\d+(?:,\d+)*)\)/);
        const reviewCount = reviewMatch ? parseInt(reviewMatch[1].replace(/,/g, '')) : undefined;

        const price = this.extractPrice(priceText);
        const currency = this.extractCurrency(priceText, 'INR');

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
            availability: 'In Stock'
          });
        }
      } catch (error) {
        console.error('Error parsing Flipkart product:', error);
      }
    });

    return products;
  }
}
