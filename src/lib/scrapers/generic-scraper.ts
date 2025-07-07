import { BaseScraper } from './base-scraper';
import { ProductResult } from '../types';

export class GenericScraper extends BaseScraper {
  name = 'Generic';
  baseUrl = 'https://www.google.com';
  // Support ALL countries as a fallback scraper
  supportedCountries = [
    // All ISO country codes - this is the universal fallback
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

  protected buildSearchUrl(query: string, country: string, page: number = 1): string {
    // Use Google Shopping as a fallback for countries without specific scrapers
    const encodedQuery = encodeURIComponent(query);
    const countryCode = country.toLowerCase();
    const startParam = page > 1 ? `&start=${(page - 1) * 10}` : '';
    return `https://www.google.com/search?q=${encodedQuery}&tbm=shop&gl=${countryCode}${startParam}`;
  }

  protected parseSearchResults($: cheerio.CheerioAPI): ProductResult[] {
    const products: ProductResult[] = [];

    // Google Shopping result selectors
    const productElements = $('.sh-dgr__content');

    productElements.each((_, element) => {
      try {
        const $element = $(element);
        
        // Extract product name
        const productName = $element.find('.sh-np__product-title').text().trim() ||
                           $element.find('h3').text().trim();

        if (!productName) return;

        // Extract price
        const priceElement = $element.find('.sh-np__price');
        const priceText = priceElement.text().trim();

        // Extract link
        const linkElement = $element.find('a').first();
        const link = linkElement.attr('href');
        
        if (!link) return;

        // Extract image
        const imageUrl = $element.find('img').first().attr('src') || '';

        // Extract merchant/website
        const merchant = $element.find('.sh-np__seller-container').text().trim() || 'Unknown';

        const price = this.extractPrice(priceText);
        const currency = this.extractCurrency(priceText);

        if (price && price !== '0') {
          products.push({
            link: link.startsWith('http') ? link : `https://www.google.com${link}`,
            price,
            currency,
            productName,
            website: merchant || this.name,
            imageUrl,
            availability: 'Available'
          });
        }
      } catch (error) {
        console.error('Error parsing generic search result:', error);
      }
    });

    return products;
  }
}
