import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/utils';
import { Button, ButtonProps } from './button';
import type { LucideIcon } from 'lucide-react';

interface ActionButtonProps extends ButtonProps {
  icon?: React.ReactNode;
  href?: string;
  showPulse?: boolean;
  className?: string;
}

export function ActionButton({
  children,
  icon,
  href,
  showPulse = false,
  className,
  ...props
}: ActionButtonProps) {
  const buttonContent = (
    <Button
      className={cn(
        'relative flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg',
        className
      )}
      {...props}
    >
      {showPulse && (
        <span className="absolute top-0 right-0 flex h-3 w-3 -mt-1 -mr-1">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
        </span>
      )}
      {icon && <motion.span whileTap={{ scale: 0.9 }}>{icon}</motion.span>}
      {children}
    </Button>
  );

  if (href) {
    return <Link href={href}>{buttonContent}</Link>;
  }

  return buttonContent;
}

export function ActionIconButton({
  icon: Icon,
  label,
  ...props
}: {
  icon: LucideIcon;
  label: string;
} & Omit<ActionButtonProps, 'icon' | 'children'>) {
  return (
    <ActionButton icon={<Icon className="w-4 h-4" />} {...props}>
      {label}
    </ActionButton>
  );
}
