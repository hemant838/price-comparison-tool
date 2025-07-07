import { NextRequest, NextResponse } from 'next/server';
import { ScraperManager } from '@/lib/scraper-manager';
import { ProductSearchRequest } from '@/lib/types';
import { isCountrySupported } from '@/lib/countries';

const scraperManager = new ScraperManager();

export async function POST(request: NextRequest) {
  try {
    const body: ProductSearchRequest & {
      maxPages?: number;
      comprehensive?: boolean;
      retryFailedSites?: boolean;
    } = await request.json();
    const { country, query, maxPages = 3, comprehensive = true, retryFailedSites = true } = body;

    // Validate input
    if (!country || !query) {
      return NextResponse.json(
        { error: 'Country and query are required' },
        { status: 400 }
      );
    }

    if (!isCountrySupported(country)) {
      return NextResponse.json(
        { error: `Country ${country} is not supported` },
        { status: 400 }
      );
    }

    if (query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Perform the search with enhanced options
    const searchResults = comprehensive
      ? await scraperManager.scrapeAllComprehensive(query, country.toUpperCase(), {
          maxPages,
          retryFailedSites,
          sortBy: 'price',
          sortOrder: 'asc'
        })
      : await scraperManager.scrapeAll(query, country.toUpperCase(), {
          maxPages,
          sortBy: 'price',
          sortOrder: 'asc'
        });

    // Get detailed statistics
    const stats = scraperManager.getScrapingStats(searchResults.results);

    return NextResponse.json({
      success: true,
      data: {
        products: searchResults.results,
        summary: searchResults.summary,
        statistics: stats,
        query,
        country: country.toUpperCase(),
        timestamp: new Date().toISOString(),
        pagination: {
          maxPages,
          comprehensive,
          retryFailedSites
        },
        matching: {
          totalFiltered: searchResults.results.length,
          strictMatching: true,
          minimumConfidence: 0.7
        }
      },
      errors: searchResults.errors.length > 0 ? searchResults.errors : undefined
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const country = searchParams.get('country');
  const query = searchParams.get('query');

  if (!country || !query) {
    return NextResponse.json(
      { error: 'Country and query parameters are required' },
      { status: 400 }
    );
  }

  // Reuse POST logic
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ country, query }),
    headers: { 'Content-Type': 'application/json' }
  }));
}
