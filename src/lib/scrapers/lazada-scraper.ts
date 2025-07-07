import { BaseScraper } from './base-scraper';
import { ProductResult } from '../types';

export class LazadaScraper extends BaseScraper {
  name = 'Lazada';
  baseUrl = 'https://www.lazada.sg';
  // Lazada operates in Southeast Asia and expanding
  supportedCountries = [
    // Primary Lazada markets
    'SG', 'MY', 'TH', 'ID', 'VN', 'PH',
    // Expanding to nearby countries
    'HK', 'TW', 'KR', 'JP', 'AU', 'NZ', 'IN', 'BD', 'LK', 'MM', 'KH', 'LA', 'BN', 'CN'
  ];

  private getDomainForCountry(country: string): string {
    const domains: Record<string, string> = {
      'SG': 'www.lazada.sg',
      'MY': 'www.lazada.com.my',
      'TH': 'www.lazada.co.th',
      'ID': 'www.lazada.co.id',
      'VN': 'www.lazada.vn',
      'PH': 'www.lazada.com.ph'
    };

    // Regional fallbacks for countries without specific Lazada domains
    const regionalFallbacks: Record<string, string> = {
      // Use Singapore as fallback for nearby countries
      'HK': 'www.lazada.sg', 'TW': 'www.lazada.sg', 'KR': 'www.lazada.sg',
      'JP': 'www.lazada.sg', 'AU': 'www.lazada.sg', 'NZ': 'www.lazada.sg',
      'IN': 'www.lazada.sg', 'BD': 'www.lazada.sg', 'LK': 'www.lazada.sg',
      'MM': 'www.lazada.sg', 'KH': 'www.lazada.sg', 'LA': 'www.lazada.sg',
      'BN': 'www.lazada.sg', 'CN': 'www.lazada.sg'
    };

    return domains[country] || regionalFallbacks[country] || 'www.lazada.sg';
  }

  protected buildSearchUrl(query: string, country: string, page: number = 1): string {
    const domain = this.getDomainForCountry(country);
    const encodedQuery = encodeURIComponent(query);
    const pageParam = page > 1 ? `&page=${page}` : '';
    return `https://${domain}/catalog/?q=${encodedQuery}${pageParam}`;
  }

  protected parseSearchResults($: cheerio.CheerioAPI): ProductResult[] {
    const products: ProductResult[] = [];

    // Lazada search result selectors
    const productElements = $('[data-qa-locator="product-item"]');

    productElements.each((_, element) => {
      try {
        const $element = $(element);
        
        // Extract product name
        const productName = $element.find('[data-qa-locator="product-name"]').text().trim() ||
                           $element.find('.RfADt').text().trim();

        if (!productName) return;

        // Extract price
        const priceElement = $element.find('[data-qa-locator="product-price"]').first() ||
                           $element.find('.aBrP0').first();
        const priceText = priceElement.text().trim();

        // Extract link
        const linkElement = $element.find('a').first();
        const relativeLink = linkElement.attr('href');
        
        if (!relativeLink) return;
        
        const fullLink = relativeLink.startsWith('http') 
          ? relativeLink 
          : `https://${this.getDomainForCountry('SG')}${relativeLink}`;

        // Extract image
        const imageUrl = $element.find('img').first().attr('src') || '';

        // Extract rating
        const ratingElement = $element.find('[data-qa-locator="product-rating"]');
        const ratingText = ratingElement.text().trim();
        const rating = ratingText ? parseFloat(ratingText) : undefined;

        // Extract review count
        const reviewElement = $element.find('[data-qa-locator="product-review-count"]');
        const reviewText = reviewElement.text().trim();
        const reviewMatch = reviewText.match(/\((\d+)\)/);
        const reviewCount = reviewMatch ? parseInt(reviewMatch[1]) : undefined;

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
            availability: 'In Stock'
          });
        }
      } catch (error) {
        console.error('Error parsing Lazada product:', error);
      }
    });

    return products;
  }
}
