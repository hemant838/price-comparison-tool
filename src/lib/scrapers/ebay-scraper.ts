import * as cheerio from 'cheerio';
import { BaseScraper } from './base-scraper';
import { ProductResult } from '../types';

export class EbayScraper extends BaseScraper {
  name = 'eBay';
  baseUrl = 'https://www.ebay.com';
  // eBay operates globally - support all countries
  supportedCountries = [
    // All countries - eBay has global reach
    'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
    'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
    'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
    'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
    'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
    'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
    'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
    'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
    'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
    'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
    'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
    'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
    'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
    'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
    'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
    'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
  ];

  private getDomainForCountry(country: string): string {
    const domains: Record<string, string> = {
      // Primary eBay domains
      'US': 'ebay.com',
      'GB': 'ebay.co.uk',
      'CA': 'ebay.ca',
      'AU': 'ebay.com.au',
      'DE': 'ebay.de',
      'FR': 'ebay.fr',
      'IT': 'ebay.it',
      'ES': 'ebay.es',
      'NL': 'ebay.nl',
      'BE': 'ebay.be',
      'AT': 'ebay.at',
      'CH': 'ebay.ch',
      'IE': 'ebay.ie',
      'PL': 'ebay.pl',
      'IN': 'ebay.in',
      'SG': 'ebay.com.sg',
      'MY': 'ebay.com.my',
      'PH': 'ebay.ph',
      'HK': 'ebay.com.hk'
    };

    // Regional mappings for countries without specific eBay domains
    const regionalMappings: Record<string, string> = {
      // Europe - use closest regional eBay
      'NO': 'ebay.de', 'DK': 'ebay.de', 'SE': 'ebay.de', 'FI': 'ebay.de',
      'PT': 'ebay.es', 'GR': 'ebay.de', 'CY': 'ebay.de', 'MT': 'ebay.de',
      'LU': 'ebay.fr', 'CZ': 'ebay.de', 'SK': 'ebay.de', 'HU': 'ebay.de',
      'RO': 'ebay.de', 'BG': 'ebay.de', 'HR': 'ebay.de', 'SI': 'ebay.de',
      'EE': 'ebay.de', 'LV': 'ebay.de', 'LT': 'ebay.de', 'IS': 'ebay.co.uk',

      // Asia-Pacific
      'CN': 'ebay.com', 'JP': 'ebay.com', 'KR': 'ebay.com', 'TW': 'ebay.com',
      'TH': 'ebay.com.sg', 'ID': 'ebay.com.sg', 'VN': 'ebay.com.sg',
      'NZ': 'ebay.com.au', 'PK': 'ebay.in', 'BD': 'ebay.in', 'LK': 'ebay.in',

      // Americas
      'MX': 'ebay.com', 'BR': 'ebay.com', 'AR': 'ebay.com', 'CL': 'ebay.com',
      'CO': 'ebay.com', 'PE': 'ebay.com', 'UY': 'ebay.com', 'VE': 'ebay.com',

      // Middle East & Africa
      'AE': 'ebay.com', 'SA': 'ebay.com', 'IL': 'ebay.com', 'TR': 'ebay.com',
      'EG': 'ebay.com', 'ZA': 'ebay.com', 'NG': 'ebay.com', 'KE': 'ebay.com',

      // Others
      'RU': 'ebay.com', 'UA': 'ebay.com', 'BY': 'ebay.com', 'KZ': 'ebay.com'
    };

    return domains[country] || regionalMappings[country] || 'ebay.com';
  }

  protected buildSearchUrl(query: string, country: string, page: number = 1): string {
    const domain = this.getDomainForCountry(country);
    const encodedQuery = encodeURIComponent(query);
    const pageParam = page > 1 ? `&_pgn=${page}` : '';
    return `https://www.${domain}/sch/i.html?_nkw=${encodedQuery}&_sacat=0${pageParam}`;
  }

  protected parseSearchResults($: cheerio.CheerioAPI): ProductResult[] {
    const products: ProductResult[] = [];

    // eBay search result selectors
    const productElements = $('.s-item');

    productElements.each((_, element) => {
      try {
        const $element = $(element);
        
        // Skip sponsored/ad items
        if ($element.find('.s-item__subtitle').text().includes('Sponsored')) {
          return;
        }

        // Extract product name
        const productName = $element.find('.s-item__title').text().trim();
        if (!productName || productName === 'Shop on eBay') return;

        // Extract price
        const priceElement = $element.find('.s-item__price');
        const priceText = priceElement.text().trim();
        
        // Extract link
        const linkElement = $element.find('.s-item__link');
        const link = linkElement.attr('href');
        
        if (!link) return;

        // Extract image
        const imageUrl = $element.find('.s-item__image img').attr('src') || '';

        // Extract shipping info
        const shippingInfo = $element.find('.s-item__shipping').text().trim();

        // Extract condition
        const condition = $element.find('.s-item__subtitle').text().trim();

        const price = this.extractPrice(priceText);
        const currency = this.extractCurrency(priceText);

        if (price && price !== '0') {
          products.push({
            link,
            price,
            currency,
            productName,
            website: this.name,
            imageUrl,
            shippingInfo: shippingInfo || undefined,
            condition: condition || undefined,
            availability: 'Available'
          });
        }
      } catch (error) {
        console.error('Error parsing eBay product:', error);
      }
    });

    return products;
  }
}
