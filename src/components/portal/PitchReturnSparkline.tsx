'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PitchReturnSparklineProps {
  percentChange: number;
  pitchPrice?: number | null;
  currentPrice?: number | null;
}

export function PitchReturnSparkline({
  percentChange,
  pitchPrice,
  currentPrice,
}: PitchReturnSparklineProps) {
  const isPositive = percentChange >= 0;
  const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
  const bgColorClass = isPositive ? 'bg-green-50' : 'bg-red-50';
  
  // Create simple data for sparkline (start to end)
  const data = [
    { value: 0 },
    { value: percentChange * 0.3 },
    { value: percentChange * 0.6 },
    { value: percentChange * 0.8 },
    { value: percentChange },
  ];

  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={`flex items-center gap-2 ${bgColorClass} px-3 py-1.5 rounded-lg`}>
      <div className="flex items-center gap-1.5">
        <Icon className={`h-4 w-4 ${colorClass}`} />
        <span className={`font-semibold ${colorClass}`}>
          {isPositive ? '+' : ''}
          {percentChange.toFixed(2)}%
        </span>
      </div>
      <div className="w-16 h-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke={isPositive ? '#16a34a' : '#dc2626'}
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

