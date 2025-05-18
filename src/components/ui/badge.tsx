import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#00172B] text-white hover:bg-[#002C4D]/80',
        secondary:
          'border-transparent bg-gray-100 text-gray-900 hover:bg-gray-200/80',
        destructive:
          'border-transparent bg-red-500 text-slate-50 hover:bg-red-500/80',
        outline:
          'text-foreground border border-input hover:bg-accent hover:text-accent-foreground',
        blue: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200/80',
        purple:
          'border-transparent bg-purple-100 text-purple-800 hover:bg-purple-200/80',
        teal: 'border-transparent bg-teal-100 text-teal-800 hover:bg-teal-200/80',
        amber:
          'border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
