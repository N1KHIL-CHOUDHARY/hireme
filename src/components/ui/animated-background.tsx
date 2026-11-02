'use client';

import React from 'react';

import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
  patternColor?: string;
  patternOpacity?: number;
  animate?: boolean;
  colorScheme?: 'blue' | 'purple' | 'cyan' | 'indigo' | 'default';
}

export function AnimatedBackground({ children, className }: AnimatedBackgroundProps) {
  return (
    <div className={cn('relative min-h-screen w-full bg-slate-50 text-slate-900', className)}>
      {/* Subtle background ambient dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #0F172A 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* Content wrapper */}
      <div className="relative z-10 flex min-h-screen w-full items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
