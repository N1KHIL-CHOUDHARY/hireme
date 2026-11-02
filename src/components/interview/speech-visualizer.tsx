'use client';

import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

interface SpeechVisualizerProps {
  isListening: boolean;
  className?: string;
}

export function SpeechVisualizer({ isListening, className }: SpeechVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bars = 16;
    const barWidth = canvas.width / bars;
    const barMargin = 2;
    const minBarHeight = 2;

    const drawBars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isListening) {
        // When not listening, show minimal flat bars in subtle primary blue
        for (let i = 0; i < bars; i++) {
          const x = i * barWidth + barMargin / 2;
          const barWidthWithMargin = barWidth - barMargin;
          ctx.fillStyle = 'rgba(37, 99, 235, 0.2)';
          ctx.fillRect(x, canvas.height - minBarHeight, barWidthWithMargin, minBarHeight);
        }
        return;
      }

      // When listening, show animated bars with primary blue scale
      for (let i = 0; i < bars; i++) {
        const x = i * barWidth + barMargin / 2;
        const barWidthWithMargin = barWidth - barMargin;

        const baseHeight = Math.sin(Date.now() / 200 + i) * 10 + 15;
        const variance = Math.sin(Date.now() / 100 + i * 2) * 5;
        const height = Math.max(minBarHeight, baseHeight + variance);

        // Linear gradient in primary blue shades (#2563EB to #60A5FA)
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(37, 99, 235, 0.9)');
        gradient.addColorStop(1, 'rgba(96, 165, 250, 0.5)');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - height, barWidthWithMargin, height);
      }

      animationRef.current = requestAnimationFrame(drawBars);
    };

    drawBars();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening]);

  return (
    <div className={cn('flex items-center justify-center w-full h-10', className)}>
      <canvas ref={canvasRef} width={200} height={40} className="w-full max-w-[200px]" />
    </div>
  );
}
