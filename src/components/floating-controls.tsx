'use client';

import { motion } from 'framer-motion';
import { Home } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { LanguageSelector } from '@/components/language-selector';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FloatingControlsProps {
  className?: string;
  side?: 'left' | 'right';
}

export function FloatingControls({ className, side = 'right' }: FloatingControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -10 : 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={cn(
        'fixed z-50 flex flex-col items-center gap-3 p-2 rounded-lg bg-white border border-border shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        side === 'left' ? 'left-4' : 'right-4',
        'top-1/2 -translate-y-1/2',
        className
      )}
    >
      <Link href="/">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-md text-slate-600 hover:text-primary hover:bg-blue-50"
        >
          <Home size={18} />
          <span className="sr-only">Home</span>
        </Button>
      </Link>
      <LanguageSelector />
    </motion.div>
  );
}
