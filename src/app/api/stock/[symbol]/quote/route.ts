import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

// Cache responses for 2 minutes
export const revalidate = 120;
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params;

    // Fetch quote data
    const quote = await yahooFinance.quote(symbol);

    return NextResponse.json(
      {
        marketCap: quote.marketCap,
        peRatio: quote.trailingPE,
        volume: quote.regularMarketVolume,
        avgVolume: quote.averageDailyVolume3Month,
        dayHigh: quote.regularMarketDayHigh,
        dayLow: quote.regularMarketDayLow,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
        dividendYield: quote.dividendYield,
        eps: quote.epsTrailingTwelveMonths,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching quote data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote data' },
      { status: 500 }
    );
  }
}
