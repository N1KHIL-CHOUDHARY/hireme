import Link from 'next/link';
import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  href?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({
  title,
  value,
  description,
  icon,
  href,
  trend,
  className,
  ...props
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        'overflow-hidden bg-white border border-border rounded-lg p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,background-color] duration-150 ease-out',
        href && 'hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer active:scale-[0.99]',
        className
      )}
      {...props}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        {icon && <div className="size-4 text-slate-400">{icon}</div>}
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="text-2xl font-bold font-mono tracking-tight tabular-nums text-slate-900">
          {value}
        </div>
        {description && <p className="text-xs text-slate-500 leading-normal">{description}</p>}
        {trend && (
          <div
            className={cn(
              'mt-1.5 flex items-center text-xs font-medium font-mono tabular-nums',
              trend.isPositive ? 'text-[#16A34A]' : 'text-[#DC2626]'
            )}
          >
            <span className="mr-1">{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
            <span className="ml-1 font-sans text-slate-400">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block group">
        {content}
      </Link>
    );
  }

  return content;
}

