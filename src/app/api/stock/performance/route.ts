import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

// In-memory cache to avoid rate limiting
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface StockPerformance {
  ticker: string;
  currentPrice: number | null;
  pitchPrice: number | null;
  pointsChange: number | null;
  percentChange: number | null;
  error?: string;
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

    // Parse pitch date
    const pitchDateTime = new Date(pitchDate);
    if (isNaN(pitchDateTime.getTime())) {
      return NextResponse.json(
        { error: 'Invalid pitchDate format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    try {
      // Fetch historical price at pitch date
      const historicalResult = await yahooFinance.historical(ticker, {
        period1: pitchDate,
        period2: pitchDate,
      });

      // Fetch current quote
      const currentQuote = await yahooFinance.quote(ticker);

      // Calculate performance
      const pitchPrice =
        historicalResult.length > 0 ? historicalResult[0].close : null;
      const currentPrice = currentQuote.regularMarketPrice || null;

      let pointsChange: number | null = null;
      let percentChange: number | null = null;

      if (pitchPrice !== null && currentPrice !== null) {
        pointsChange = currentPrice - pitchPrice;
        percentChange = ((currentPrice - pitchPrice) / pitchPrice) * 100;
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
    } catch (error: any) {
      console.error('Yahoo Finance API error:', error);

      // Return a structured error response
      const errorResponse: StockPerformance = {
        ticker: ticker.toUpperCase(),
        currentPrice: null,
        pitchPrice: null,
        pointsChange: null,
        percentChange: null,
        error: error.message || 'Failed to fetch stock data',
      };

      return NextResponse.json(errorResponse, { status: 200 }); // Return 200 to allow graceful handling
    }
  } catch (error: any) {
    console.error('Stock performance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
