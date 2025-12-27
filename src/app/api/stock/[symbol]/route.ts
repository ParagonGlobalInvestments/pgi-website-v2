import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

// Cache responses for 2 minutes to handle multiple users efficiently
export const revalidate = 120; // 2 minutes
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const { symbol } = params;
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get('range') || '1d';

    // Fetch historical data
    const result = await yahooFinance.chart(symbol, {
      period1: getPeriodStart(range),
      interval: getInterval(range),
    });

    const quotes = result.quotes || [];
    const meta = result.meta;

    // Format chart data
    interface Quote {
      date: Date;
      close: number | null;
    }

    const chartData = (quotes as Quote[])
      .filter((quote) => quote.close !== null)
      .map((quote) => ({
        time: quote.date,
        price: quote.close,
      }));

    const firstPrice = chartData[0]?.price || 0;
    const lastPrice = chartData[chartData.length - 1]?.price || 0;
    const change = lastPrice - firstPrice;
    const changePercent = firstPrice > 0 ? (change / firstPrice) * 100 : 0;

    return NextResponse.json(
      {
        currentPrice: lastPrice,
        change,
        changePercent,
        chartData,
        meta: {
          symbol: meta.symbol,
          currency: meta.currency,
          exchangeName: meta.exchangeName,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}

function getPeriodStart(range: string): Date {
  const now = new Date();
  switch (range) {
    case '1d':
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case '5d':
      return new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
    case '1mo':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case '3mo':
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    case '6mo':
      return new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    default:
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
}

function getInterval(range: string): '1m' | '5m' | '15m' | '1h' | '1d' {
  switch (range) {
    case '1d':
      return '5m';
    case '5d':
      return '15m';
    case '1mo':
      return '1h';
    case '3mo':
    case '6mo':
    case '1y':
      return '1d';
    default:
      return '5m';
  }
}
