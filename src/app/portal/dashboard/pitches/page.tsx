'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, ExternalLink, Settings } from 'lucide-react';
import Link from 'next/link';
import { useSupabaseUser } from '@/hooks/useSupabaseUser';
import { downloadMultipleFiles } from '@/lib/utils/fileHelpers';

interface Pitch {
  id: string;
  ticker: string;
  team: 'value' | 'quant';
  pitch_date: string;
  exchange?: 'NASDAQ' | 'NYSE';
  excel_model_path?: string;
  pdf_report_path?: string;
  github_url?: string;
  created_at: string;
  updated_at: string;
}

interface StockPerformance {
  ticker: string;
  currentPrice: number | null;
  pitchPrice: number | null;
  pointsChange: number | null;
  percentChange: number | null;
  error?: string;
}

type SortField = 'ticker' | 'date' | 'return';
type SortDirection = 'asc' | 'desc';

export default function PitchesPage() {
  const router = useRouter();
  const { user } = useSupabaseUser();
  const [valuePitches, setValuePitches] = useState<Pitch[]>([]);
  const [quantPitches, setQuantPitches] = useState<Pitch[]>([]);
  const [performances, setPerformances] = useState<
    Map<string, StockPerformance>
  >(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'value' | 'quant'>('value');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    fetchPitches();
  }, []);

  const fetchPitches = async () => {
    try {
      setIsLoading(true);

      // Fetch value pitches
      const valueRes = await fetch('/api/pitches?team=value');
      const valueData = await valueRes.json();
      setValuePitches(Array.isArray(valueData) ? valueData : []);

      // Fetch quant pitches
      const quantRes = await fetch('/api/pitches?team=quant');
      const quantData = await quantRes.json();
      setQuantPitches(Array.isArray(quantData) ? quantData : []);

      // Fetch performances for all pitches
      const allPitches = [
        ...(Array.isArray(valueData) ? valueData : []),
        ...(Array.isArray(quantData) ? quantData : []),
      ];
      await fetchPerformances(allPitches);
    } catch (error) {
      console.error('Error fetching pitches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPerformances = async (pitches: Pitch[]) => {
    const perfMap = new Map<string, StockPerformance>();

    for (const pitch of pitches) {
      try {
        const res = await fetch(
          `/api/stock/performance?ticker=${pitch.ticker}&pitchDate=${pitch.pitch_date}`
        );
        const data = await res.json();
        perfMap.set(pitch.id, data);
      } catch (error) {
        console.error(`Error fetching performance for ${pitch.ticker}:`, error);
      }
    }

    setPerformances(perfMap);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Sort and filter pitches
  const getSortedAndFilteredPitches = (pitches: Pitch[]) => {
    let filtered = pitches;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(pitch =>
        pitch.ticker.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    return filtered.sort((a, b) => {
      let comparison = 0;

      if (sortField === 'ticker') {
        comparison = a.ticker.localeCompare(b.ticker);
      } else if (sortField === 'date') {
        comparison =
          new Date(a.pitch_date).getTime() - new Date(b.pitch_date).getTime();
      } else if (sortField === 'return') {
        const perfA = performances.get(a.id);
        const perfB = performances.get(b.id);
        const returnA = perfA?.percentChange ?? -Infinity;
        const returnB = perfB?.percentChange ?? -Infinity;
        comparison = returnA - returnB;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleDownloadAll = async (pitch: Pitch) => {
    const files = [];
    if (pitch.pdf_report_path) {
      files.push({
        url: pitch.pdf_report_path,
        filename: `${pitch.ticker}-Report.pdf`,
      });
    }
    if (pitch.excel_model_path) {
      files.push({
        url: pitch.excel_model_path,
        filename: `${pitch.ticker}-Model.xlsx`,
      });
    }
    await downloadMultipleFiles(files);
  };

  const filteredValuePitches = useMemo(
    () => getSortedAndFilteredPitches(valuePitches),
    [valuePitches, searchQuery, sortField, sortDirection, performances]
  );

  const filteredQuantPitches = useMemo(
    () => getSortedAndFilteredPitches(quantPitches),
    [quantPitches, searchQuery, sortField, sortDirection, performances]
  );

  const renderPerformance = (pitchId: string) => {
    const perf = performances.get(pitchId);

    if (!perf || perf.percentChange === null) {
      return <span className="text-gray-500">Loading...</span>;
    }

    if (perf.error) {
      return <span className="text-gray-500 text-sm">N/A</span>;
    }

    const isPositive = perf.percentChange >= 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <div className={`flex items-center gap-2 ${colorClass} font-semibold`}>
        <Icon className="h-4 w-4" />
        <span>
          {isPositive ? '+' : ''}
          {perf.pointsChange?.toFixed(2)} ({isPositive ? '+' : ''}
          {perf.percentChange?.toFixed(2)}%)
        </span>
      </div>
    );
  };

  const renderPitchRow = (pitch: Pitch) => (
    <tr
      key={pitch.id}
      onClick={() => router.push(`/portal/dashboard/pitches/${pitch.id}`)}
      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <td className="px-6 py-4">
        <Link
          href={`https://finance.yahoo.com/quote/${pitch.ticker}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-[#003E6B] hover:text-[#002C4D] font-semibold flex items-center gap-1"
        >
          {pitch.ticker}
          <ExternalLink className="h-3 w-3" />
        </Link>
      </td>
      <td className="px-6 py-4 text-gray-700">
        {formatDate(pitch.pitch_date)}
      </td>
      <td className="px-6 py-4">{renderPerformance(pitch.id)}</td>
    </tr>
  );

  const renderPitchCard = (pitch: Pitch) => (
    <Card
      key={pitch.id}
      onClick={() => router.push(`/portal/dashboard/pitches/${pitch.id}`)}
      className="cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link
            href={`https://finance.yahoo.com/quote/${pitch.ticker}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-lg font-bold text-[#003E6B] hover:text-[#002C4D] flex items-center gap-1"
          >
            {pitch.ticker}
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
        <div className="text-sm text-gray-600 mb-2">
          Pitched: {formatDate(pitch.pitch_date)}
        </div>
        <div className="mt-2">{renderPerformance(pitch.id)}</div>
      </CardContent>
    </Card>
  );

  const renderPitchesList = (pitches: Pitch[]) => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      );
    }

    if (pitches.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p>No pitches found for this team.</p>
        </div>
      );
    }

    return (
      <>
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticker
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Pitched
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Live Return to Date
                </th>
              </tr>
            </thead>
            <tbody>{pitches.map(renderPitchRow)}</tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden grid gap-4">
          {pitches.map(renderPitchCard)}
        </div>
      </>
    );
  };

  return (
    <div className="min-h-screen text-pgi-dark-blue pt-20 lg:pt-0">
      <div className="mx-auto">
        {/* Tabs */}
        <Tabs
          defaultValue="value"
          value={activeTab}
          onValueChange={value => setActiveTab(value as 'value' | 'quant')}
        >
          <div className="flex justify-between items-center mb-8">
            <TabsList className="grid w-auto sm:w-full max-w-md grid-cols-2">
              <TabsTrigger value="value">VALUE</TabsTrigger>
              <TabsTrigger value="quant">QUANT</TabsTrigger>
            </TabsList>
            {user?.org_permission_level === 'admin' && (
              <Button
                onClick={() => router.push('/portal/dashboard/pitches/admin')}
                variant="outline"
                className="gap-2 text-xs sm:text-base"
              >
                <Settings className="h-4 w-4" />
                Manage <span className="hidden sm:inline">Pitches</span>
              </Button>
            )}
          </div>

          <TabsContent value="value" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>VALUE Team Pitches</CardTitle>
              </CardHeader>
              <CardContent>{renderPitchesList(valuePitches)}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quant" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>QUANT Team Pitches</CardTitle>
              </CardHeader>
              <CardContent>{renderPitchesList(quantPitches)}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
