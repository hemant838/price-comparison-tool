import { ProductResult, AIMatchingResult } from './types';

export class AIProductMatcher {
  private static instance: AIProductMatcher;

  private constructor() {}

  public static getInstance(): AIProductMatcher {
    if (!AIProductMatcher.instance) {
      AIProductMatcher.instance = new AIProductMatcher();
    }
    return AIProductMatcher.instance;
  }

  /**
   * Uses AI to determine if a scraped product matches the user's query
   */
  async matchProduct(
    userQuery: string,
    product: ProductResult
  ): Promise<AIMatchingResult> {
    try {
      // For now, we'll use a simple text-based matching algorithm
      // In a production environment, you would integrate with OpenAI or another LLM
      const matchResult = this.simpleTextMatch(userQuery, product);
      
      // TODO: Replace with actual AI/LLM integration
      // const aiResult = await this.callOpenAI(userQuery, product);
      
      return matchResult;
    } catch (error) {
      console.error('Error in AI matching:', error);
      return {
        isMatch: false,
        confidence: 0,
        reason: 'Error in AI matching service'
      };
    }
  }

  /**
   * Enhanced text-based matching that prioritizes complete query matching
   */
  private simpleTextMatch(
    userQuery: string,
    product: ProductResult
  ): AIMatchingResult {
    const queryLower = userQuery.toLowerCase().trim();
    const productText = `${product.productName} ${product.link}`.toLowerCase();

    // Check for exact query match first (highest confidence)
    if (productText.includes(queryLower)) {
      return {
        isMatch: true,
        confidence: 1.0,
        reason: 'Exact query match found'
      };
    }

    // Check for partial query matches (phrases)
    const queryPhrases = this.extractPhrases(queryLower);
    let phraseMatches = 0;
    const matchedPhrases: string[] = [];

    for (const phrase of queryPhrases) {
      if (phrase.length > 3 && productText.includes(phrase)) {
        phraseMatches++;
        matchedPhrases.push(phrase);
      }
    }

    if (phraseMatches > 0) {
      const phraseConfidence = Math.min(0.9, (phraseMatches / queryPhrases.length) * 0.8 + 0.1);
      return {
        isMatch: phraseConfidence >= 0.5,
        confidence: Math.round(phraseConfidence * 100) / 100,
        reason: `Matched phrases: ${matchedPhrases.join(', ')}`
      };
    }

    // Fallback to word matching but with much stricter requirements
    const brands = this.extractBrands(queryLower);
    const models = this.extractModels(queryLower);

    // For word-by-word matching, we need at least one brand match
    let hasBrandMatch = false;
    for (const brand of brands) {
      if (productText.includes(brand.toLowerCase())) {
        hasBrandMatch = true;
        break;
      }
    }

    // If no brand match, reject immediately
    if (!hasBrandMatch && brands.length > 0) {
      return {
        isMatch: false,
        confidence: 0,
        reason: `No brand match found. Expected: ${brands.join(', ')}`
      };
    }

    // Check for model/specification matches
    let modelMatches = 0;
    const matchedModels: string[] = [];

    for (const model of models) {
      if (productText.includes(model.toLowerCase())) {
        modelMatches++;
        matchedModels.push(model);
      }
    }

    // Calculate confidence based on brand + model matches
    let confidence = 0;
    if (hasBrandMatch && modelMatches > 0) {
      confidence = 0.8; // Good match with brand and model
    } else if (hasBrandMatch) {
      confidence = 0.5; // Partial match with brand only
    }

    const isMatch = confidence >= 0.7; // Only accept high-confidence matches

    return {
      isMatch,
      confidence: Math.round(confidence * 100) / 100,
      reason: isMatch
        ? `Brand + model match: ${matchedModels.join(', ')}`
        : hasBrandMatch
          ? `Brand match only, missing model: ${models.join(', ')}`
          : 'No significant matches'
    };
  }

  /**
   * Extract meaningful phrases from the query
   */
  private extractPhrases(query: string): string[] {
    const phrases: string[] = [];
    const words = query.split(/\s+/);

    // Extract 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (phrase.length > 4) {
        phrases.push(phrase);
      }
    }

    // Extract 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (phrase.length > 8) {
        phrases.push(phrase);
      }
    }

    return phrases;
  }



  /**
   * Enhanced product matching with strict whole-query validation
   */
  async enhancedMatch(
    userQuery: string,
    product: ProductResult
  ): Promise<AIMatchingResult> {
    const queryLower = userQuery.toLowerCase().trim();
    const productText = product.productName.toLowerCase();

    // First check for exact or near-exact query match
    const exactMatch = this.checkExactMatch(queryLower, productText);
    if (exactMatch.isMatch) {
      return exactMatch;
    }

    // Then check for semantic similarity with the complete query
    const semanticMatch = this.checkSemanticMatch(queryLower, productText);
    if (semanticMatch.isMatch) {
      return semanticMatch;
    }

    // Extract and validate brands and models
    const brands = this.extractBrands(userQuery);
    const models = this.extractModels(userQuery);
    const specifications = this.extractSpecifications(userQuery);

    let brandMatch = false;
    let modelMatch = false;
    let specMatch = false;

    // Check brand matches
    for (const brand of brands) {
      if (productText.includes(brand.toLowerCase())) {
        brandMatch = true;
        break;
      }
    }

    // Check model matches
    for (const model of models) {
      if (productText.includes(model.toLowerCase())) {
        modelMatch = true;
        break;
      }
    }

    // Check specification matches
    let matchedSpecs = 0;
    for (const spec of specifications) {
      if (productText.includes(spec.toLowerCase())) {
        matchedSpecs++;
      }
    }
    specMatch = specifications.length > 0 && matchedSpecs >= Math.ceil(specifications.length * 0.5);

    // Calculate confidence with stricter requirements
    let confidence = 0;
    let reason = '';

    if (brandMatch && modelMatch && specMatch) {
      confidence = 0.95;
      reason = 'Complete match: brand, model, and specifications';
    } else if (brandMatch && modelMatch) {
      confidence = 0.85;
      reason = 'Strong match: brand and model';
    } else if (brandMatch && specMatch) {
      confidence = 0.75;
      reason = 'Good match: brand and specifications';
    } else if (brandMatch || modelMatch) {
      confidence = 0.6;
      reason = brandMatch ? 'Partial match: brand only' : 'Partial match: model only';
    } else {
      // Fall back to strict text matching
      return this.simpleTextMatch(userQuery, product);
    }

    return {
      isMatch: confidence >= 0.7, // Increased threshold
      confidence,
      reason
    };
  }

  /**
   * Check for exact or near-exact matches
   */
  private checkExactMatch(query: string, productText: string): AIMatchingResult {
    // Direct substring match
    if (productText.includes(query)) {
      return {
        isMatch: true,
        confidence: 1.0,
        reason: 'Exact query match'
      };
    }

    // Check with minor variations (remove punctuation, extra spaces)
    const cleanQuery = query.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    const cleanProduct = productText.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();

    if (cleanProduct.includes(cleanQuery)) {
      return {
        isMatch: true,
        confidence: 0.95,
        reason: 'Near-exact query match (normalized)'
      };
    }

    return { isMatch: false, confidence: 0, reason: 'No exact match' };
  }

  /**
   * Check semantic similarity between query and product
   */
  private checkSemanticMatch(query: string, productText: string): AIMatchingResult {
    const queryWords = query.split(/\s+/).filter(w => w.length > 2);
    const productWords = productText.split(/\s+/).filter(w => w.length > 2);

    // Calculate word order similarity
    let maxSequence = 0;
    let currentSequence = 0;

    for (let i = 0; i < queryWords.length; i++) {
      const word = queryWords[i];
      const productIndex = productWords.findIndex(pw => pw.includes(word) || word.includes(pw));

      if (productIndex !== -1) {
        currentSequence++;
        maxSequence = Math.max(maxSequence, currentSequence);
      } else {
        currentSequence = 0;
      }
    }

    const sequenceRatio = queryWords.length > 0 ? maxSequence / queryWords.length : 0;

    if (sequenceRatio >= 0.8 && maxSequence >= 3) {
      return {
        isMatch: true,
        confidence: 0.9,
        reason: `High semantic similarity (${maxSequence}/${queryWords.length} words in sequence)`
      };
    }

    return { isMatch: false, confidence: sequenceRatio, reason: 'Low semantic similarity' };
  }

  /**
   * Extract specifications from query (storage, color, size, etc.)
   */
  private extractSpecifications(query: string): string[] {
    const specs: string[] = [];
    const specPatterns = [
      /\b(\d+)\s*(gb|tb|mb)\b/gi,  // Storage: 128GB, 1TB
      /\b(\d+)\s*(inch|"|'')\b/gi,  // Size: 6.1 inch, 13"
      /\b(black|white|blue|red|green|gold|silver|gray|grey|pink|purple|yellow|orange)\b/gi, // Colors
      /\b(pro|max|plus|mini|air|ultra|lite|standard)\b/gi, // Variants
      /\b(\d+)\s*(mp|megapixel)\b/gi, // Camera: 12MP
      /\b(\d+)\s*(mah|watt|w)\b/gi, // Battery/Power: 3000mAh, 20W
    ];

    for (const pattern of specPatterns) {
      const matches = query.match(pattern);
      if (matches) {
        specs.push(...matches.map(m => m.toLowerCase()));
      }
    }

    return [...new Set(specs)]; // Remove duplicates
  }

  /**
   * Extract brand names from query with exact word matching
   */
  private extractBrands(query: string): string[] {
    const commonBrands = [
      'apple', 'samsung', 'google', 'oneplus', 'xiaomi', 'huawei', 'oppo', 'vivo',
      'sony', 'lg', 'motorola', 'nokia', 'realme', 'boat', 'jbl', 'bose',
      'nike', 'adidas', 'puma', 'reebok', 'dell', 'hp', 'lenovo', 'asus',
      'acer', 'msi', 'razer', 'logitech', 'corsair', 'steelseries', 'sennheiser',
      'skullcandy', 'beats', 'airpods', 'galaxy', 'iphone', 'pixel', 'redmi'
    ];

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    // Use exact word matching instead of substring matching
    return commonBrands.filter(brand => {
      // Check if brand appears as a complete word
      return queryWords.includes(brand) ||
             queryLower.includes(` ${brand} `) ||
             queryLower.startsWith(`${brand} `) ||
             queryLower.endsWith(` ${brand}`);
    });
  }

  /**
   * Extract model numbers/names from query with better patterns
   */
  private extractModels(query: string): string[] {
    // Extract patterns that look like model numbers
    const modelPatterns = [
      /\b(airdopes)\s*\d+\s*(pro|max|plus|mini|air|ultra)?\b/gi, // boAt Airdopes models
      /\b\d+\s*(gb|tb|pro|max|plus|mini|air|ultra)\b/gi, // Storage + variant
      /\b(iphone|galaxy|pixel|oneplus)\s*\d+\s*(pro|max|plus|mini|air|ultra)?\b/gi, // Phone models
      /\b\w+\s*\d{3,4}\s*(pro|max|plus|mini|air|ultra)?\b/gi, // Generic model numbers
      /\b(pro|max|plus|mini|air|ultra)\s*\d+\b/gi // Variant + number
    ];

    const models: string[] = [];
    for (const pattern of modelPatterns) {
      const matches = query.match(pattern);
      if (matches) {
        models.push(...matches.map(m => m.toLowerCase().trim()));
      }
    }

    // Also extract specific product names
    const productPatterns = [
      /\b(airdopes\s*\d+\s*pro)\b/gi,
      /\b(airpods\s*pro)\b/gi,
      /\b(galaxy\s*buds)\b/gi
    ];

    for (const pattern of productPatterns) {
      const matches = query.match(pattern);
      if (matches) {
        models.push(...matches.map(m => m.toLowerCase().trim()));
      }
    }

    return [...new Set(models)]; // Remove duplicates
  }

  /**
   * Batch process multiple products with strict filtering
   */
  async batchMatch(
    userQuery: string,
    products: ProductResult[]
  ): Promise<(ProductResult & { matchResult: AIMatchingResult })[]> {
    const results = await Promise.all(
      products.map(async (product) => {
        const matchResult = await this.enhancedMatch(userQuery, product);
        return { ...product, matchResult };
      })
    );

    // Filter with stricter criteria and sort by confidence
    const filteredResults = results
      .filter(result => result.matchResult.isMatch && result.matchResult.confidence >= 0.7)
      .sort((a, b) => {
        // Primary sort: confidence (descending)
        if (b.matchResult.confidence !== a.matchResult.confidence) {
          return b.matchResult.confidence - a.matchResult.confidence;
        }
        // Secondary sort: price (ascending)
        const priceA = parseFloat(a.price) || 0;
        const priceB = parseFloat(b.price) || 0;
        return priceA - priceB;
      });

    // If we have very few high-confidence results, include medium-confidence ones
    if (filteredResults.length < 5) {
      const mediumConfidenceResults = results
        .filter(result =>
          result.matchResult.isMatch &&
          result.matchResult.confidence >= 0.5 &&
          result.matchResult.confidence < 0.7 &&
          !filteredResults.some(fr => fr.link === result.link) // Avoid duplicates
        )
        .sort((a, b) => b.matchResult.confidence - a.matchResult.confidence)
        .slice(0, 10 - filteredResults.length); // Fill up to 10 total results

      filteredResults.push(...mediumConfidenceResults);
    }

    return filteredResults;
  }

  /**
   * Get match statistics for debugging
   */
  async getMatchStatistics(
    userQuery: string,
    products: ProductResult[]
  ): Promise<{
    totalProducts: number;
    exactMatches: number;
    highConfidenceMatches: number;
    mediumConfidenceMatches: number;
    lowConfidenceMatches: number;
    noMatches: number;
    averageConfidence: number;
  }> {
    const results = await Promise.all(
      products.map(async (product) => {
        const matchResult = await this.enhancedMatch(userQuery, product);
        return matchResult;
      })
    );

    const exactMatches = results.filter(r => r.confidence >= 0.95).length;
    const highConfidenceMatches = results.filter(r => r.confidence >= 0.8 && r.confidence < 0.95).length;
    const mediumConfidenceMatches = results.filter(r => r.confidence >= 0.5 && r.confidence < 0.8).length;
    const lowConfidenceMatches = results.filter(r => r.confidence >= 0.3 && r.confidence < 0.5).length;
    const noMatches = results.filter(r => r.confidence < 0.3).length;
    const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

    return {
      totalProducts: products.length,
      exactMatches,
      highConfidenceMatches,
      mediumConfidenceMatches,
      lowConfidenceMatches,
      noMatches,
      averageConfidence: Math.round(averageConfidence * 100) / 100
    };
  }
}
