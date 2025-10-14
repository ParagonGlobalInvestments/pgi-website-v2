'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from 'recharts';
import {
  X,
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  BarChart3,
  Calendar,
  Maximize2,
  Building2,
  Percent,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DecryptedText from '@/components/reactbits/TextAnimations/DecryptedText/DecryptedText';

interface TickerDetailModalProps {
  symbol: string;
  displayName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface DetailedTickerData {
  currentPrice: number;
  change: number;
  changePercent: number;
  chartData: Array<{ time: Date; price: number; volume?: number }>;
  meta: {
    symbol: string;
    currency?: string;
    exchangeName?: string;
    marketCap?: number;
    peRatio?: number;
    volume?: number;
    avgVolume?: number;
    dayHigh?: number;
    dayLow?: number;
    fiftyTwoWeekHigh?: number;
    fiftyTwoWeekLow?: number;
    dividendYield?: number;
    eps?: number;
  };
}

type ChartType = 'line' | 'area' | 'bar' | 'candlestick';
type TimeRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y';

const TIME_RANGES = [
  { value: '1d' as TimeRange, label: '1 Day', icon: Calendar },
  { value: '5d' as TimeRange, label: '5 Days', icon: Calendar },
  { value: '1mo' as TimeRange, label: '1 Month', icon: Calendar },
  { value: '3mo' as TimeRange, label: '3 Months', icon: Calendar },
  { value: '6mo' as TimeRange, label: '6 Months', icon: Calendar },
  { value: '1y' as TimeRange, label: '1 Year', icon: Calendar },
];

const CHART_TYPES = [
  { value: 'line' as ChartType, label: 'Line', icon: Activity },
  { value: 'area' as ChartType, label: 'Area', icon: Activity },
  { value: 'bar' as ChartType, label: 'Bar', icon: BarChart3 },
];

const formatNumber = (num: number | undefined, decimals = 2) => {
  if (num === undefined || num === null) return 'N/A';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

// Custom tooltip for charts
const CustomChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl border border-gray-700">
        <p className="font-bold text-sm">${payload[0].value.toFixed(2)}</p>
        {data.time && (
          <p className="text-xs text-gray-300 mt-1">
            {new Date(data.time).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        )}
        {data.volume && (
          <p className="text-xs text-gray-400 mt-1">
            Vol: {(data.volume / 1e6).toFixed(2)}M
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function TickerDetailModal({
  symbol,
  displayName,
  isOpen,
  onClose,
}: TickerDetailModalProps) {
  const [data, setData] = useState<DetailedTickerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<ChartType>('area');
  const [timeRange, setTimeRange] = useState<TimeRange>('1d');

  // Log when modal state changes
  useEffect(() => {
    console.log('Modal state changed:', { symbol, isOpen });
  }, [symbol, isOpen]);

  // Fetch ticker data
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/stock/${symbol}?range=${timeRange}`);
        if (!response.ok) {
          throw new Error('Failed to fetch ticker data');
        }

        const result = await response.json();

        // Fetch additional quote data for more details
        const quoteResponse = await fetch(`/api/stock/${symbol}/quote`);
        let quoteData = {};
        if (quoteResponse.ok) {
          quoteData = await quoteResponse.json();
        }

        setData({
          currentPrice: result.currentPrice || 0,
          change: result.change || 0,
          changePercent: result.changePercent || 0,
          chartData: result.chartData || [],
          meta: {
            symbol: result.meta?.symbol || symbol,
            currency: result.meta?.currency,
            exchangeName: result.meta?.exchangeName,
            ...quoteData,
          },
        });
      } catch (err) {
        console.error('Error fetching ticker data:', err);
        setError('Failed to load ticker data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol, isOpen, timeRange]);

  const isPositive = data ? data.change >= 0 : false;

  // Calculate min/max for chart scaling
  const prices = data?.chartData.map(d => d.price) || [];
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 100;

  // Render chart based on type
  const renderChart = () => {
    if (!data || data.chartData.length === 0) return null;

    const chartColor = isPositive ? '#10b981' : '#ef4444';

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                tickFormatter={time =>
                  new Date(time).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
                stroke="#6b7280"
                style={{ fontSize: 12 }}
              />
              <YAxis
                domain={[minPrice * 0.995, maxPrice * 1.005]}
                stroke="#6b7280"
                style={{ fontSize: 12 }}
                tickFormatter={val => `$${val.toFixed(2)}`}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2.5}
                dot={false}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                tickFormatter={time =>
                  new Date(time).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
                stroke="#6b7280"
                style={{ fontSize: 12 }}
              />
              <YAxis
                domain={[minPrice * 0.995, maxPrice * 1.005]}
                stroke="#6b7280"
                style={{ fontSize: 12 }}
                tickFormatter={val => `$${val.toFixed(2)}`}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke={chartColor}
                strokeWidth={2.5}
                fill="url(#colorPrice)"
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="time"
                tickFormatter={time =>
                  new Date(time).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                }
                stroke="#6b7280"
                style={{ fontSize: 12 }}
              />
              <YAxis
                domain={[minPrice * 0.995, maxPrice * 1.005]}
                stroke="#6b7280"
                style={{ fontSize: 12 }}
                tickFormatter={val => `$${val.toFixed(2)}`}
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Bar dataKey="price" fill={chartColor} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-6xl pointer-events-auto relative"
              onClick={e => e.stopPropagation()}
            >
              <Card className="border-0 shadow-2xl overflow-hidden">
                {/* Header */}
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white pb-6 pt-6 relative">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="flex items-start justify-between pr-12">
                    <div className="flex-1">
                      <CardTitle className="text-3xl font-bold mb-2">
                        <DecryptedText
                          text={displayName}
                          sequential={true}
                          revealDirection="start"
                          animateOn="view"
                          speed={30}
                          useOriginalCharsOnly={true}
                          className="text-3xl font-bold text-white"
                        />
                      </CardTitle>
                      <CardDescription className="text-blue-100 text-sm">
                        {symbol} • {data?.meta.exchangeName || 'Exchange'}
                      </CardDescription>
                    </div>

                    {!loading && data && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-right"
                      >
                        <div className="text-4xl font-bold mb-1">
                          {formatNumber(data.currentPrice, 2)}
                        </div>
                        <div
                          className={`flex items-center gap-2 justify-end ${
                            isPositive ? 'text-green-200' : 'text-red-200'
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <TrendingDown className="w-5 h-5" />
                          )}
                          <span className="text-xl font-semibold">
                            {isPositive ? '+' : ''}
                            {data.change.toFixed(2)} ({isPositive ? '+' : ''}
                            {data.changePercent.toFixed(2)}%)
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6 bg-white">
                  {loading ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="space-y-4 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto" />
                        <DecryptedText
                          text="Loading ticker data..."
                          sequential={true}
                          revealDirection="start"
                          animateOn="view"
                          speed={25}
                          useOriginalCharsOnly={true}
                          className="text-gray-600"
                        />
                      </div>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-96">
                      <div className="text-center space-y-2">
                        <X className="w-12 h-12 text-red-500 mx-auto" />
                        <p className="text-red-600 font-semibold">{error}</p>
                        <Button onClick={onClose} variant="outline">
                          Close
                        </Button>
                      </div>
                    </div>
                  ) : data ? (
                    <div className="space-y-6">
                      {/* Controls */}
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200"
                      >
                        {/* Time Range */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Time Range:
                          </span>
                          <div className="flex gap-1">
                            {TIME_RANGES.map(range => (
                              <Button
                                key={range.value}
                                onClick={() => setTimeRange(range.value)}
                                variant={
                                  timeRange === range.value
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                className={`text-xs ${
                                  timeRange === range.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700'
                                }`}
                              >
                                {range.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        {/* Chart Type */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4" />
                            Chart Type:
                          </span>
                          <div className="flex gap-1">
                            {CHART_TYPES.map(type => (
                              <Button
                                key={type.value}
                                onClick={() => setChartType(type.value)}
                                variant={
                                  chartType === type.value
                                    ? 'default'
                                    : 'outline'
                                }
                                size="sm"
                                className={`text-xs ${
                                  chartType === type.value
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700'
                                }`}
                              >
                                <type.icon className="w-3 h-3 mr-1" />
                                {type.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </motion.div>

                      {/* Chart */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="h-96 bg-gray-50 rounded-xl p-4 border border-gray-200"
                      >
                        {renderChart()}
                      </motion.div>

                      {/* Key Metrics Grid */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4"
                      >
                        <MetricCard
                          icon={Building2}
                          label="Market Cap"
                          value={formatNumber(data.meta.marketCap)}
                          delay={0.35}
                        />
                        <MetricCard
                          icon={Activity}
                          label="Volume"
                          value={
                            data.meta.volume
                              ? `${(data.meta.volume / 1e6).toFixed(2)}M`
                              : 'N/A'
                          }
                          delay={0.4}
                        />
                        <MetricCard
                          icon={Percent}
                          label="P/E Ratio"
                          value={
                            data.meta.peRatio
                              ? data.meta.peRatio.toFixed(2)
                              : 'N/A'
                          }
                          delay={0.45}
                        />
                        <MetricCard
                          icon={DollarSign}
                          label="EPS"
                          value={
                            data.meta.eps
                              ? `$${data.meta.eps.toFixed(2)}`
                              : 'N/A'
                          }
                          delay={0.5}
                        />
                        <MetricCard
                          icon={TrendingUp}
                          label="Day High"
                          value={formatNumber(data.meta.dayHigh, 2)}
                          delay={0.55}
                        />
                        <MetricCard
                          icon={TrendingDown}
                          label="Day Low"
                          value={formatNumber(data.meta.dayLow, 2)}
                          delay={0.6}
                        />
                        <MetricCard
                          icon={Maximize2}
                          label="52W High"
                          value={formatNumber(data.meta.fiftyTwoWeekHigh, 2)}
                          delay={0.65}
                        />
                        <MetricCard
                          icon={Maximize2}
                          label="52W Low"
                          value={formatNumber(data.meta.fiftyTwoWeekLow, 2)}
                          delay={0.7}
                        />
                      </motion.div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Metric Card Component
interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  delay?: number;
}

const MetricCard = ({
  icon: Icon,
  label,
  value,
  delay = 0,
}: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-blue-600" />
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
    <div className="text-lg font-bold text-gray-900">{value}</div>
  </motion.div>
);
