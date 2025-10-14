import { useState, useEffect } from 'react';

interface MarketDataPoint {
  time: Date;
  price: number;
}

interface MarketData {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  data: MarketDataPoint[];
  loading: boolean;
}

export const useMarketData = (symbol: string, range: string = '1d') => {
  const [marketData, setMarketData] = useState<MarketData>({
    symbol,
    currentPrice: 0,
    change: 0,
    changePercent: 0,
    data: [],
    loading: true,
  });

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch(`/api/stock/${symbol}?range=${range}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        setMarketData({
          symbol,
          currentPrice: data.currentPrice || 0,
          change: data.change || 0,
          changePercent: data.changePercent || 0,
          data: data.chartData || [],
          loading: false,
        });
      } catch (error) {
        console.error(`Error fetching market data for ${symbol}:`, error);
        setMarketData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchMarketData();

    // Refresh every 5 minutes
    const interval = setInterval(fetchMarketData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [symbol, range]);

  return marketData;
};
