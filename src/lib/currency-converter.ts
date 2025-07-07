export interface ExchangeRates {
  [currency: string]: number;
}

export class CurrencyConverter {
  private static instance: CurrencyConverter;
  private rates: ExchangeRates = {};
  private lastUpdated: Date | null = null;
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  private constructor() {
    // Initialize with comprehensive exchange rates (fallback)
    this.rates = {
      // Major currencies
      'USD': 1.0,
      'EUR': 0.85,
      'GBP': 0.73,
      'JPY': 110.0,
      'CHF': 0.92,
      'CAD': 1.25,
      'AUD': 1.35,
      'NZD': 1.45,

      // Asian currencies
      'INR': 74.0,
      'CNY': 6.45,
      'KRW': 1180.0,
      'SGD': 1.35,
      'MYR': 4.15,
      'THB': 33.0,
      'IDR': 14500.0,
      'PHP': 50.0,
      'VND': 23000.0,
      'HKD': 7.8,
      'TWD': 28.0,
      'PKR': 155.0,
      'BDT': 85.0,
      'LKR': 200.0,
      'NPR': 118.0,
      'MMK': 1400.0,
      'KHR': 4100.0,
      'LAK': 8500.0,
      'BND': 1.35,
      'MNT': 2550.0,
      'AFN': 75.0,

      // European currencies (non-EUR)
      'SEK': 8.5,
      'NOK': 8.8,
      'DKK': 6.3,
      'PLN': 3.9,
      'CZK': 21.5,
      'HUF': 295.0,
      'RON': 4.2,
      'BGN': 1.66,
      'RUB': 75.0,
      'UAH': 27.0,
      'BYN': 2.5,
      'KZT': 425.0,
      'UZS': 10500.0,
      'TRY': 8.5,

      // Middle Eastern currencies
      'AED': 3.67,
      'SAR': 3.75,
      'ILS': 3.2,
      'EGP': 15.7,
      'QAR': 3.64,
      'KWD': 0.30,
      'BHD': 0.38,
      'OMR': 0.38,
      'JOD': 0.71,
      'LBP': 1500.0,
      'IQD': 1460.0,
      'IRR': 42000.0,
      'SYP': 2500.0,
      'YER': 250.0,

      // South American currencies
      'BRL': 5.2,
      'MXN': 20.0,
      'ARS': 98.0,
      'CLP': 750.0,
      'COP': 3600.0,
      'PEN': 3.6,
      'UYU': 43.0,
      'PYG': 6800.0,
      'BOB': 6.9,
      'VES': 4.2,
      'GYD': 209.0,
      'SRD': 14.3,

      // African currencies
      'ZAR': 14.5,
      'NGN': 410.0,
      'KES': 108.0,
      'GHS': 5.8,
      'MAD': 9.0,
      'TND': 2.8,
      'DZD': 135.0,
      'ETB': 44.0,
      'UGX': 3550.0,
      'TZS': 2300.0
    };
  }

  public static getInstance(): CurrencyConverter {
    if (!CurrencyConverter.instance) {
      CurrencyConverter.instance = new CurrencyConverter();
    }
    return CurrencyConverter.instance;
  }

  /**
   * Convert amount from one currency to another
   */
  convert(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;

    const fromRate = this.rates[fromCurrency];
    const toRate = this.rates[toCurrency];

    if (!fromRate || !toRate) {
      console.warn(`Exchange rate not available for ${fromCurrency} or ${toCurrency}`);
      return amount; // Return original amount if conversion not possible
    }

    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    return usdAmount * toRate;
  }

  /**
   * Get exchange rate between two currencies
   */
  getRate(fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return 1;

    const fromRate = this.rates[fromCurrency];
    const toRate = this.rates[toCurrency];

    if (!fromRate || !toRate) return 1;

    return toRate / fromRate;
  }

  /**
   * Update exchange rates from external API
   * In a production environment, you would use a real exchange rate API
   */
  async updateRates(): Promise<boolean> {
    try {
      // Check if rates are still fresh
      if (this.lastUpdated && 
          Date.now() - this.lastUpdated.getTime() < this.CACHE_DURATION) {
        return true;
      }

      // In a real implementation, you would fetch from an API like:
      // - https://api.exchangerate-api.com/v4/latest/USD
      // - https://api.fixer.io/latest
      // - https://openexchangerates.org/api/latest.json

      // For now, we'll simulate an API call with updated rates
      await this.simulateApiCall();
      
      this.lastUpdated = new Date();
      return true;
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
      return false;
    }
  }

  /**
   * Simulate API call for exchange rates
   */
  private async simulateApiCall(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate some rate fluctuation
        const fluctuation = () => 0.95 + Math.random() * 0.1; // ±5% fluctuation

        // Apply fluctuation to all existing rates except USD
        const updatedRates: ExchangeRates = { 'USD': 1.0 };

        Object.entries(this.rates).forEach(([currency, rate]) => {
          if (currency !== 'USD') {
            updatedRates[currency] = rate * fluctuation();
          }
        });

        this.rates = updatedRates;
        resolve();
      }, 100); // Simulate network delay
    });
  }

  /**
   * Get all available currencies
   */
  getAvailableCurrencies(): string[] {
    return Object.keys(this.rates);
  }

  /**
   * Format currency amount with proper symbol and formatting
   */
  formatCurrency(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch {
      // Fallback formatting if currency is not supported
      const symbols: Record<string, string> = {
        'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥', 'CHF': 'CHF',
        'CAD': 'C$', 'AUD': 'A$', 'NZD': 'NZ$', 'INR': '₹', 'CNY': '¥',
        'KRW': '₩', 'SGD': 'S$', 'MYR': 'RM', 'THB': '฿', 'IDR': 'Rp',
        'PHP': '₱', 'VND': '₫', 'HKD': 'HK$', 'TWD': 'NT$', 'PKR': '₨',
        'BDT': '৳', 'LKR': 'Rs', 'NPR': 'Rs', 'SEK': 'kr', 'NOK': 'kr',
        'DKK': 'kr', 'PLN': 'zł', 'CZK': 'Kč', 'HUF': 'Ft', 'RON': 'lei',
        'BGN': 'лв', 'RUB': '₽', 'UAH': '₴', 'TRY': '₺', 'AED': 'د.إ',
        'SAR': 'ر.س', 'ILS': '₪', 'EGP': 'ج.م', 'QAR': 'ر.ق', 'KWD': 'د.ك',
        'BHD': '.د.ب', 'OMR': 'ر.ع.', 'JOD': 'د.ا', 'BRL': 'R$', 'MXN': 'MX$',
        'ARS': '$', 'CLP': '$', 'COP': '$', 'PEN': 'S/', 'ZAR': 'R',
        'NGN': '₦', 'KES': 'KSh', 'GHS': '₵', 'MAD': 'د.م.'
      };
      
      const symbol = symbols[currency] || currency;
      return `${symbol}${amount.toFixed(2)}`;
    }
  }

  /**
   * Convert price string to number
   */
  parsePrice(priceString: string): number {
    if (!priceString) return 0;
    
    // Remove currency symbols and non-numeric characters except decimal points
    const cleaned = priceString.replace(/[^\d.,]/g, '');
    
    // Handle different decimal separators
    const normalized = cleaned.replace(/,/g, '.');
    
    return parseFloat(normalized) || 0;
  }
}
