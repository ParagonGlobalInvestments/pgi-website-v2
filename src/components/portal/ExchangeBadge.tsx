import { cn } from '@/utils';

interface ExchangeBadgeProps {
  exchange: 'NASDAQ' | 'NYSE';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ExchangeBadge({
  exchange,
  className,
  size = 'md',
}: ExchangeBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const colorClasses = {
    NASDAQ: 'bg-blue-100 text-blue-700 border-blue-300',
    NYSE: 'bg-green-100 text-green-700 border-green-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md border',
        sizeClasses[size],
        colorClasses[exchange],
        className
      )}
    >
      {exchange}
    </span>
  );
}
