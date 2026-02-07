'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Monitor,
  Smartphone,
  Tablet,
  AlertTriangle,
  Eye,
  Users,
  Clock,
  BarChart3,
  RefreshCw,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PortalPageHeader } from '@/components/portal/PortalPageHeader';

const fetcher = (url: string) => fetch(url).then(res => res.json());

// Core Web Vitals thresholds (in ms except CLS)
const VITALS_CONFIG: Record<
  string,
  {
    good: number;
    needsImprovement: number;
    unit: string;
    label: string;
    description: string;
  }
> = {
  LCP: {
    good: 2500,
    needsImprovement: 4000,
    unit: 'ms',
    label: 'Largest Contentful Paint',
    description: 'Time until main content is visible',
  },
  FCP: {
    good: 1800,
    needsImprovement: 3000,
    unit: 'ms',
    label: 'First Contentful Paint',
    description: 'Time until first content is visible',
  },
  CLS: {
    good: 0.1,
    needsImprovement: 0.25,
    unit: '',
    label: 'Cumulative Layout Shift',
    description: 'Visual stability score',
  },
  TTFB: {
    good: 800,
    needsImprovement: 1800,
    unit: 'ms',
    label: 'Time to First Byte',
    description: 'Server response time',
  },
  INP: {
    good: 200,
    needsImprovement: 500,
    unit: 'ms',
    label: 'Interaction to Next Paint',
    description: 'Responsiveness to user input',
  },
};

function formatValue(value: number | null, metric: string): string {
  if (value === null || value === undefined) return '—';
  if (metric === 'CLS') return value.toFixed(3);
  return Math.round(value).toLocaleString();
}

function getStatusColor(value: number, metric: string): string {
  const config = VITALS_CONFIG[metric];
  if (!config) return 'text-gray-400';

  if (value <= config.good) return 'text-green-500';
  if (value <= config.needsImprovement) return 'text-yellow-500';
  return 'text-red-500';
}

function getStatusBg(value: number, metric: string): string {
  const config = VITALS_CONFIG[metric];
  if (!config) return 'bg-gray-100';

  if (value <= config.good) return 'bg-green-500/10';
  if (value <= config.needsImprovement) return 'bg-yellow-500/10';
  return 'bg-red-500/10';
}

// Sparkline component
function Sparkline({ data, height = 32 }: { data: number[]; height?: number }) {
  if (!data || data.length < 2) {
    return (
      <div className="h-8 flex items-center text-xs text-gray-400">
        No trend data
      </div>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const trend = data[data.length - 1] - data[0];
  const trendColor = trend > 0 ? 'text-red-400' : 'text-green-400';

  return (
    <div className="flex items-center gap-2">
      <svg viewBox={`0 0 100 ${height}`} className="flex-1 h-8">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-blue-400"
        />
      </svg>
      <span className={`text-xs flex items-center ${trendColor}`}>
        {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      </span>
    </div>
  );
}

// Stats card
function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  trend?: 'up' | 'down' | null;
}) {
  return (
    <Card className="border-gray-200 transition-all hover:shadow-md hover:border-gray-300">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        {trend && (
          <div
            className={`mt-2 text-xs flex items-center ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
          >
            {trend === 'up' ? (
              <TrendingUp size={12} className="mr-1" />
            ) : (
              <TrendingDown size={12} className="mr-1" />
            )}
            {trend === 'up' ? 'Improving' : 'Declining'}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Vital card with gauge
function VitalCard({
  metric,
  data,
}: {
  metric: string;
  data: {
    avg_value: number;
    p75_value: number;
    good_count: number;
    needs_improvement_count: number;
    poor_count: number;
    total_count: number;
  } | null;
}) {
  const config = VITALS_CONFIG[metric];
  if (!config) return null;

  const p75 = data?.p75_value ?? 0;
  const total = data?.total_count ?? 0;
  const goodPct =
    total > 0 ? (((data?.good_count ?? 0) / total) * 100).toFixed(0) : '0';
  const needsPct =
    total > 0
      ? (((data?.needs_improvement_count ?? 0) / total) * 100).toFixed(0)
      : '0';
  const poorPct =
    total > 0 ? (((data?.poor_count ?? 0) / total) * 100).toFixed(0) : '0';

  return (
    <Card className="border-gray-200 overflow-hidden transition-all hover:shadow-md hover:border-gray-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-500">
            {config.label}
          </CardTitle>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${getStatusBg(p75, metric)} ${getStatusColor(p75, metric)}`}
          >
            {p75 <= config.good
              ? 'Good'
              : p75 <= config.needsImprovement
                ? 'Needs Work'
                : 'Poor'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold ${getStatusColor(p75, metric)}`}>
            {formatValue(p75, metric)}
          </span>
          <span className="text-sm text-gray-400">{config.unit}</span>
          <span className="text-xs text-gray-400 ml-1">(p75)</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">{config.description}</p>

        {total > 0 && (
          <>
            <div className="flex gap-0.5 h-2 rounded-full overflow-hidden mt-3">
              <div
                className="bg-green-500 transition-all"
                style={{ width: `${goodPct}%` }}
              />
              <div
                className="bg-yellow-500 transition-all"
                style={{ width: `${needsPct}%` }}
              />
              <div
                className="bg-red-500 transition-all"
                style={{ width: `${poorPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-gray-400">
              <span>{goodPct}% good</span>
              <span>{needsPct}% needs improvement</span>
              <span>{poorPct}% poor</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {total.toLocaleString()} samples
            </p>
          </>
        )}

        {total === 0 && (
          <p className="text-xs text-gray-400 mt-3">No data yet</p>
        )}
      </CardContent>
    </Card>
  );
}

// Device breakdown bar
function DeviceBreakdown({
  data,
}: {
  data: { desktop: number; mobile: number; tablet: number; unknown: number };
}) {
  const total = data.desktop + data.mobile + data.tablet + data.unknown;
  if (total === 0)
    return <p className="text-sm text-gray-400">No device data</p>;

  const items = [
    {
      key: 'desktop',
      label: 'Desktop',
      icon: Monitor,
      value: data.desktop,
      color: 'bg-blue-500',
    },
    {
      key: 'mobile',
      label: 'Mobile',
      icon: Smartphone,
      value: data.mobile,
      color: 'bg-green-500',
    },
    {
      key: 'tablet',
      label: 'Tablet',
      icon: Tablet,
      value: data.tablet,
      color: 'bg-purple-500',
    },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-2">
      {items.map(item => (
        <div key={item.key} className="flex items-center gap-2">
          <item.icon size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600 w-16">{item.label}</span>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${item.color} transition-all`}
              style={{ width: `${(item.value / total) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-500 w-12 text-right">
            {((item.value / total) * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}

// Collapsible section wrapper
function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={18} className="text-gray-400" />
          <span className="font-medium text-gray-700">{title}</span>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-gray-100">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Site health summary - simple overall status
function SiteHealthSummary({
  vitalsMap,
  errorCount,
}: {
  vitalsMap: Record<string, { p75_value: number }>;
  errorCount: number;
}) {
  // Calculate overall health based on Core Web Vitals
  const lcpValue = vitalsMap.LCP?.p75_value ?? 0;
  const clsValue = vitalsMap.CLS?.p75_value ?? 0;
  const inpValue = vitalsMap.INP?.p75_value ?? 0;

  // Determine health status
  let healthStatus: 'excellent' | 'good' | 'needs-attention' = 'excellent';
  let healthMessage = 'Your site is performing excellently';

  const hasData = lcpValue > 0 || clsValue > 0 || inpValue > 0;

  if (!hasData) {
    healthStatus = 'good';
    healthMessage = 'Collecting performance data...';
  } else {
    const lcpGood = lcpValue <= 2500;
    const clsGood = clsValue <= 0.1;
    const inpGood = inpValue <= 200;

    const goodCount = [lcpGood, clsGood, inpGood].filter(Boolean).length;

    if (goodCount === 3 && errorCount === 0) {
      healthStatus = 'excellent';
      healthMessage = 'Your site is performing excellently';
    } else if (goodCount >= 2) {
      healthStatus = 'good';
      healthMessage = 'Site performance is good overall';
    } else {
      healthStatus = 'needs-attention';
      healthMessage = 'Some metrics need attention';
    }
  }

  const statusConfig = {
    excellent: {
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle2,
      label: 'Excellent',
    },
    good: {
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: CheckCircle2,
      label: 'Good',
    },
    'needs-attention': {
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertTriangle,
      label: 'Needs Attention',
    },
  };

  const config = statusConfig[healthStatus];
  const StatusIcon = config.icon;

  return (
    <Card className={`${config.border} ${config.bg}`}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div
            className={`h-14 w-14 rounded-full ${config.bg} flex items-center justify-center`}
          >
            <StatusIcon className={`h-8 w-8 ${config.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${config.color}`}>
                {config.label}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-0.5">{healthMessage}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main analytics page
export default function AnalyticsPage() {
  const [days, setDays] = useState(7);

  const { data, error, isLoading, mutate } = useSWR(
    `/api/observability/stats?days=${days}`,
    fetcher,
    { refreshInterval: 60000, revalidateOnFocus: true }
  );

  // Build vitals map from summary
  const vitalsMap = useMemo(() => {
    if (!data?.vitals?.summary) return {};
    return data.vitals.summary.reduce(
      (acc: Record<string, unknown>, item: { metric_type: string }) => {
        acc[item.metric_type] = item;
        return acc;
      },
      {}
    );
  }, [data?.vitals?.summary]);

  // Build trend data per metric
  const trendsByMetric = useMemo(() => {
    if (!data?.vitals?.trends) return {};
    const trends: Record<string, number[]> = {};
    data.vitals.trends.forEach(
      (t: { metric_type: string; p75_value: number }) => {
        if (!trends[t.metric_type]) trends[t.metric_type] = [];
        trends[t.metric_type].push(t.p75_value);
      }
    );
    return trends;
  }, [data?.vitals?.trends]);

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <AlertTriangle className="inline mr-2" size={16} />
          Failed to load observability data. You may need admin permissions.
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PortalPageHeader
          title="Analytics"
          description="See how the public site is performing"
        />
        <div className="flex items-center gap-2">
          <Select
            value={String(days)}
            onValueChange={val => setDays(parseInt(val))}
          >
            <SelectTrigger
              className="h-9 w-[140px] text-sm bg-white border-gray-200"
              aria-label="Time range"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <button
            onClick={() => mutate()}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Refresh data"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* ===== SIMPLE VIEW (Always Visible) ===== */}

          {/* Info banner when no data */}
          {data?.traffic?.totalPageviews === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Activity className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Analytics is ready
                </p>
                <p className="text-sm text-blue-600 mt-0.5">
                  Data will appear automatically as visitors browse the site.
                  This page updates every minute.
                </p>
              </div>
            </div>
          )}

          {/* Site Health + Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SiteHealthSummary
              vitalsMap={vitalsMap}
              errorCount={data?.errors?.total || 0}
            />
            <StatCard
              title="Page Views"
              value={data?.traffic?.totalPageviews?.toLocaleString() || '0'}
              icon={Eye}
              subtitle={`${days === 1 ? 'Today' : `Last ${days} days`}`}
            />
            <StatCard
              title="Unique Visitors"
              value={data?.traffic?.uniqueSessions?.toLocaleString() || '0'}
              icon={Users}
              subtitle="Unique sessions"
            />
          </div>

          {/* Daily Traffic Trend - Always Visible */}
          <Card className="border-gray-200 transition-all hover:shadow-md hover:border-gray-300">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  Traffic This Week
                </CardTitle>
                {data?.traffic?.dailyTrends?.length > 1 &&
                  (() => {
                    const trends = data.traffic.dailyTrends;
                    const thisWeekTotal = trends.reduce(
                      (sum: number, d: { count: number }) => sum + d.count,
                      0
                    );
                    const avgPerDay = thisWeekTotal / trends.length;
                    const weekChange =
                      avgPerDay > 0
                        ? ((trends[trends.length - 1]?.count || 0) / avgPerDay -
                            1) *
                          100
                        : null;
                    if (weekChange === null) return null;
                    return (
                      <span
                        className={`text-sm font-medium flex items-center gap-1 ${
                          weekChange >= 0 ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {weekChange >= 0 ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                        {Math.abs(weekChange).toFixed(1)}% vs avg
                      </span>
                    );
                  })()}
              </div>
            </CardHeader>
            <CardContent>
              {data?.traffic?.dailyTrends?.length > 0 ? (
                <div className="flex items-end gap-2 h-32 pt-6">
                  {data.traffic.dailyTrends.map(
                    (day: { day: string; count: number }, i: number) => {
                      const maxCount = Math.max(
                        ...data.traffic.dailyTrends.map(
                          (d: { count: number }) => d.count
                        )
                      );
                      const heightPct =
                        maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                      const isToday = i === data.traffic.dailyTrends.length - 1;
                      const weekday = new Date(day.day).toLocaleDateString(
                        'en-US',
                        { weekday: 'short' }
                      );

                      return (
                        <div
                          key={day.day}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <span
                            className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-gray-500'}`}
                          >
                            {day.count.toLocaleString()}
                          </span>
                          <div
                            className={`w-full rounded-t-md transition-all ${
                              isToday
                                ? 'bg-blue-600 shadow-sm'
                                : 'bg-blue-400/70 hover:bg-blue-500'
                            }`}
                            style={{
                              height: `${Math.max(heightPct, 4)}%`,
                              minHeight: day.count > 0 ? '8px' : '2px',
                            }}
                            title={`${weekday}: ${day.count.toLocaleString()} views`}
                          />
                          <span
                            className={`text-xs ${
                              isToday
                                ? 'font-semibold text-blue-600'
                                : 'text-gray-400'
                            }`}
                          >
                            {isToday ? 'Today' : weekday}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <div className="text-gray-400 mb-2">
                    <BarChart3 size={32} className="mx-auto opacity-50" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Traffic data will appear here
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Data is automatically collected from site visitors
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Pages - Always Visible */}
          <Card className="border-gray-200 transition-all hover:shadow-md hover:border-gray-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye size={16} className="text-gray-400" />
                Most Visited Pages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data?.traffic?.topPages?.length > 0 ? (
                <div className="space-y-1">
                  {data.traffic.topPages
                    .slice(0, 5)
                    .map(
                      (
                        page: { path: string; pageviews: number },
                        i: number
                      ) => {
                        const maxPageviews =
                          data.traffic.topPages[0]?.pageviews || 1;
                        const percentage =
                          data.traffic.totalPageviews > 0
                            ? (page.pageviews / data.traffic.totalPageviews) *
                              100
                            : 0;
                        const barWidth = (page.pageviews / maxPageviews) * 100;

                        return (
                          <div key={page.path} className="relative py-2">
                            <div
                              className="absolute inset-y-0 left-0 bg-blue-50 rounded"
                              style={{ width: `${barWidth}%` }}
                            />
                            <div className="relative flex items-center gap-3">
                              <span className="text-xs text-gray-400 w-5 font-medium">
                                {i + 1}
                              </span>
                              <span className="flex-1 text-sm text-gray-700 truncate">
                                {page.path === '/' ? 'Home' : page.path}
                              </span>
                              <span className="text-sm font-medium text-gray-600 tabular-nums">
                                {page.pageviews.toLocaleString()}
                              </span>
                              <span className="text-xs text-gray-400 w-12 text-right">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        );
                      }
                    )}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <div className="text-gray-400 mb-2">
                    <Eye size={32} className="mx-auto opacity-50" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Page rankings will appear here
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Shows which pages get the most visits
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ===== ADVANCED METRICS (Collapsed by Default) ===== */}
          <CollapsibleSection
            title="Performance Details"
            icon={Activity}
            defaultOpen={false}
          >
            {/* Core Web Vitals */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                Core Web Vitals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {['LCP', 'FCP', 'CLS', 'TTFB', 'INP'].map(metric => (
                  <VitalCard
                    key={metric}
                    metric={metric}
                    data={vitalsMap[metric] || null}
                  />
                ))}
              </div>
            </div>

            {/* Performance Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3">
                  Performance Trends
                </h3>
                <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                  {['LCP', 'FCP', 'TTFB'].map(metric => (
                    <div key={metric} className="flex items-center gap-4">
                      <span className="w-12 text-sm font-medium text-gray-600">
                        {metric}
                      </span>
                      <div className="flex-1">
                        <Sparkline data={trendsByMetric[metric] || []} />
                      </div>
                      <span className="w-16 text-right text-sm text-gray-500">
                        {formatValue(vitalsMap[metric]?.p75_value, metric)}
                        {VITALS_CONFIG[metric]?.unit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3">
                  Device Breakdown
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <DeviceBreakdown
                    data={
                      data?.traffic?.deviceBreakdown || {
                        desktop: 0,
                        mobile: 0,
                        tablet: 0,
                        unknown: 0,
                      }
                    }
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Error Tracking - Collapsed */}
          <CollapsibleSection
            title={`Error Tracking ${data?.errors?.total > 0 ? `(${data.errors.total})` : ''}`}
            icon={AlertTriangle}
            defaultOpen={false}
          >
            {data?.errors?.recent?.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {data.errors.recent.map(
                  (error: {
                    id: string;
                    error_type: string;
                    message: string;
                    path: string;
                    created_at: string;
                  }) => (
                    <div
                      key={error.id}
                      className="p-3 bg-red-50/50 rounded-lg border border-red-100"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-red-600 uppercase">
                          {error.error_type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(error.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                        {error.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 font-mono">
                        {error.path}
                      </p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-500 mt-3">No errors recorded</p>
                <p className="text-xs text-gray-400 mt-1">
                  Your site is running smoothly
                </p>
              </div>
            )}
          </CollapsibleSection>

          {/* Extended Top Pages - Collapsed */}
          <CollapsibleSection
            title="Detailed Page Analytics"
            icon={BarChart3}
            defaultOpen={false}
          >
            {data?.traffic?.topPages?.length > 0 ? (
              <div className="space-y-2">
                {data.traffic.topPages.map(
                  (
                    page: {
                      path: string;
                      pageviews: number;
                      avg_lcp: number | null;
                    },
                    i: number
                  ) => (
                    <div
                      key={page.path}
                      className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="text-xs text-gray-400 w-6">{i + 1}</span>
                      <span className="flex-1 text-sm text-gray-700 truncate font-mono">
                        {page.path}
                      </span>
                      <span className="text-sm text-gray-500 w-20 text-right">
                        {page.pageviews} views
                      </span>
                      {page.avg_lcp && (
                        <span
                          className={`text-xs w-16 text-right ${getStatusColor(page.avg_lcp, 'LCP')}`}
                        >
                          {formatValue(page.avg_lcp, 'LCP')}ms LCP
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">
                No page data yet
              </p>
            )}
          </CollapsibleSection>
        </>
      )}
    </motion.div>
  );
}
