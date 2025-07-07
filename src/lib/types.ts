export interface ProductSearchRequest {
  country: string;
  query: string;
}

export interface ProductResult {
  link: string;
  price: string;
  currency: string;
  productName: string;
  website: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  availability?: string;
  shippingInfo?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // For additional parameters
}

export interface ScrapingResult {
  success: boolean;
  products: ProductResult[];
  error?: string;
  website: string;
}

export interface WebsiteScraper {
  name: string;
  baseUrl: string;
  supportedCountries: string[];
  scrape(query: string, country: string): Promise<ScrapingResult>;
}

export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  websites: string[];
}

export interface AIMatchingResult {
  isMatch: boolean;
  confidence: number;
  reason?: string;
}
