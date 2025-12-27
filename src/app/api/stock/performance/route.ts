import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

// Mark this route as dynamic (required for API routes that use request params)
export const dynamic = 'force-dynamic';

// Enhanced in-memory cache with LRU-like behavior
const cache = new Map<string, { data: StockPerformance; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000; // Prevent memory bloat

interface StockPerformance {
  ticker: string;
  currentPrice: number | null;
  pitchPrice: number | null;
  pointsChange: number | null;
  percentChange: number | null;
  error?: string;
}

// Helper function to manage cache size
function pruneCache() {
  if (cache.size > MAX_CACHE_SIZE) {
    const sortedEntries = Array.from(cache.entries()).sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    );
    // Remove oldest 20% of entries
    const toRemove = Math.floor(MAX_CACHE_SIZE * 0.2);
    for (let i = 0; i < toRemove; i++) {
      cache.delete(sortedEntries[i][0]);
    }
  }
}

/**
 * GET /api/stock/performance
 *
 * Calculates stock performance from pitch date to current date
 *
 * Query params:
 * - ticker: Stock ticker symbol (e.g., "AAPL")
 * - pitchDate: Date when pitched (YYYY-MM-DD format)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get('ticker');
    const pitchDate = searchParams.get('pitchDate');

    // Validate inputs
    if (!ticker || !pitchDate) {
      return NextResponse.json(
        { error: 'Missing ticker or pitchDate parameter' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `${ticker}-${pitchDate}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Prune cache periodically
    pruneCache();

    // Parse pitch date
    const pitchDateTime = new Date(pitchDate);
    if (isNaN(pitchDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid pitchDate format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    try {
      // Fetch current quote
      const currentQuote = await yahooFinance.quote(ticker);
      const currentPrice = currentQuote.regularMarketPrice || null;
      
      // Calculate date range for historical data
      const pitchDateTime = new Date(pitchDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      pitchDateTime.setHours(0, 0, 0, 0);
      
      let pitchPrice: number | null = null;
      
      // Only fetch historical data if pitch date is in the past
      if (pitchDateTime < today) {
        try {
          // Get historical data with a date range to avoid period1 === period2 error
          const nextDay = new Date(pitchDateTime);
          nextDay.setDate(nextDay.getDate() + 1);
          
          const historicalResult = await yahooFinance.historical(ticker, {
            period1: pitchDate,
            period2: nextDay.toISOString().split('T')[0],
          });
          
          pitchPrice = historicalResult.length > 0 ? historicalResult[0].close : null;
        } catch {
          pitchPrice = currentPrice;
        }
      } else {
        // If pitch date is today or in the future, use current price
        pitchPrice = currentPrice;
      }

      // Calculate performance
      let pointsChange: number | null = null;
      let percentChange: number | null = null;

      if (pitchPrice !== null && currentPrice !== null && pitchPrice !== currentPrice) {
        pointsChange = currentPrice - pitchPrice;
        percentChange = ((currentPrice - pitchPrice) / pitchPrice) * 100;
      } else if (pitchPrice === currentPrice) {
        // Same price means 0% change
        pointsChange = 0;
        percentChange = 0;
      }

      const response: StockPerformance = {
        ticker: ticker.toUpperCase(),
        currentPrice,
        pitchPrice,
        pointsChange:
          pointsChange !== null ? Number(pointsChange.toFixed(2)) : null,
        percentChange:
          percentChange !== null ? Number(percentChange.toFixed(2)) : null,
      };

      // Cache the result
      cache.set(cacheKey, {
        data: response,
        timestamp: Date.now(),
      });

      return NextResponse.json(response);
    } catch (error) {
      // Return a structured error response
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stock data';
      const errorResponse: StockPerformance = {
        ticker: ticker.toUpperCase(),
        currentPrice: null,
        pitchPrice: null,
        pointsChange: null,
        percentChange: null,
        error: errorMessage,
      };

      return NextResponse.json(errorResponse, { status: 200 }); // Return 200 to allow graceful handling
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
