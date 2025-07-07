'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ProductResult, CountryConfig } from '@/lib/types';

interface SearchResponse {
  success: boolean;
  data?: {
    products: ProductResult[];
    summary: {
      totalProducts: number;
      successfulSites: number;
      failedSites: number;
      websites: string[];
      totalPages: number;
      retryAttempts?: number;
    };
    statistics: {
      websiteBreakdown: Record<string, number>;
      currencyBreakdown: Record<string, number>;
      priceRanges: Record<string, { min: number; max: number; avg: number }>;
      totalUniqueProducts: number;
    };
    query: string;
    country: string;
    timestamp: string;
    pagination: {
      maxPages: number;
      comprehensive: boolean;
      retryFailedSites: boolean;
    };
  };
  errors?: string[];
  error?: string;
}

export default function PriceComparisonTool() {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [countries, setCountries] = useState<CountryConfig[]>([]);
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchSummary, setSearchSummary] = useState<{
    totalProducts: number;
    successfulSites: number;
    failedSites: number;
    websites: string[];
    totalPages: number;
    retryAttempts?: number;
  } | null>(null);
  const [searchStats, setSearchStats] = useState<{
    websiteBreakdown: Record<string, number>;
    currencyBreakdown: Record<string, number>;
    priceRanges: Record<string, { min: number; max: number; avg: number }>;
    totalUniqueProducts: number;
  } | null>(null);
  const [maxPages, setMaxPages] = useState(3);
  const [comprehensive, setComprehensive] = useState(true);
  const [retryFailedSites, setRetryFailedSites] = useState(true);

  // Load countries on component mount
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('/api/countries');
        const data = await response.json();
        if (data.success) {
          setCountries(data.data);
        }
      } catch (error) {
        console.error('Failed to load countries:', error);
      }
    };

    loadCountries();
  }, []);

  const handleSearch = async () => {
    if (!query.trim() || !country) {
      setError('Please enter a search query and select a country');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setSearchSummary(null);
    setSearchStats(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          country: country,
          maxPages,
          comprehensive,
          retryFailedSites,
        }),
      });

      const data: SearchResponse = await response.json();

      if (data.success && data.data) {
        setResults(data.data.products);
        setSearchSummary(data.data.summary);
        setSearchStats(data.data.statistics);
        if (data.errors && data.errors.length > 0) {
          setError(`Some websites failed: ${data.errors.join(', ')}`);
        }
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatPrice = (price: string, currency: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return `${currency} ${price}`;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numPrice);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search Products</CardTitle>
          <CardDescription>
            Enter a product name and select your country to find the best prices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="e.g., iPhone 16 Pro, 128GB"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full"
                />
              </div>
              <div className="w-full sm:w-48">
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !query.trim() || !country}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {/* Advanced Options */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Pages per site:</label>
                <Select value={maxPages.toString()} onValueChange={(value) => setMaxPages(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="comprehensive"
                  checked={comprehensive}
                  onChange={(e) => setComprehensive(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="comprehensive" className="text-sm">Comprehensive search</label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="retryFailed"
                  checked={retryFailedSites}
                  onChange={(e) => setRetryFailedSites(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="retryFailed" className="text-sm">Retry failed sites</label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Summary */}
      {searchSummary && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{searchSummary.totalProducts}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Products Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{searchSummary.successfulSites}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Successful Sites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{searchSummary.totalPages || 0}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Pages Scraped</div>
              </div>
              {searchSummary.retryAttempts !== undefined && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{searchSummary.retryAttempts}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Retry Attempts</div>
                </div>
              )}
            </div>

            {searchStats && (
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Website Coverage:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(searchStats.websiteBreakdown).map(([website, count]) => (
                    <Badge key={website} variant="outline">
                      {website}: {count as number}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {searchSummary.failedSites > 0 && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <div className="text-amber-700 dark:text-amber-300 text-sm">
                  ⚠️ {searchSummary.failedSites} websites failed to respond. This is normal due to anti-bot protection.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Price Comparison Results</CardTitle>
            <CardDescription>
              Results sorted by price (lowest first)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Availability</TableHead>
                    <TableHead>Link</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.imageUrl && (
                            <Image
                              src={product.imageUrl}
                              alt={product.productName}
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <div className="font-medium text-sm">
                              {product.productName}
                            </div>
                            {product.shippingInfo && (
                              <div className="text-xs text-slate-500">
                                {product.shippingInfo}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          {formatPrice(product.price, product.currency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.website}</Badge>
                      </TableCell>
                      <TableCell>
                        {product.rating && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm">⭐ {product.rating}</span>
                            {product.reviewCount && (
                              <span className="text-xs text-slate-500">
                                ({product.reviewCount})
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.availability && (
                          <Badge 
                            variant={product.availability.toLowerCase().includes('stock') ? 'default' : 'secondary'}
                          >
                            {product.availability}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <a 
                            href={product.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && searchSummary && (
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-slate-500 dark:text-slate-400">
              No products found matching your search criteria.
              <br />
              Try adjusting your search terms or selecting a different country.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
