import { CountryConfig } from './types';

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
  // North America
  US: {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    websites: ['amazon', 'ebay', 'walmart', 'bestbuy', 'target']
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    currency: 'CAD',
    websites: ['amazon', 'ebay', 'bestbuy', 'canadiantire', 'walmart']
  },
  MX: {
    code: 'MX',
    name: 'Mexico',
    currency: 'MXN',
    websites: ['amazon', 'mercadolibre', 'liverpool', 'elektra', 'coppel']
  },

  // Europe
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    websites: ['amazon', 'ebay', 'argos', 'currys', 'johnlewis']
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    currency: 'EUR',
    websites: ['amazon', 'ebay', 'otto', 'mediamarkt', 'saturn']
  },
  FR: {
    code: 'FR',
    name: 'France',
    currency: 'EUR',
    websites: ['amazon', 'ebay', 'fnac', 'darty', 'cdiscount']
  },
  IT: {
    code: 'IT',
    name: 'Italy',
    currency: 'EUR',
    websites: ['amazon', 'ebay', 'eprice', 'unieuro']
  },
  ES: {
    code: 'ES',
    name: 'Spain',
    currency: 'EUR',
    websites: ['amazon', 'ebay', 'elcorteingles', 'pccomponentes']
  },
  NL: {
    code: 'NL',
    name: 'Netherlands',
    currency: 'EUR',
    websites: ['amazon', 'ebay', 'bol', 'coolblue']
  },
  BE: {
    code: 'BE',
    name: 'Belgium',
    currency: 'EUR',
    websites: ['amazon', 'ebay', 'bol']
  },
  AT: {
    code: 'AT',
    name: 'Austria',
    currency: 'EUR',
    websites: ['amazon', 'ebay']
  },
  CH: {
    code: 'CH',
    name: 'Switzerland',
    currency: 'CHF',
    websites: ['amazon', 'ebay', 'digitec']
  },
  SE: {
    code: 'SE',
    name: 'Sweden',
    currency: 'SEK',
    websites: ['amazon', 'ebay', 'webhallen']
  },
  NO: {
    code: 'NO',
    name: 'Norway',
    currency: 'NOK',
    websites: ['amazon', 'ebay', 'komplett']
  },
  DK: {
    code: 'DK',
    name: 'Denmark',
    currency: 'DKK',
    websites: ['amazon', 'ebay', 'proshop']
  },
  FI: {
    code: 'FI',
    name: 'Finland',
    currency: 'EUR',
    websites: ['amazon', 'ebay', 'verkkokauppa']
  },
  PL: {
    code: 'PL',
    name: 'Poland',
    currency: 'PLN',
    websites: ['amazon', 'ebay', 'allegro']
  },
  CZ: {
    code: 'CZ',
    name: 'Czech Republic',
    currency: 'CZK',
    websites: ['amazon', 'ebay', 'alza']
  },
  HU: {
    code: 'HU',
    name: 'Hungary',
    currency: 'HUF',
    websites: ['amazon', 'ebay']
  },
  RO: {
    code: 'RO',
    name: 'Romania',
    currency: 'RON',
    websites: ['amazon', 'ebay', 'emag']
  },
  BG: {
    code: 'BG',
    name: 'Bulgaria',
    currency: 'BGN',
    websites: ['amazon', 'ebay']
  },
  HR: {
    code: 'HR',
    name: 'Croatia',
    currency: 'EUR',
    websites: ['amazon', 'ebay']
  },
  SI: {
    code: 'SI',
    name: 'Slovenia',
    currency: 'EUR',
    websites: ['amazon', 'ebay']
  },
  SK: {
    code: 'SK',
    name: 'Slovakia',
    currency: 'EUR',
    websites: ['amazon', 'ebay']
  },
  EE: {
    code: 'EE',
    name: 'Estonia',
    currency: 'EUR',
    websites: ['amazon', 'ebay']
  },
  LV: {
    code: 'LV',
    name: 'Latvia',
    currency: 'EUR',
    websites: ['amazon', 'ebay']
  },
  LT: {
    code: 'LT',
    name: 'Lithuania',
    currency: 'EUR',
    websites: ['amazon', 'ebay']
  },
  IE: {
    code: 'IE',
    name: 'Ireland',
    currency: 'EUR',
    websites: ['amazon', 'ebay']
  },
  PT: {
    code: 'PT',
    name: 'Portugal',
    currency: 'EUR',
    websites: ['amazon', 'ebay']
  },
  GR: {
    code: 'GR',
    name: 'Greece',
    currency: 'EUR',
    websites: ['amazon', 'ebay']
  },
  CY: {
    code: 'CY',
    name: 'Cyprus',
    currency: 'EUR',
    websites: ['amazon', 'ebay']
  },
  MT: {
    code: 'MT',
    name: 'Malta',
    currency: 'EUR',
    websites: ['amazon', 'ebay']
  },
  LU: {
    code: 'LU',
    name: 'Luxembourg',
    currency: 'EUR',
    websites: ['amazon', 'ebay']
  },

  // Asia-Pacific
  IN: {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    websites: ['amazon', 'ebay', 'flipkart', 'generic']
  },
  CN: {
    code: 'CN',
    name: 'China',
    currency: 'CNY',
    websites: ['amazon', 'ebay', 'lazada', 'shopee', 'generic']
  },
  JP: {
    code: 'JP',
    name: 'Japan',
    currency: 'JPY',
    websites: ['amazon', 'ebay', 'lazada', 'shopee', 'flipkart', 'generic']
  },
  KR: {
    code: 'KR',
    name: 'South Korea',
    currency: 'KRW',
    websites: ['amazon', 'ebay', 'lazada', 'shopee', 'flipkart', 'generic']
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    websites: ['amazon', 'ebay', 'lazada', 'shopee', 'flipkart', 'generic']
  },
  NZ: {
    code: 'NZ',
    name: 'New Zealand',
    currency: 'NZD',
    websites: ['amazon', 'ebay', 'lazada', 'shopee', 'flipkart', 'generic']
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    currency: 'SGD',
    websites: ['amazon', 'ebay', 'lazada', 'shopee', 'flipkart', 'generic']
  },
  MY: {
    code: 'MY',
    name: 'Malaysia',
    currency: 'MYR',
    websites: ['amazon', 'ebay', 'lazada', 'shopee', 'flipkart', 'generic']
  },
  TH: {
    code: 'TH',
    name: 'Thailand',
    currency: 'THB',
    websites: ['amazon', 'ebay', 'lazada', 'shopee', 'flipkart', 'generic']
  },
  ID: {
    code: 'ID',
    name: 'Indonesia',
    currency: 'IDR',
    websites: ['amazon', 'ebay', 'lazada', 'shopee', 'flipkart', 'generic']
  },
  PH: {
    code: 'PH',
    name: 'Philippines',
    currency: 'PHP',
    websites: ['amazon', 'ebay', 'lazada', 'shopee', 'flipkart', 'generic']
  },
  VN: {
    code: 'VN',
    name: 'Vietnam',
    currency: 'VND',
    websites: ['amazon', 'ebay', 'lazada', 'shopee', 'flipkart', 'generic']
  },
  HK: {
    code: 'HK',
    name: 'Hong Kong',
    currency: 'HKD',
    websites: ['amazon', 'ebay', 'lazada', 'shopee', 'flipkart', 'generic']
  },
  TW: {
    code: 'TW',
    name: 'Taiwan',
    currency: 'TWD',
    websites: ['amazon', 'ebay', 'lazada', 'shopee', 'flipkart', 'generic']
  },

  // South America
  BR: {
    code: 'BR',
    name: 'Brazil',
    currency: 'BRL',
    websites: ['amazon', 'mercadolivre', 'americanas', 'submarino', 'casasbahia']
  },
  AR: {
    code: 'AR',
    name: 'Argentina',
    currency: 'ARS',
    websites: ['mercadolibre', 'amazon']
  },
  CL: {
    code: 'CL',
    name: 'Chile',
    currency: 'CLP',
    websites: ['mercadolibre', 'amazon', 'falabella']
  },
  CO: {
    code: 'CO',
    name: 'Colombia',
    currency: 'COP',
    websites: ['mercadolibre', 'amazon', 'falabella']
  },
  PE: {
    code: 'PE',
    name: 'Peru',
    currency: 'PEN',
    websites: ['mercadolibre', 'amazon', 'falabella']
  },
  UY: {
    code: 'UY',
    name: 'Uruguay',
    currency: 'UYU',
    websites: ['mercadolibre', 'amazon']
  },
  PY: {
    code: 'PY',
    name: 'Paraguay',
    currency: 'PYG',
    websites: ['mercadolibre', 'amazon']
  },
  BO: {
    code: 'BO',
    name: 'Bolivia',
    currency: 'BOB',
    websites: ['mercadolibre', 'amazon']
  },
  EC: {
    code: 'EC',
    name: 'Ecuador',
    currency: 'USD',
    websites: ['mercadolibre', 'amazon']
  },
  VE: {
    code: 'VE',
    name: 'Venezuela',
    currency: 'VES',
    websites: ['mercadolibre', 'amazon']
  },
  GY: {
    code: 'GY',
    name: 'Guyana',
    currency: 'GYD',
    websites: ['amazon', 'ebay']
  },
  SR: {
    code: 'SR',
    name: 'Suriname',
    currency: 'SRD',
    websites: ['amazon', 'ebay']
  },

  // Middle East
  AE: {
    code: 'AE',
    name: 'United Arab Emirates',
    currency: 'AED',
    websites: ['amazon', 'ebay', 'noon', 'carrefour']
  },
  SA: {
    code: 'SA',
    name: 'Saudi Arabia',
    currency: 'SAR',
    websites: ['amazon', 'ebay', 'noon', 'extra']
  },
  IL: {
    code: 'IL',
    name: 'Israel',
    currency: 'ILS',
    websites: ['amazon', 'ebay']
  },
  TR: {
    code: 'TR',
    name: 'Turkey',
    currency: 'TRY',
    websites: ['amazon', 'ebay', 'hepsiburada', 'trendyol']
  },
  EG: {
    code: 'EG',
    name: 'Egypt',
    currency: 'EGP',
    websites: ['amazon', 'ebay', 'jumia']
  },
  QA: {
    code: 'QA',
    name: 'Qatar',
    currency: 'QAR',
    websites: ['amazon', 'ebay']
  },
  KW: {
    code: 'KW',
    name: 'Kuwait',
    currency: 'KWD',
    websites: ['amazon', 'ebay']
  },
  BH: {
    code: 'BH',
    name: 'Bahrain',
    currency: 'BHD',
    websites: ['amazon', 'ebay']
  },
  OM: {
    code: 'OM',
    name: 'Oman',
    currency: 'OMR',
    websites: ['amazon', 'ebay']
  },
  JO: {
    code: 'JO',
    name: 'Jordan',
    currency: 'JOD',
    websites: ['amazon', 'ebay']
  },
  LB: {
    code: 'LB',
    name: 'Lebanon',
    currency: 'LBP',
    websites: ['amazon', 'ebay']
  },

  // Africa
  ZA: {
    code: 'ZA',
    name: 'South Africa',
    currency: 'ZAR',
    websites: ['amazon', 'ebay', 'takealot', 'makro']
  },
  NG: {
    code: 'NG',
    name: 'Nigeria',
    currency: 'NGN',
    websites: ['amazon', 'ebay', 'jumia', 'konga']
  },
  KE: {
    code: 'KE',
    name: 'Kenya',
    currency: 'KES',
    websites: ['amazon', 'ebay', 'jumia']
  },
  GH: {
    code: 'GH',
    name: 'Ghana',
    currency: 'GHS',
    websites: ['amazon', 'ebay', 'jumia']
  },
  MA: {
    code: 'MA',
    name: 'Morocco',
    currency: 'MAD',
    websites: ['amazon', 'ebay', 'jumia']
  },
  TN: {
    code: 'TN',
    name: 'Tunisia',
    currency: 'TND',
    websites: ['amazon', 'ebay', 'jumia']
  },
  DZ: {
    code: 'DZ',
    name: 'Algeria',
    currency: 'DZD',
    websites: ['amazon', 'ebay']
  },
  ET: {
    code: 'ET',
    name: 'Ethiopia',
    currency: 'ETB',
    websites: ['amazon', 'ebay']
  },
  UG: {
    code: 'UG',
    name: 'Uganda',
    currency: 'UGX',
    websites: ['amazon', 'ebay', 'jumia']
  },
  TZ: {
    code: 'TZ',
    name: 'Tanzania',
    currency: 'TZS',
    websites: ['amazon', 'ebay', 'jumia']
  },

  // Other regions
  RU: {
    code: 'RU',
    name: 'Russia',
    currency: 'RUB',
    websites: ['amazon', 'ebay', 'ozon', 'wildberries']
  },
  UA: {
    code: 'UA',
    name: 'Ukraine',
    currency: 'UAH',
    websites: ['amazon', 'ebay', 'rozetka']
  },
  BY: {
    code: 'BY',
    name: 'Belarus',
    currency: 'BYN',
    websites: ['amazon', 'ebay']
  },
  KZ: {
    code: 'KZ',
    name: 'Kazakhstan',
    currency: 'KZT',
    websites: ['amazon', 'ebay']
  },
  UZ: {
    code: 'UZ',
    name: 'Uzbekistan',
    currency: 'UZS',
    websites: ['amazon', 'ebay']
  },
  PK: {
    code: 'PK',
    name: 'Pakistan',
    currency: 'PKR',
    websites: ['amazon', 'ebay', 'daraz']
  },
  BD: {
    code: 'BD',
    name: 'Bangladesh',
    currency: 'BDT',
    websites: ['amazon', 'ebay', 'daraz']
  },
  LK: {
    code: 'LK',
    name: 'Sri Lanka',
    currency: 'LKR',
    websites: ['amazon', 'ebay', 'daraz']
  },
  NP: {
    code: 'NP',
    name: 'Nepal',
    currency: 'NPR',
    websites: ['amazon', 'ebay', 'daraz']
  },
  MM: {
    code: 'MM',
    name: 'Myanmar',
    currency: 'MMK',
    websites: ['amazon', 'ebay']
  },
  KH: {
    code: 'KH',
    name: 'Cambodia',
    currency: 'KHR',
    websites: ['amazon', 'ebay']
  },
  LA: {
    code: 'LA',
    name: 'Laos',
    currency: 'LAK',
    websites: ['amazon', 'ebay']
  },
  BN: {
    code: 'BN',
    name: 'Brunei',
    currency: 'BND',
    websites: ['amazon', 'ebay']
  },
  MN: {
    code: 'MN',
    name: 'Mongolia',
    currency: 'MNT',
    websites: ['amazon', 'ebay']
  },
  AF: {
    code: 'AF',
    name: 'Afghanistan',
    currency: 'AFN',
    websites: ['amazon', 'ebay']
  },
  IQ: {
    code: 'IQ',
    name: 'Iraq',
    currency: 'IQD',
    websites: ['amazon', 'ebay']
  },
  IR: {
    code: 'IR',
    name: 'Iran',
    currency: 'IRR',
    websites: ['amazon', 'ebay']
  },
  SY: {
    code: 'SY',
    name: 'Syria',
    currency: 'SYP',
    websites: ['amazon', 'ebay']
  },
  YE: {
    code: 'YE',
    name: 'Yemen',
    currency: 'YER',
    websites: ['amazon', 'ebay']
  }
};

export const getSupportedCountries = (): CountryConfig[] => {
  return Object.values(COUNTRY_CONFIGS);
};

export const getCountryConfig = (countryCode: string): CountryConfig | null => {
  return COUNTRY_CONFIGS[countryCode.toUpperCase()] || null;
};

export const isCountrySupported = (countryCode: string): boolean => {
  return countryCode.toUpperCase() in COUNTRY_CONFIGS;
};

/**
 * Get all available scrapers for any country
 */
export const getAllAvailableScrapers = (): string[] => {
  return ['amazon', 'ebay', 'flipkart', 'shopee', 'lazada', 'generic'];
};

/**
 * Update a country's website list to include all available scrapers
 */
export const updateCountryWithAllScrapers = (countryCode: string): string[] => {
  const allScrapers = getAllAvailableScrapers();
  const country = COUNTRY_CONFIGS[countryCode.toUpperCase()];

  if (country) {
    // Merge existing websites with all available scrapers, removing duplicates
    const updatedWebsites = [...new Set([...country.websites, ...allScrapers])];
    country.websites = updatedWebsites;
    return updatedWebsites;
  }

  return allScrapers;
};

/**
 * Ensure all countries have access to all scrapers
 */
export const ensureAllCountriesHaveAllScrapers = (): void => {
  const allScrapers = getAllAvailableScrapers();

  Object.keys(COUNTRY_CONFIGS).forEach(countryCode => {
    const country = COUNTRY_CONFIGS[countryCode];
    // Merge existing websites with all available scrapers
    country.websites = [...new Set([...country.websites, ...allScrapers])];
  });
};

// Initialize all countries with all scrapers
ensureAllCountriesHaveAllScrapers();
