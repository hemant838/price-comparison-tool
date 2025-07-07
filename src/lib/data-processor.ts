import { ProductResult } from './types';
import { CurrencyConverter } from './currency-converter';

export interface ProcessingOptions {
  targetCurrency?: string;
  sortBy?: 'price' | 'rating' | 'website' | 'name';
  sortOrder?: 'asc' | 'desc';
  minRating?: number;
  maxPrice?: number;
  websites?: string[];
  includeOutOfStock?: boolean;
}

export interface ProcessedResult extends ProductResult {
  normalizedPrice: number;
  priceInTargetCurrency?: number;
  targetCurrency?: string;
  score: number; // Overall quality score
}

export class DataProcessor {
  private currencyConverter: CurrencyConverter;

  constructor() {
    this.currencyConverter = CurrencyConverter.getInstance();
  }

  /**
   * Process and rank product results
   */
  async processResults(
    products: ProductResult[],
    options: ProcessingOptions = {}
  ): Promise<ProcessedResult[]> {
    // Update currency rates
    await this.currencyConverter.updateRates();

    // Convert products to processed results
    let processedProducts = products.map(product => this.processProduct(product, options));

    // Apply filters
    processedProducts = this.applyFilters(processedProducts, options);

    // Sort results
    processedProducts = this.sortResults(processedProducts, options);

    return processedProducts;
  }

  /**
   * Process a single product
   */
  private processProduct(product: ProductResult, options: ProcessingOptions): ProcessedResult {
    const normalizedPrice = this.currencyConverter.parsePrice(product.price);
    
    let priceInTargetCurrency: number | undefined;
    if (options.targetCurrency && options.targetCurrency !== product.currency) {
      priceInTargetCurrency = this.currencyConverter.convert(
        normalizedPrice,
        product.currency,
        options.targetCurrency
      );
    }

    const score = this.calculateQualityScore(product);

    return {
      ...product,
      normalizedPrice,
      priceInTargetCurrency,
      targetCurrency: options.targetCurrency,
      score
    };
  }

  /**
   * Calculate quality score for a product
   */
  private calculateQualityScore(product: ProductResult): number {
    let score = 0;

    // Rating contribution (0-40 points)
    if (product.rating) {
      score += (product.rating / 5) * 40;
    }

    // Review count contribution (0-20 points)
    if (product.reviewCount) {
      const reviewScore = Math.min(product.reviewCount / 1000, 1) * 20;
      score += reviewScore;
    }

    // Availability contribution (0-20 points)
    if (product.availability) {
      const availability = product.availability.toLowerCase();
      if (availability.includes('in stock') || availability.includes('available')) {
        score += 20;
      } else if (availability.includes('limited') || availability.includes('few left')) {
        score += 15;
      } else if (availability.includes('out of stock')) {
        score += 0;
      } else {
        score += 10; // Unknown availability
      }
    }

    // Website reputation (0-10 points)
    const websiteScores: Record<string, number> = {
      'Amazon': 10,
      'eBay': 8,
      'Flipkart': 9,
      'Walmart': 9,
      'Best Buy': 8,
      'Target': 8
    };
    score += websiteScores[product.website] || 5;

    // Shipping info bonus (0-10 points)
    if (product.shippingInfo) {
      const shipping = product.shippingInfo.toLowerCase();
      if (shipping.includes('free')) {
        score += 10;
      } else if (shipping.includes('fast') || shipping.includes('express')) {
        score += 8;
      } else {
        score += 5;
      }
    }

    return Math.round(score);
  }

  /**
   * Apply filters to processed results
   */
  private applyFilters(
    products: ProcessedResult[],
    options: ProcessingOptions
  ): ProcessedResult[] {
    return products.filter(product => {
      // Rating filter
      if (options.minRating && product.rating && product.rating < options.minRating) {
        return false;
      }

      // Price filter
      if (options.maxPrice) {
        const priceToCheck = options.targetCurrency && product.priceInTargetCurrency
          ? product.priceInTargetCurrency
          : product.normalizedPrice;
        
        if (priceToCheck > options.maxPrice) {
          return false;
        }
      }

      // Website filter
      if (options.websites && options.websites.length > 0) {
        if (!options.websites.includes(product.website)) {
          return false;
        }
      }

      // Stock filter
      if (!options.includeOutOfStock && product.availability) {
        const availability = product.availability.toLowerCase();
        if (availability.includes('out of stock') || availability.includes('unavailable')) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sort results based on options
   */
  private sortResults(
    products: ProcessedResult[],
    options: ProcessingOptions
  ): ProcessedResult[] {
    const sortBy = options.sortBy || 'price';
    const sortOrder = options.sortOrder || 'asc';

    return products.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'price':
          const priceA = options.targetCurrency && a.priceInTargetCurrency
            ? a.priceInTargetCurrency
            : a.normalizedPrice;
          const priceB = options.targetCurrency && b.priceInTargetCurrency
            ? b.priceInTargetCurrency
            : b.normalizedPrice;
          comparison = priceA - priceB;
          break;

        case 'rating':
          const ratingA = a.rating || 0;
          const ratingB = b.rating || 0;
          comparison = ratingB - ratingA; // Higher rating first by default
          break;

        case 'website':
          comparison = a.website.localeCompare(b.website);
          break;

        case 'name':
          comparison = a.productName.localeCompare(b.productName);
          break;

        default:
          comparison = a.score - b.score;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Get statistics about the results
   */
  getStatistics(products: ProcessedResult[]): {
    totalProducts: number;
    averagePrice: number;
    priceRange: { min: number; max: number };
    averageRating: number;
    websiteDistribution: Record<string, number>;
    currencyDistribution: Record<string, number>;
  } {
    if (products.length === 0) {
      return {
        totalProducts: 0,
        averagePrice: 0,
        priceRange: { min: 0, max: 0 },
        averageRating: 0,
        websiteDistribution: {},
        currencyDistribution: {}
      };
    }

    const prices = products.map(p => p.normalizedPrice).filter(p => p > 0);
    const ratings = products.map(p => p.rating).filter(r => r !== undefined) as number[];

    const websiteDistribution: Record<string, number> = {};
    const currencyDistribution: Record<string, number> = {};

    products.forEach(product => {
      websiteDistribution[product.website] = (websiteDistribution[product.website] || 0) + 1;
      currencyDistribution[product.currency] = (currencyDistribution[product.currency] || 0) + 1;
    });

    return {
      totalProducts: products.length,
      averagePrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
      priceRange: {
        min: prices.length > 0 ? Math.min(...prices) : 0,
        max: prices.length > 0 ? Math.max(...prices) : 0
      },
      averageRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0,
      websiteDistribution,
      currencyDistribution
    };
  }

  /**
   * Remove duplicate products based on similarity
   */
  removeDuplicates(products: ProcessedResult[], threshold: number = 0.8): ProcessedResult[] {
    const unique: ProcessedResult[] = [];

    for (const product of products) {
      const isDuplicate = unique.some(existing => 
        this.calculateSimilarity(product, existing) > threshold
      );

      if (!isDuplicate) {
        unique.push(product);
      }
    }

    return unique;
  }

  /**
   * Calculate similarity between two products
   */
  private calculateSimilarity(product1: ProcessedResult, product2: ProcessedResult): number {
    // Name similarity (using simple word overlap)
    const words1 = product1.productName.toLowerCase().split(/\s+/);
    const words2 = product2.productName.toLowerCase().split(/\s+/);
    const commonWords = words1.filter(word => words2.includes(word));
    const nameSimilarity = commonWords.length / Math.max(words1.length, words2.length);

    // Price similarity (within 10% considered similar)
    const priceDiff = Math.abs(product1.normalizedPrice - product2.normalizedPrice);
    const avgPrice = (product1.normalizedPrice + product2.normalizedPrice) / 2;
    const priceSimilarity = avgPrice > 0 ? Math.max(0, 1 - (priceDiff / avgPrice) / 0.1) : 1;

    // Website similarity (same website = higher similarity)
    const websiteSimilarity = product1.website === product2.website ? 0.3 : 0;

    return (nameSimilarity * 0.6) + (priceSimilarity * 0.3) + websiteSimilarity;
  }
}
