import { BaseScraper } from './base-scraper';
import { ProductResult } from '../types';

export class ShopeeScraper extends BaseScraper {
  name = 'Shopee';
  baseUrl = 'https://shopee.sg';
  // Shopee operates in Southeast Asia and expanding globally
  supportedCountries = [
    // Primary Shopee markets
    'SG', 'MY', 'TH', 'ID', 'VN', 'PH', 'TW', 'BR', 'MX', 'CO', 'CL', 'AR',
    // Expanding to other countries where Shopee has presence or ships
    'HK', 'KR', 'JP', 'AU', 'NZ', 'IN', 'BD', 'LK', 'MM', 'KH', 'LA', 'BN',
    'CN', 'MO', 'PK', 'NP', 'BT', 'MV', 'AF', 'UZ', 'KZ', 'KG', 'TJ', 'TM'
  ];

  private getDomainForCountry(country: string): string {
    const domains: Record<string, string> = {
      'SG': 'shopee.sg',
      'MY': 'shopee.com.my',
      'TH': 'shopee.co.th',
      'ID': 'shopee.co.id',
      'VN': 'shopee.vn',
      'PH': 'shopee.ph',
      'TW': 'shopee.tw',
      'BR': 'shopee.com.br',
      'MX': 'shopee.com.mx',
      'CO': 'shopee.com.co',
      'CL': 'shopee.cl',
      'AR': 'shopee.com.ar'
    };

    // Regional fallbacks for countries without specific Shopee domains
    const regionalFallbacks: Record<string, string> = {
      // Asia-Pacific fallbacks
      'HK': 'shopee.sg', 'KR': 'shopee.sg', 'JP': 'shopee.sg', 'AU': 'shopee.sg',
      'NZ': 'shopee.sg', 'IN': 'shopee.sg', 'BD': 'shopee.sg', 'LK': 'shopee.sg',
      'MM': 'shopee.sg', 'KH': 'shopee.sg', 'LA': 'shopee.sg', 'BN': 'shopee.sg',
      'CN': 'shopee.sg', 'MO': 'shopee.sg', 'PK': 'shopee.sg', 'NP': 'shopee.sg',
      'BT': 'shopee.sg', 'MV': 'shopee.sg', 'AF': 'shopee.sg', 'UZ': 'shopee.sg',
      'KZ': 'shopee.sg', 'KG': 'shopee.sg', 'TJ': 'shopee.sg', 'TM': 'shopee.sg'
    };

    return domains[country] || regionalFallbacks[country] || 'shopee.sg';
  }

  protected buildSearchUrl(query: string, country: string, page: number = 1): string {
    const domain = this.getDomainForCountry(country);
    const encodedQuery = encodeURIComponent(query);
    const pageParam = page > 1 ? `&page=${page - 1}` : ''; // Shopee uses 0-based pagination
    return `https://${domain}/search?keyword=${encodedQuery}${pageParam}`;
  }

  protected parseSearchResults($: cheerio.CheerioAPI): ProductResult[] {
    const products: ProductResult[] = [];

    // Shopee search result selectors (these may need updates as Shopee changes their layout)
    const productElements = $('[data-sqe="item"]');

    productElements.each((_, element) => {
      try {
        const $element = $(element);
        
        // Extract product name
        const productName = $element.find('[data-sqe="name"]').text().trim() ||
                           $element.find('.shopee-search-item-result__text').text().trim();

        if (!productName) return;

        // Extract price
        const priceElement = $element.find('[data-sqe="price"]').first() ||
                           $element.find('.shopee-search-item-result__price').first();
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
        const ratingElement = $element.find('[data-sqe="rating"]');
        const ratingText = ratingElement.text().trim();
        const rating = ratingText ? parseFloat(ratingText) : undefined;

        // Extract sold count (similar to review count)
        const soldElement = $element.find('[data-sqe="sold"]');
        const soldText = soldElement.text().trim();
        const soldMatch = soldText.match(/(\d+)/);
        const reviewCount = soldMatch ? parseInt(soldMatch[1]) : undefined;

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
        console.error('Error parsing Shopee product:', error);
      }
    });

    return products;
  }
}
