'use client';

import './ai-interview.css';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

interface AIInterviewBackgroundProps {
  className?: string;
}

export function AIInterviewBackground({ className }: AIInterviewBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={cn('absolute inset-0 overflow-hidden -z-10', className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 to-white/70" />
      <Image
        src="/ai-interview-background.svg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover ai-circuit-pattern invert opacity-30"
        priority
      />
    </div>
  );
}
