'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, YAxis, Tooltip } from 'recharts';
import { useMarketData } from '@/hooks/useMarketData';
import { TrendingUp, TrendingDown, Search, X } from 'lucide-react';
import TickerDetailModal from './TickerDetailModal';

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

interface MarketCardProps {
  symbol: string;
  displayName: string;
  range?: string;
  delay?: number;
  onClick?: () => void;
}

// Custom tooltip for the chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 text-white px-2 py-1 rounded text-xs shadow-lg">
        <p className="font-semibold">${payload[0].value.toFixed(2)}</p>
        {payload[0].payload.time && (
          <p className="text-[10px] text-gray-300">
            {new Date(payload[0].payload.time).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const MarketCard = ({
  symbol,
  displayName,
  range = '1d',
  delay = 0,
  onClick,
}: MarketCardProps) => {
  const { currentPrice, change, changePercent, data, loading } = useMarketData(
    symbol,
    range
  );

  const isPositive = change >= 0;
  const lineColor = isPositive ? '#10b981' : '#ef4444';
  const bgGradient = isPositive
    ? 'from-green-50 to-white'
    : 'from-red-50 to-white';

  // Calculate min/max for auto-scaling
  const prices = data.map(d => d.price).filter(p => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 100;

  // Check if data fetch failed (not loading but no data and no price)
  const hasError = !loading && data.length === 0 && currentPrice === 0;

  if (hasError) {
    // Error state - matches chart height exactly (h-[140px] = header + chart)
    return (
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay }}
        className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-3 h-[140px] flex flex-col items-center justify-center"
      >
        <X className="text-red-400 w-8 h-8 mb-2" />
        <p className="text-xs font-semibold text-red-600">Ticker not found</p>
        <p className="text-[10px] text-red-500 mt-1">{symbol}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
      onClick={e => {
        console.log('Card clicked:', symbol, displayName);
        if (onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`bg-gradient-to-br ${bgGradient} rounded-xl shadow-sm border border-gray-200 p-3 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${onClick ? 'cursor-pointer' : ''} group h-[140px] flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
              {displayName}
            </h3>
            {!loading &&
              (isPositive ? (
                <TrendingUp className="text-green-600 w-3 h-3" />
              ) : (
                <TrendingDown className="text-red-600 w-3 h-3" />
              ))}
          </div>
          {loading ? (
            <div className="h-7 w-24 bg-gray-200 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-xl font-bold text-gray-900 mt-0.5 tracking-tight">
              {currentPrice.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          )}
        </div>
        {loading ? (
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
        ) : (
          <div
            className={`text-right px-2 py-0.5 rounded-md ${
              isPositive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            <p className="text-[11px] font-bold leading-tight">
              {isPositive ? '+' : ''}
              {change.toFixed(2)}
            </p>
            <p className="text-[10px] font-semibold leading-tight">
              {isPositive ? '+' : ''}
              {changePercent.toFixed(2)}%
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-16 -mx-1 mt-2 flex-1">
        {loading ? (
          <div className="h-full bg-gray-100 animate-pulse rounded" />
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <YAxis domain={[minPrice * 0.998, maxPrice * 1.002]} hide />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke={lineColor}
                strokeWidth={2}
                dot={false}
                animationDuration={500}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            No data available
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Common ticker suggestions for autocomplete
const COMMON_TICKERS = [
  'AAPL',
  'MSFT',
  'GOOGL',
  'AMZN',
  'NVDA',
  'TSLA',
  'META',
  'NFLX',
  'AMD',
  'INTC',
  'DIS',
  'BA',
  'JPM',
  'BAC',
  'WMT',
  'V',
  'MA',
];

const MarketIndicators = () => {
  const [searchTicker, setSearchTicker] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchedTicker, setSearchedTicker] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Modal state
  const [selectedTicker, setSelectedTicker] = useState<{
    symbol: string;
    displayName: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Default indices - mobile shows first 2, desktop shows all 6
  const defaultIndicators = [
    { symbol: '^GSPC', displayName: 'S&P 500', delay: 0 },
    { symbol: '^VIX', displayName: 'VIX', delay: 0.15 },

    { symbol: '^DJI', displayName: 'Dow Jones', delay: 0.05 },
    { symbol: '^IXIC', displayName: 'Nasdaq', delay: 0.1 },
    { symbol: '^RUT', displayName: 'Russell 2000', delay: 0.2 },
    { symbol: 'GC=F', displayName: 'Gold', delay: 0.25 },
  ];

  // Mobile: first 2 only
  const mobileIndicators = defaultIndicators.slice(0, 2);

  // Update suggestions based on input
  useEffect(() => {
    if (searchTicker.trim()) {
      const upperSearch = searchTicker.trim().toUpperCase();
      const filtered = COMMON_TICKERS.filter(ticker =>
        ticker.startsWith(upperSearch)
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTicker]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTicker);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTicker]);

  // Handle search execution
  useEffect(() => {
    if (debouncedSearch.trim()) {
      const upperSearch = debouncedSearch.trim().toUpperCase();
      setIsSearchMode(true);
      setSearchedTicker(upperSearch);
      setShowSuggestions(false);
    } else if (!searchTicker.trim()) {
      // Clear search mode when input is empty
      setIsSearchMode(false);
      setSearchedTicker(null);
    }
  }, [debouncedSearch, searchTicker]);

  // Handle suggestion click
  const handleSuggestionClick = (ticker: string) => {
    setSearchTicker(ticker);
    setDebouncedSearch(ticker);
    setShowSuggestions(false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTicker('');
    setDebouncedSearch('');
    setIsSearchMode(false);
    setSearchedTicker(null);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Handle ticker click (desktop only)
  const handleTickerClick = (symbol: string, displayName: string) => {
    console.log('Ticker clicked:', symbol, displayName);
    console.log('Window width:', window.innerWidth);

    // Check if we're on desktop (lg breakpoint = 1024px)
    if (window.innerWidth >= 1024) {
      console.log('Opening modal for', symbol);
      setSelectedTicker({ symbol, displayName });
      setIsModalOpen(true);
    } else {
      console.log('Not opening modal - mobile view');
    }
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
    setIsModalOpen(false);
    // Clear selected ticker after animation completes
    setTimeout(() => setSelectedTicker(null), 300);
  };

  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex items-center justify-between"
      >
        {/* Left: Title + Search (Desktop only) */}
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800">
            Market Overview
          </h2>

          {/* Search bar with autocomplete - Desktop only */}
          <div className="hidden lg:block relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTicker}
                onChange={e => setSearchTicker(e.target.value)}
                onFocus={() => searchTicker && setShowSuggestions(true)}
                placeholder="Search for a ticker..."
                className="w-56 pl-9 pr-9 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTicker && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Autocomplete suggestions */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
                >
                  {suggestions.map(ticker => (
                    <button
                      key={ticker}
                      onClick={() => handleSuggestionClick(ticker)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900">
                        {ticker}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Search indicator or clear button */}
        {isSearchMode && (
          <button
            onClick={clearSearch}
            className="hidden lg:flex items-center whitespace-nowrap ml-2 gap-2 px-3 py-1.5 text-xs font-medium bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <X className="w-3 h-3" />
            <span>Clear Search</span>
          </button>
        )}
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Mobile: Show only first 4 indices (no search, no click) */}
        <div className="contents lg:hidden">
          {mobileIndicators.map(indicator => (
            <MarketCard
              key={indicator.symbol}
              symbol={indicator.symbol}
              displayName={indicator.displayName}
              delay={indicator.delay}
            />
          ))}
        </div>

        {/* Desktop: Show search result or default indices (clickable) */}
        <div className="hidden lg:contents">
          {isSearchMode && searchedTicker ? (
            // Show single searched ticker
            <>
              <MarketCard
                key={searchedTicker}
                symbol={searchedTicker}
                displayName={searchedTicker}
                delay={0}
                onClick={() =>
                  handleTickerClick(searchedTicker, searchedTicker)
                }
              />
              {/* Fill remaining slots */}
              {[...Array(5)].map((_, idx) => (
                <div key={`empty-${idx}`} className="invisible" />
              ))}
            </>
          ) : (
            // Show default indices
            defaultIndicators.map((indicator, idx) => (
              <MarketCard
                key={indicator.symbol}
                symbol={indicator.symbol}
                displayName={indicator.displayName}
                delay={idx * 0.05}
                onClick={() =>
                  handleTickerClick(indicator.symbol, indicator.displayName)
                }
              />
            ))
          )}
        </div>
      </div>

      {/* Ticker Detail Modal - Desktop only */}
      {selectedTicker && (
        <TickerDetailModal
          symbol={selectedTicker.symbol}
          displayName={selectedTicker.displayName}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default MarketIndicators;
