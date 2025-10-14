'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Github,
} from 'lucide-react';
import Link from 'next/link';

interface Pitch {
  id: string;
  ticker: string;
  team: 'value' | 'quant';
  pitch_date: string;
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

export default function PitchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pitchId = params?.id as string;

  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [performance, setPerformance] = useState<StockPerformance | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pitchId) {
      fetchPitch();
    }
  }, [pitchId]);

  const fetchPitch = async () => {
    try {
      setIsLoading(true);

      // Fetch pitch details
      const pitchRes = await fetch(`/api/pitches/${pitchId}`);
      const pitchData = await pitchRes.json();

      if (pitchRes.ok) {
        setPitch(pitchData);

        // Fetch stock performance
        const perfRes = await fetch(
          `/api/stock/performance?ticker=${pitchData.ticker}&pitchDate=${pitchData.pitch_date}`
        );
        const perfData = await perfRes.json();
        setPerformance(perfData);
      } else {
        console.error('Failed to fetch pitch');
      }
    } catch (error) {
      console.error('Error fetching pitch:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-32 mb-6" />
          <Skeleton className="h-24 w-full mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={() => router.push('/portal/dashboard/pitches')}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pitches
          </Button>
          <div className="text-center py-12">
            <p className="text-gray-500">Pitch not found</p>
          </div>
        </div>
      </div>
    );
  }

  const isPositive =
    performance &&
    performance.percentChange !== null &&
    performance.percentChange >= 0;
  const PerformanceIcon = isPositive ? TrendingUp : TrendingDown;
  const performanceColor = isPositive ? 'text-green-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Button
          onClick={() => router.push('/portal/dashboard/pitches')}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pitches
        </Button>

        {/* Header Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {pitch.ticker}
                  </h1>
                  <Link
                    href={`https://finance.yahoo.com/quote/${pitch.ticker}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#003E6B] hover:text-[#002C4D]"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </Link>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium uppercase">
                    {pitch.team}
                  </span>
                </div>
                <p className="text-gray-600">
                  Pitched on {formatDate(pitch.pitch_date)}
                </p>
              </div>

              {performance &&
                performance.percentChange !== null &&
                !performance.error && (
                  <div className="flex flex-col items-end">
                    <div className="text-sm text-gray-600 mb-1">
                      Current Performance
                    </div>
                    <div
                      className={`flex items-center gap-2 ${performanceColor} text-2xl font-bold`}
                    >
                      <PerformanceIcon className="h-6 w-6" />
                      <span>
                        {isPositive ? '+' : ''}
                        {performance.pointsChange?.toFixed(2)}
                      </span>
                    </div>
                    <div
                      className={`${performanceColor} text-lg font-semibold`}
                    >
                      {isPositive ? '+' : ''}
                      {performance.percentChange?.toFixed(2)}%
                    </div>
                  </div>
                )}
            </div>

            {/* GitHub Link for Quant Pitches */}
            {pitch.team === 'quant' && pitch.github_url && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  href={pitch.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#003E6B] hover:text-[#002C4D] font-medium"
                >
                  <Github className="h-5 w-5" />
                  View GitHub Repository
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Investment Thesis / Report */}
          {pitch.pdf_report_path && (
            <Card className="h-[600px] md:h-[800px]">
              <CardHeader>
                <CardTitle>Investment Thesis</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                <iframe
                  src={pitch.pdf_report_path}
                  className="w-full h-full border-0 rounded"
                  title="Investment Thesis PDF"
                />
              </CardContent>
            </Card>
          )}

          {/* Excel Model (for VALUE team) */}
          {pitch.team === 'value' && pitch.excel_model_path && (
            <Card className="h-[600px] md:h-[800px]">
              <CardHeader>
                <CardTitle>Excel Model</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-80px)]">
                <iframe
                  src={pitch.excel_model_path}
                  className="w-full h-full border-0 rounded"
                  title="Excel Model"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* No files available message */}
        {!pitch.pdf_report_path && !pitch.excel_model_path && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500">
                No files available for this pitch.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
